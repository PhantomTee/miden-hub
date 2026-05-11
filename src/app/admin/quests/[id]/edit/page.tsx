import { verifyAdmin } from "@/lib/dal"
import { db } from "@/lib/db"
import { QuestForm } from "@/components/admin/QuestForm"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditQuestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await verifyAdmin()
  const { id } = await params

  const quest = await db.quest.findUnique({ where: { id } })
  if (!quest) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/admin/quests"
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quests
      </Link>
      <h1 className="text-2xl font-bold mb-8">Edit Quest</h1>
      <QuestForm
        questId={quest.id}
        defaultValues={{
          title: quest.title,
          description: quest.description,
          category: quest.category,
          points: quest.points,
          verificationType: quest.verificationType,
          verificationParams: quest.verificationParams as Record<string, string>,
          isActive: quest.isActive,
          maxCompletions: quest.maxCompletions,
        }}
      />
    </div>
  )
}
