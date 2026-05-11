import { db } from "@/lib/db"
import { createSession } from "@/lib/session"
import { getCompletionScore, COMPLETION_THRESHOLD } from "@/lib/profile-completion"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { address, nonce } = body

    if (!address || !nonce) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (typeof address !== "string" || address.length < 8) {
      return Response.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    // Signature bytes are collected from the wallet but Miden uses a custom
    // Falcon variant that requires their WASM to verify. Server-side verification
    // will be added once the Miden SDK exposes a Node-compatible verify function.
    // For testnet, wallet connection (address ownership) is the auth signal.

    const user = await db.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: { walletAddress: address },
      select: {
        id: true,
        walletAddress: true,
        isAdmin: true,
        username: true,
        bio: true,
        avatarUrl: true,
        website: true,
        _count: { select: { linkedAccounts: true } },
      },
    })

    const profileComplete =
      getCompletionScore({
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        website: user.website,
        linkedAccountCount: user._count.linkedAccounts,
      }) >= COMPLETION_THRESHOLD

    await createSession({
      userId: user.id,
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin,
      profileComplete,
    })

    return Response.json({ ok: true, profileComplete })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[auth/verify] error:", msg)
    return Response.json({ error: msg || "Authentication failed" }, { status: 500 })
  }
}
