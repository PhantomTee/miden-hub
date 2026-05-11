import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Star, Users, Zap, GitBranch, X } from "lucide-react"
import { QuestCategory, VerificationType } from "@prisma/client"

const categoryConfig = {
  ONCHAIN: { label: "On-Chain", variant: "onchain" as const, icon: Zap },
  GITHUB: { label: "GitHub", variant: "github" as const, icon: GitBranch },
  SOCIAL: { label: "Social", variant: "social" as const, icon: X },
  COMMUNITY: { label: "Community", variant: "community" as const, icon: Users },
}

interface QuestCardProps {
  quest: {
    id: string
    title: string
    description: string
    category: QuestCategory
    points: number
    verificationType: VerificationType
    maxCompletions: number | null
    _count: { completions: number }
  }
  completed: boolean
}

export function QuestCard({ quest, completed }: QuestCardProps) {
  const cat = categoryConfig[quest.category]
  const Icon = cat.icon

  return (
    <Link href={`/quests/${quest.id}`} className="block group">
      <Card className={`h-full transition-all hover:border-[var(--miden-purple)] hover:miden-glow ${completed ? "opacity-75" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={cat.variant} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {cat.label}
            </Badge>
            {completed && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
          </div>
          <CardTitle className="text-base mt-2 group-hover:text-[var(--miden-purple-light)] transition-colors">
            {quest.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{quest.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[var(--miden-purple-light)] font-semibold">
            <Star className="h-4 w-4" />
            <span>{quest.points} pts</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Users className="h-3.5 w-3.5" />
            <span>{quest._count.completions} completed</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
