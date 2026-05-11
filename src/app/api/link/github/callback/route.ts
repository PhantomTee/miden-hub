import { db } from "@/lib/db"
import { getSession, refreshSession } from "@/lib/session"
import { getCompletionScore, COMPLETION_THRESHOLD } from "@/lib/profile-completion"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const session = await getSession()
  if (!session || !code) {
    return NextResponse.redirect(new URL("/", appUrl))
  }

  // Verify state matches the userId we set in /start
  if (state !== session.userId) {
    return NextResponse.redirect(new URL(`/profile/${session.walletAddress}?error=oauth_state`, appUrl))
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
    })
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
    if (!tokenData.access_token) throw new Error("No access token")

    // Fetch GitHub user - we only need login (username) and id
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const ghUser = await userRes.json() as { id: number; login: string }

    // Upsert linked account - no token stored, just username + provider ID
    await db.linkedAccount.upsert({
      where: { userId_provider: { userId: session.userId, provider: "GITHUB" } },
      create: {
        userId: session.userId,
        provider: "GITHUB",
        providerId: String(ghUser.id),
        providerUsername: ghUser.login,
      },
      update: {
        providerId: String(ghUser.id),
        providerUsername: ghUser.login,
      },
    })

    // Refresh session profileComplete flag
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        username: true, bio: true, avatarUrl: true, website: true,
        _count: { select: { linkedAccounts: true } },
      },
    })
    if (user) {
      const profileComplete = getCompletionScore({
        username: user.username, bio: user.bio, avatarUrl: user.avatarUrl,
        website: user.website, linkedAccountCount: user._count.linkedAccounts,
      }) >= COMPLETION_THRESHOLD
      await refreshSession({ profileComplete })
    }

    return NextResponse.redirect(new URL(`/profile/${session.walletAddress}`, appUrl))
  } catch {
    return NextResponse.redirect(new URL(`/profile/${session.walletAddress}?error=github_link_failed`, appUrl))
  }
}
