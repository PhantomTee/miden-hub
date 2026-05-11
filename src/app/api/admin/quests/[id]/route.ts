import { db } from "@/lib/db"
import { verifyAdmin } from "@/lib/dal"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await params
    const body = await request.json()
    const quest = await db.quest.update({ where: { id }, data: body })
    return Response.json(quest)
  } catch (err) {
    console.error("[admin/quests/:id PATCH]", err)
    return Response.json({ error: "Failed to update quest" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await params
    await db.quest.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch (err) {
    console.error("[admin/quests/:id DELETE]", err)
    return Response.json({ error: "Failed to delete quest" }, { status: 500 })
  }
}
