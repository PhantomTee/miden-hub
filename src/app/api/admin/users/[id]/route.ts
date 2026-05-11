import { db } from "@/lib/db"
import { verifyAdmin } from "@/lib/dal"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await params
    const { pointsDelta } = await request.json()

    if (typeof pointsDelta !== "number") {
      return Response.json({ error: "pointsDelta must be a number" }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id },
      data: { totalPoints: { increment: pointsDelta } },
    })

    return Response.json(user)
  } catch (err) {
    console.error("[admin/users/:id PATCH]", err)
    return Response.json({ error: "Failed to update user" }, { status: 500 })
  }
}
