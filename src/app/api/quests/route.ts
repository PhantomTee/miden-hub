import { db } from "@/lib/db"
import { QuestCategory } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as QuestCategory | null

    const quests = await db.quest.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        points: true,
        verificationType: true,
        maxCompletions: true,
        createdAt: true,
        _count: { select: { completions: { where: { status: "VERIFIED" } } } },
      },
    })

    return Response.json(quests)
  } catch (err) {
    console.error("[quests GET]", err)
    return Response.json({ error: "Failed to load quests" }, { status: 500 })
  }
}
