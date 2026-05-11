import { db } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!session.profileComplete) {
      return Response.json(
        { error: "Complete your profile to like submissions", code: "PROFILE_INCOMPLETE" },
        { status: 403 }
      )
    }

    const { id } = await params

    const submission = await db.submission.findUnique({ where: { id } })
    if (!submission) return Response.json({ error: "Not found" }, { status: 404 })
    if (submission.status !== "APPROVED") {
      return Response.json({ error: "Cannot like unapproved submission" }, { status: 400 })
    }
    if (submission.userId === session.userId) {
      return Response.json({ error: "Cannot like your own submission" }, { status: 400 })
    }

    const existing = await db.like.findUnique({
      where: { userId_submissionId: { userId: session.userId, submissionId: id } },
    })

    if (existing) {
      await db.like.delete({ where: { id: existing.id } })
      const count = await db.like.count({ where: { submissionId: id } })
      return Response.json({ liked: false, count })
    } else {
      await db.like.create({ data: { userId: session.userId, submissionId: id } })
      const count = await db.like.count({ where: { submissionId: id } })
      return Response.json({ liked: true, count })
    }
  } catch (err) {
    console.error("[like]", err)
    return Response.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
