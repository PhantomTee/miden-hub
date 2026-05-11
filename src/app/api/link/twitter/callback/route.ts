import { db } from "@/lib/db"
import { getSession, refreshSession } from "@/lib/session"
import { getCompletionScore, COMPLETION_THRESHOLD } from "@/lib/profile-completion"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const session = await getSession()
  const storedVerifier = request.cookies.get("tw_verifier")?.value
  const storedState = request.cookies.get("tw_state")?.value

  if (!session || !code || !storedVerifier || state !== storedState) {
    return NextResponse.redirect(new URL("/", appUrl))
  }

  try {
    // Exchange code for access token
    const credentials = Buffer.from(
      `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
    ).toString("base64")

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.TWITTER_REDIRECT_URI!,
        code_verifier: storedVerifier,
      }),
    })
    const tokenData = await tokenRes.json() as { access_token?: string }
    if (!tokenData.access_token) throw new Error("No access token")

    // Fetch Twitter user - only need id and username
    const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=username", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const { data: twUser } = await userRes.json() as { data: { id: string; username: string } }

    await db.linkedAccount.upsert({
      where: { userId_provider: { userId: session.userId, provider: "TWITTER" } },
      create: {
        userId: session.userId,
        provider: "TWITTER",
        providerId: twUser.id,
        providerUsername: twUser.username,
      },
      update: {
        providerId: twUser.id,
        providerUsername: twUser.username,
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

    const res = NextResponse.redirect(new URL(`/profile/${session.walletAddress}`, appUrl))
    // Clear PKCE cookies
    res.cookies.delete("tw_verifier")
    res.cookies.delete("tw_state")
    return res
  } catch {
    const res = NextResponse.redirect(
      new URL(`/profile/${session.walletAddress}?error=twitter_link_failed`, appUrl)
    )
    res.cookies.delete("tw_verifier")
    res.cookies.delete("tw_state")
    return res
  }
}
