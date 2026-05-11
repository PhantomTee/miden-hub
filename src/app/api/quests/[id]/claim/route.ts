import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { verifyQuest } from "@/lib/verification"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const quest = await db.quest.findUnique({ where: { id, isActive: true } })
    if (!quest) return Response.json({ error: "Quest not found" }, { status: 404 })

    const existing = await db.completion.findUnique({
      where: { userId_questId: { userId: session.userId, questId: id } },
    })
    if (existing) return Response.json({ error: "Already claimed" }, { status: 409 })

    const verified = await verifyQuest(quest, session, body)

    const completion = await db.completion.create({
      data: {
        userId: session.userId,
        questId: id,
        status: verified ? "VERIFIED" : "FAILED",
        pointsAwarded: verified ? quest.points : 0,
      },
    })

    if (verified) {
      await db.user.update({
        where: { id: session.userId },
        data: { totalPoints: { increment: quest.points } },
      })
    }

    return Response.json({ status: completion.status, pointsAwarded: completion.pointsAwarded })
  } catch (err) {
    console.error("[quests/:id/claim]", err)
    return Response.json({ error: "Failed to claim quest" }, { status: 500 })
  }
}
