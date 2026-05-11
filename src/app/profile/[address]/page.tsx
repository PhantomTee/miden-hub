import { db } from "@/lib/db"
import { getOptionalSession } from "@/lib/dal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Star, Trophy, CheckCircle2, GitBranch, X, Users,
  Clock, XCircle, ExternalLink, Pencil, Globe, AlertTriangle,
  Upload,
} from "lucide-react"
import { truncateAddress, formatPoints } from "@/lib/utils"
import {
  getCompletionItems,
  getCompletionScore,
  COMPLETION_THRESHOLD,
  type ProfileForCompletion,
} from "@/lib/profile-completion"

const categoryConfig = {
  ONCHAIN: { label: "On-Chain", variant: "onchain" as const },
  GITHUB: { label: "GitHub", variant: "github" as const },
  SOCIAL: { label: "Social", variant: "social" as const },
  COMMUNITY: { label: "Community", variant: "community" as const },
}

const subCategoryLabels: Record<string, string> = {
  TWEET: "Tweet",
  DAPP: "dApp",
  ARTICLE: "Article",
  VIDEO: "Video",
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ address: string }>
  searchParams: Promise<{ setup?: string }>
}) {
  const { address } = await params
  const { setup } = await searchParams
  const session = await getOptionalSession()

  const user = await db.user.findUnique({
    where: { walletAddress: address },
    include: {
      completions: {
        where: { status: "VERIFIED" },
        include: { quest: { select: { title: true, category: true, points: true } } },
        orderBy: { completedAt: "desc" },
      },
      linkedAccounts: { select: { provider: true, providerUsername: true } },
      // Fetch all submissions so we can compute stats accurately
      submissions: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!user) notFound()

  const rank = (await db.user.count({ where: { totalPoints: { gt: user.totalPoints } } })) + 1
  const isOwnProfile = session?.walletAddress === address
  const isAdmin = session?.isAdmin ?? false
  const canSeeAll = isOwnProfile || isAdmin

  const linkedProviders = new Map(user.linkedAccounts.map((a) => [a.provider, a.providerUsername]))

  // Submission stats
  const allSubs = user.submissions
  const approvedSubs = allSubs.filter((s) => s.status === "APPROVED")
  const pendingSubs = allSubs.filter((s) => s.status === "PENDING")
  const rejectedSubs = allSubs.filter((s) => s.status === "REJECTED")

  // Public sees only approved; owner/admin sees all, capped for display
  const displayedSubs = canSeeAll ? allSubs.slice(0, 20) : approvedSubs.slice(0, 10)

  const profileData: ProfileForCompletion = {
    username: user.username,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    website: user.website,
    linkedAccountCount: user.linkedAccounts.length,
  }
  const completionScore = getCompletionScore(profileData)
  const completionItems = getCompletionItems(profileData)
  const isComplete = completionScore >= COMPLETION_THRESHOLD

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Setup/incomplete banner */}
      {isOwnProfile && (!isComplete || setup === "1") && (
        <div className="mb-6 px-4 py-3 border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-300">Complete your profile to interact</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              You need {COMPLETION_THRESHOLD}% to submit contributions, like posts, and claim quests.
              You&apos;re at {completionScore}%. Set a username and bio to unlock access.
            </p>
          </div>
          <Link href="/profile/edit">
            <Button size="sm" className="shrink-0">Complete profile</Button>
          </Link>
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        <div className="shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username ?? "avatar"}
              className="w-16 h-16 object-cover border-2 border-[var(--brand)]"
            />
          ) : (
            <div className="w-16 h-16 miden-gradient flex items-center justify-center text-black text-2xl font-bold">
              {(user.username ?? user.walletAddress).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold truncate">
                {user.username ?? truncateAddress(user.walletAddress)}
              </h1>
              <p className="text-[var(--muted-foreground)] font-mono text-xs mt-0.5 truncate">
                {user.walletAddress}
              </p>
            </div>
            {isOwnProfile && (
              <Link href="/profile/edit" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-[var(--muted-foreground)] mt-3 max-w-xl">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-[var(--brand)] font-semibold text-sm">
              <Star className="h-4 w-4" />
              {formatPoints(user.totalPoints)} pts
            </span>
            <span className="flex items-center gap-1 text-[var(--muted-foreground)] text-sm">
              <Trophy className="h-4 w-4" />
              Rank #{rank}
            </span>
            <span className="flex items-center gap-1 text-[var(--muted-foreground)] text-sm">
              <CheckCircle2 className="h-4 w-4" />
              {user.completions.length} quests
            </span>
            <span className="flex items-center gap-1 text-[var(--muted-foreground)] text-sm">
              <Upload className="h-4 w-4" />
              {approvedSubs.length} contributions
            </span>
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--brand)] text-sm transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contribution stats (own profile / admin) */}
      {canSeeAll && allSubs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[var(--border)] mb-6">
          {[
            { label: "Total", value: allSubs.length, color: "text-[var(--foreground)]" },
            { label: "Approved", value: approvedSubs.length, color: "text-emerald-400" },
            { label: "Pending", value: pendingSubs.length, color: "text-yellow-400" },
            { label: "Rejected", value: rejectedSubs.length, color: "text-red-400" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`px-4 py-4 text-center ${i > 0 ? "border-l border-[var(--border)]" : ""}`}
            >
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mt-0.5 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile completion bar (own profile only) */}
      {isOwnProfile && (
        <Card className="mb-6">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Profile completion</span>
              <span className={`text-sm font-bold ${isComplete ? "text-emerald-400" : "text-yellow-400"}`}>
                {completionScore}%
              </span>
            </div>
            <div className="h-1.5 bg-[var(--border)] overflow-hidden mb-4">
              <div
                className={`h-full transition-all ${isComplete ? "bg-emerald-400" : "bg-yellow-400"}`}
                style={{ width: `${completionScore}%` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {completionItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-[var(--border)] shrink-0" />
                  )}
                  <span className={item.done ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}>
                    {item.label}
                  </span>
                  <span className="ml-auto text-xs text-[var(--muted-foreground)]">+{item.points}%</span>
                </div>
              ))}
            </div>
            {!isComplete && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <Link href="/profile/edit">
                  <Button size="sm" variant="outline" className="gap-1.5 w-full">
                    <Pencil className="h-3.5 w-3.5" />
                    Complete profile
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Linked accounts */}
      {isOwnProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {[
              { provider: "GITHUB", label: "GitHub", icon: GitBranch, href: "/api/link/github/start" },
              { provider: "TWITTER", label: "Twitter / X", icon: X, href: "/api/link/twitter/start" },
              {
                provider: "TELEGRAM",
                label: "Telegram",
                icon: Users,
                href: `https://t.me/MidenHubBot?start=${user.walletAddress}`,
              },
            ].map(({ provider, label, icon: Icon, href }) => {
              const username = linkedProviders.get(provider as "GITHUB" | "TWITTER" | "TELEGRAM")
              const linked = !!username
              return (
                <a
                  key={provider}
                  href={linked ? undefined : href}
                  target={!linked && provider === "TELEGRAM" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={linked ? "cursor-default" : undefined}
                >
                  <Button variant={linked ? "secondary" : "outline"} size="sm" className="gap-2" disabled={linked}>
                    <Icon className="h-4 w-4" />
                    {linked ? `@${username}` : `Link ${label}`}
                  </Button>
                </a>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Contributions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {canSeeAll ? "Contributions" : "Approved Contributions"}
          </h2>
          {isOwnProfile && (
            <Link href="/contribute">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Submit
              </Button>
            </Link>
          )}
        </div>

        {displayedSubs.length === 0 ? (
          <div className="py-10 text-center text-[var(--muted-foreground)] border border-[var(--border)]">
            {isOwnProfile ? (
              <>
                No contributions yet.{" "}
                <Link href="/contribute" className="text-[var(--brand)] hover:underline">
                  Submit your first one
                </Link>
              </>
            ) : (
              "No approved contributions yet."
            )}
          </div>
        ) : (
          <div className="border border-[var(--border)] divide-y divide-[var(--border)]">
            {displayedSubs.map((sub) => {
              const statusIcon =
                sub.status === "APPROVED" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : sub.status === "REJECTED" ? (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-400 shrink-0" />
                )

              return (
                <div key={sub.id} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {canSeeAll && statusIcon}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{sub.title}</p>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-bold shrink-0">
                          {subCategoryLabels[sub.category] ?? sub.category}
                        </span>
                      </div>
                      {canSeeAll && sub.adminNote && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                          {sub.adminNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {sub.status === "APPROVED" && (
                      <span className="flex items-center gap-1 text-[var(--brand)] font-bold text-sm">
                        <Star className="h-3.5 w-3.5" />
                        {sub.pointsAwarded}
                      </span>
                    )}
                    {canSeeAll && sub.status === "PENDING" && (
                      <span className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold">
                        Under review
                      </span>
                    )}
                    {canSeeAll && sub.status === "REJECTED" && (
                      <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">
                        Rejected
                      </span>
                    )}
                    <a
                      href={sub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--muted-foreground)] hover:text-[var(--brand)] transition-colors"
                      title="View contribution"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed quests */}
      <div>
        <h2 className="text-xl font-bold mb-4">Completed Quests</h2>
        {user.completions.length === 0 ? (
          <div className="py-10 text-center text-[var(--muted-foreground)] border border-[var(--border)]">
            No quests completed yet.{" "}
            <Link href="/quests" className="text-[var(--brand)] hover:underline">
              Browse quests
            </Link>
          </div>
        ) : (
          <div className="border border-[var(--border)] divide-y divide-[var(--border)]">
            {user.completions.map((completion) => {
              const cat = categoryConfig[completion.quest.category]
              return (
                <div key={completion.id} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{completion.quest.title}</p>
                      <Badge variant={cat.variant} className="text-xs mt-0.5">
                        {cat.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--brand)] font-bold text-sm shrink-0">
                    <Star className="h-3.5 w-3.5" />
                    {completion.quest.points}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
