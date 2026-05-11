import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period")

    if (period === "weekly") {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekly = await db.completion.groupBy({
        by: ["userId"],
        where: { status: "VERIFIED", completedAt: { gte: weekStart } },
        _sum: { pointsAwarded: true },
        orderBy: { _sum: { pointsAwarded: "desc" } },
        take: 100,
      })

      const userIds = weekly.map((r) => r.userId)
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, walletAddress: true, username: true, avatarUrl: true },
      })

      const userMap = new Map(users.map((u) => [u.id, u]))
      const result = weekly
        .map((r, i) => ({
          rank: i + 1,
          ...userMap.get(r.userId),
          weeklyPoints: r._sum.pointsAwarded ?? 0,
        }))
        .filter((r) => r.id)

      return Response.json(result)
    }

    const users = await db.user.findMany({
      where: { totalPoints: { gt: 0 } },
      orderBy: { totalPoints: "desc" },
      take: 100,
      select: {
        id: true,
        walletAddress: true,
        username: true,
        avatarUrl: true,
        totalPoints: true,
        createdAt: true,
        _count: { select: { completions: { where: { status: "VERIFIED" } } } },
      },
    })

    return Response.json(users.map((u, i) => ({ rank: i + 1, ...u })))
  } catch (err) {
    console.error("[leaderboard GET]", err)
    return Response.json({ error: "Failed to load leaderboard" }, { status: 500 })
  }
}
