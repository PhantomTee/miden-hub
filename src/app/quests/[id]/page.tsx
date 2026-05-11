import { db } from "@/lib/db"
import { getOptionalSession } from "@/lib/dal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClaimButton } from "@/components/quests/ClaimButton"
import { notFound } from "next/navigation"
import { Star, Users, CheckCircle2, ArrowLeft, Zap, GitBranch, X } from "lucide-react"
import Link from "next/link"

const categoryConfig = {
  ONCHAIN: { label: "On-Chain", variant: "onchain" as const, icon: Zap },
  GITHUB: { label: "GitHub", variant: "github" as const, icon: GitBranch },
  SOCIAL: { label: "Social", variant: "social" as const, icon: X },
  COMMUNITY: { label: "Community", variant: "community" as const, icon: Users },
}

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getOptionalSession()

  const quest = await db.quest.findUnique({
    where: { id, isActive: true },
    include: {
      _count: { select: { completions: { where: { status: "VERIFIED" } } } },
    },
  })

  if (!quest) notFound()

  const completion = session
    ? await db.completion.findUnique({
        where: { userId_questId: { userId: session.userId, questId: id } },
      })
    : null

  const cat = categoryConfig[quest.category]
  const Icon = cat.icon
  const params_ = quest.verificationParams as Record<string, string>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/quests"
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quests
      </Link>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={cat.variant} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {cat.label}
            </Badge>
            {completion?.status === "VERIFIED" && (
              <Badge variant="secondary" className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{quest.title}</h1>
        </div>

        <div className="flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5 text-[var(--miden-purple-light)] font-semibold text-base">
            <Star className="h-5 w-5" />
            {quest.points} points
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {quest._count.completions} completed
          </div>
          {quest.maxCompletions && (
            <div className="text-xs">Max {quest.maxCompletions} completions</div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)] leading-relaxed">{quest.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--muted-foreground)]">
            {quest.verificationType === "GITHUB_STAR" && params_.repoOwner && (
              <p>
                Star the GitHub repo:{" "}
                <a
                  href={`https://github.com/${params_.repoOwner}/${params_.repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--miden-purple-light)] hover:underline"
                >
                  {params_.repoOwner}/{params_.repoName}
                </a>
              </p>
            )}
            {quest.verificationType === "GITHUB_PR" && params_.repoOwner && (
              <p>
                Submit a pull request to{" "}
                <a
                  href={`https://github.com/${params_.repoOwner}/${params_.repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--miden-purple-light)] hover:underline"
                >
                  {params_.repoOwner}/{params_.repoName}
                </a>
              </p>
            )}
            {quest.verificationType === "TWITTER_FOLLOW" && (
              <p>
                Follow{" "}
                <a
                  href={`https://twitter.com/${params_.accountToFollow}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--miden-purple-light)] hover:underline"
                >
                  @{params_.accountToFollow}
                </a>{" "}
                on X
              </p>
            )}
            {quest.verificationType === "TWITTER_RETWEET" && <p>Retweet the specified post on X</p>}
            {quest.verificationType === "TELEGRAM_JOIN" && <p>Join the Miden Telegram channel</p>}
            {quest.verificationType === "MIDEN_TX" && (
              <p>Submit a transaction on the Miden testnet</p>
            )}
          </CardContent>
        </Card>

        <ClaimButton
          questId={quest.id}
          verificationType={quest.verificationType}
          completionStatus={completion?.status ?? null}
          isLoggedIn={!!session}
        />
      </div>
    </div>
  )
}
