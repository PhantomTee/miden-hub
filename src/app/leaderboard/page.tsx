import { db } from "@/lib/db"
import { getOptionalSession } from "@/lib/dal"
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period } = await searchParams
  const isWeekly = period === "weekly"
  const session = await getOptionalSession()

  let users
  if (isWeekly) {
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
    const userMap = new Map(
      (
        await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, walletAddress: true, username: true, totalPoints: true },
        })
      ).map((u) => [u.id, u])
    )

    users = weekly
      .map((r, i) => {
        const u = userMap.get(r.userId)
        if (!u) return null
        return { rank: i + 1, ...u, displayPoints: r._sum.pointsAwarded ?? 0 }
      })
      .filter(Boolean) as { rank: number; id: string; walletAddress: string; username: string | null; displayPoints: number }[]
  } else {
    const raw = await db.user.findMany({
      where: { totalPoints: { gt: 0 } },
      orderBy: { totalPoints: "desc" },
      take: 100,
      select: {
        id: true,
        walletAddress: true,
        username: true,
        totalPoints: true,
      },
    })
    users = raw.map((u, i) => ({ rank: i + 1, ...u, displayPoints: u.totalPoints }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg miden-gradient flex items-center justify-center">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-[var(--muted-foreground)] text-sm">Top contributors in the Miden ecosystem</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { label: "All Time", value: null },
          { label: "This Week", value: "weekly" },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/leaderboard?period=${t.value}` : "/leaderboard"}
            className={cn(
              "px-4 py-2 rounded-full text-sm border transition-colors",
              (t.value === "weekly") === isWeekly
                ? "bg-[var(--miden-purple)] border-[var(--miden-purple)] text-white"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--miden-purple)]"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <LeaderboardTable users={users} currentUserId={session?.userId} />
    </div>
  )
}
