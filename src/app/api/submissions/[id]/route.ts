import { db } from "@/lib/db"
import { verifyAdmin } from "@/lib/dal"
import { DEFAULT_POINTS } from "@/lib/submission-config"
import { z } from "zod"

const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  points: z.number().int().positive().optional(),
  adminNote: z.string().max(500).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin()
    const { id } = await params

    const body = await request.json()
    const parsed = ReviewSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const submission = await db.submission.findUnique({ where: { id } })
    if (!submission) return Response.json({ error: "Not found" }, { status: 404 })
    if (submission.status !== "PENDING") {
      return Response.json({ error: "Already reviewed" }, { status: 409 })
    }

    const { action, adminNote } = parsed.data
    const isApproved = action === "APPROVE"
    const pointsToAward = isApproved
      ? (parsed.data.points ?? DEFAULT_POINTS[submission.category])
      : 0

    const updated = await db.submission.update({
      where: { id },
      data: {
        status: isApproved ? "APPROVED" : "REJECTED",
        pointsAwarded: pointsToAward,
        adminNote: adminNote ?? null,
        reviewedAt: new Date(),
      },
    })

    if (isApproved) {
      await db.user.update({
        where: { id: submission.userId },
        data: { totalPoints: { increment: pointsToAward } },
      })
    }

    return Response.json(updated)
  } catch (err) {
    console.error("[submissions/:id PATCH]", err)
    return Response.json({ error: "Failed to review submission" }, { status: 500 })
  }
}
