import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { SubmissionCategory } from "@prisma/client"
import { z } from "zod"

const SubmitSchema = z.object({
  category: z.nativeEnum(SubmissionCategory),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  link: z.string().url(),
})

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!session.profileComplete) {
      return Response.json(
        { error: "Complete your profile to submit contributions", code: "PROFILE_INCOMPLETE" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = SubmitSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const submission = await db.submission.create({
      data: { userId: session.userId, ...parsed.data },
    })

    return Response.json(submission, { status: 201 })
  } catch (err) {
    console.error("[submissions POST]", err)
    return Response.json({ error: "Failed to create submission" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (address) {
      const user = await db.user.findUnique({ where: { walletAddress: address } })
      if (!user) return Response.json([], { status: 200 })
      if (user.id !== session.userId && !session.isAdmin) {
        return Response.json({ error: "Forbidden" }, { status: 403 })
      }
      const submissions = await db.submission.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
      return Response.json(submissions)
    }

    if (!session.isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 })

    const status = searchParams.get("status")
    const submissions = await db.submission.findMany({
      where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { walletAddress: true, username: true } } },
    })
    return Response.json(submissions)
  } catch (err) {
    console.error("[submissions GET]", err)
    return Response.json({ error: "Failed to load submissions" }, { status: 500 })
  }
}
