import { verifyAdmin } from "@/lib/dal"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users, Zap, Trophy, Upload } from "lucide-react"

export default async function AdminPage() {
  await verifyAdmin()

  const [totalUsers, totalQuests, totalCompletions, pendingSubmissions] = await Promise.all([
    db.user.count(),
    db.quest.count({ where: { isActive: true } }),
    db.completion.count({ where: { status: "VERIFIED" } }),
    db.submission.count({ where: { status: "PENDING" } }),
  ])

  const recentQuests = await db.quest.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { completions: true } } },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Manage Miden Hub</p>
        </div>
        <Link href="/admin/quests/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Quest
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: totalUsers, icon: Users, href: "/admin/users" },
          { label: "Active Quests", value: totalQuests, icon: Zap, href: "/admin/quests" },
          { label: "Completions", value: totalCompletions, icon: Trophy, href: null },
          { label: "Pending Reviews", value: pendingSubmissions, icon: Upload, href: "/admin/submissions" },
        ].map((stat) => (
          <Card key={stat.label} className={stat.href ? "cursor-pointer hover:border-[var(--brand)] transition-colors" : ""}>
            {stat.href ? (
              <Link href={stat.href}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 miden-gradient flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            ) : (
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 miden-gradient flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Submissions shortcut */}
      {pendingSubmissions > 0 && (
        <Link href="/admin/submissions">
          <Card className="mb-6 border-[var(--miden-purple)]/40 hover:border-[var(--miden-purple)] transition-colors cursor-pointer">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--miden-purple)]/20 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-[var(--miden-purple-light)]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {pendingSubmissions} submission{pendingSubmissions !== 1 ? "s" : ""} awaiting review
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">Click to review</p>
                  </div>
                </div>
                <span className="text-[var(--miden-purple-light)] text-sm">Review →</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Recent quests */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Quests</h2>
        <Link href="/admin/quests" className="text-sm text-[var(--miden-purple-light)] hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {recentQuests.map((quest) => (
          <div
            key={quest.id}
            className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]"
          >
            <div>
              <p className="font-medium text-sm">{quest.title}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {quest.points} pts · {quest._count.completions} completions ·{" "}
                <span className={quest.isActive ? "text-emerald-400" : "text-red-400"}>
                  {quest.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/quests/${quest.id}/edit`}>
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
