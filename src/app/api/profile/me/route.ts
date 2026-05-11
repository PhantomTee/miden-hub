import { db } from "@/lib/db"
import { getSession, refreshSession } from "@/lib/session"
import { getCompletionScore, COMPLETION_THRESHOLD } from "@/lib/profile-completion"
import { z } from "zod"

const UpdateSchema = z.object({
  username: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, _ . - only").optional(),
  bio: z.string().max(300).optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
})

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const { username, bio, website, avatarUrl } = parsed.data

    if (username) {
      const conflict = await db.user.findFirst({
        where: { username, NOT: { id: session.userId } },
      })
      if (conflict) return Response.json({ error: "Username already taken" }, { status: 409 })
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(username !== undefined ? { username } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(website !== undefined ? { website: website || null } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
      },
      select: {
        username: true,
        bio: true,
        avatarUrl: true,
        website: true,
        _count: { select: { linkedAccounts: true } },
      },
    })

    const score = getCompletionScore({
      username: updated.username,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      website: updated.website,
      linkedAccountCount: updated._count.linkedAccounts,
    })
    const profileComplete = score >= COMPLETION_THRESHOLD

    await refreshSession({ profileComplete })

    return Response.json({ ok: true, score, profileComplete })
  } catch (err) {
    console.error("[profile/me PATCH]", err)
    return Response.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        username: true,
        bio: true,
        avatarUrl: true,
        website: true,
        walletAddress: true,
        _count: { select: { linkedAccounts: true } },
      },
    })

    return Response.json(user)
  } catch (err) {
    console.error("[profile/me GET]", err)
    return Response.json({ error: "Failed to load profile" }, { status: 500 })
  }
}
