import { db } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const cursor = searchParams.get("cursor")
    const take = 20

    const submissions = await db.submission.findMany({
      where: {
        status: "APPROVED",
        ...(category ? { category: category as "TWEET" | "DAPP" | "ARTICLE" | "VIDEO" } : {}),
      },
      orderBy: { reviewedAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        user: { select: { walletAddress: true, username: true } },
        _count: { select: { likes: true } },
      },
    })

    // If logged in, fetch which ones the current user has liked in one query
    const likedIds = new Set<string>()
    if (session) {
      const myLikes = await db.like.findMany({
        where: {
          userId: session.userId,
          submissionId: { in: submissions.map((s) => s.id) },
        },
        select: { submissionId: true },
      })
      myLikes.forEach((l) => likedIds.add(l.submissionId))
    }

    const nextCursor =
      submissions.length === take ? submissions[submissions.length - 1]!.id : null

    const items = submissions.map((s) => ({
      id: s.id,
      category: s.category,
      title: s.title,
      description: s.description,
      link: s.link,
      pointsAwarded: s.pointsAwarded,
      reviewedAt: s.reviewedAt,
      user: s.user,
      likeCount: s._count.likes,
      likedByMe: likedIds.has(s.id),
      isOwn: session ? s.userId === session.userId : false,
    }))

    return Response.json({ items, nextCursor })
  } catch (err) {
    console.error("[feed]", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
