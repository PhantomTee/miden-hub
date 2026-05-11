import { verifyAdmin } from "@/lib/dal"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil } from "lucide-react"

export default async function AdminQuestsPage() {
  await verifyAdmin()

  const quests = await db.quest.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { completions: true } } },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">All Quests</h1>
        <Link href="/admin/quests/new">
          <Button><Plus className="h-4 w-4" />New Quest</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{quest.title}</p>
                <Badge variant={quest.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                  {quest.isActive ? "Active" : "Draft"}
                </Badge>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                {quest.category} · {quest.points} pts · {quest._count.completions} completions
              </p>
            </div>
            <Link href={`/admin/quests/${quest.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
