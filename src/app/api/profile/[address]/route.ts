import { db } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  const user = await db.user.findUnique({
    where: { walletAddress: address },
    select: {
      id: true,
      walletAddress: true,
      username: true,
      avatarUrl: true,
      totalPoints: true,
      createdAt: true,
      completions: {
        where: { status: "VERIFIED" },
        include: { quest: { select: { title: true, category: true, points: true } } },
        orderBy: { completedAt: "desc" },
      },
      linkedAccounts: { select: { provider: true, providerId: true } },
    },
  })

  if (!user) return Response.json({ error: "Not found" }, { status: 404 })

  const rank = await db.user.count({
    where: { totalPoints: { gt: user.totalPoints } },
  })

  return Response.json({ ...user, rank: rank + 1 })
}
