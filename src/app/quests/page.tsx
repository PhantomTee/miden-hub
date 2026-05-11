import { db } from "@/lib/db"
import { getOptionalSession } from "@/lib/dal"
import { QuestCard } from "@/components/quests/QuestCard"
import { QuestFilters } from "@/components/quests/QuestFilters"
import { QuestCategory } from "@prisma/client"

export default async function QuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const session = await getOptionalSession()

  const quests = await db.quest.findMany({
    where: {
      isActive: true,
      ...(category ? { category: category as QuestCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { completions: { where: { status: "VERIFIED" } } } },
    },
  })

  const completedQuestIds = session
    ? new Set(
        (
          await db.completion.findMany({
            where: { userId: session.userId, status: "VERIFIED" },
            select: { questId: true },
          })
        ).map((c) => c.questId)
      )
    : new Set<string>()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quests</h1>
        <p className="text-[var(--muted-foreground)]">
          Complete quests to earn points and climb the leaderboard
        </p>
      </div>

      <QuestFilters activeCategory={category} />

      {quests.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          No quests found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              completed={completedQuestIds.has(quest.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
