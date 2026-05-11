import { verifyAdmin } from "@/lib/dal"
import { QuestForm } from "@/components/admin/QuestForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewQuestPage() {
  await verifyAdmin()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/admin/quests"
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quests
      </Link>
      <h1 className="text-2xl font-bold mb-8">Create New Quest</h1>
      <QuestForm />
    </div>
  )
}
