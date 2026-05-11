import { db } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const quest = await db.quest.findUnique({
      where: { id },
      include: {
        _count: { select: { completions: { where: { status: "VERIFIED" } } } },
      },
    })

    if (!quest) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(quest)
  } catch (err) {
    console.error("[quests/:id GET]", err)
    return Response.json({ error: "Failed to load quest" }, { status: 500 })
  }
}
