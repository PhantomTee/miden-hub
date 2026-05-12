import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Trophy, Star, GitBranch, Users, X } from "lucide-react"

export default async function HomePage() {
  let totalUsers = 0
  let totalCompletions = 0
  let recentQuests: Awaited<ReturnType<typeof db.quest.findMany>> = []
  let totalPoints = 0

  try {
    const [u, c, q] = await Promise.all([
      db.user.count(),
      db.completion.count({ where: { status: "VERIFIED" } }),
      db.quest.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { _count: { select: { completions: { where: { status: "VERIFIED" } } } } },
      }),
    ])
    totalUsers = u
    totalCompletions = c
    recentQuests = q

    const agg = await db.completion.aggregate({
      where: { status: "VERIFIED" },
      _sum: { pointsAwarded: true },
    })
    totalPoints = agg._sum.pointsAwarded ?? 0
  } catch (err) {
    console.error("[home] db error:", err)
  }

  const categoryConfig = {
    ONCHAIN: { variant: "onchain" as const, icon: Zap },
    GITHUB: { variant: "github" as const, icon: GitBranch },
    SOCIAL: { variant: "social" as const, icon: X },
    COMMUNITY: { variant: "community" as const, icon: Users },
  }

  return (
    <div>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="min-h-[calc(100svh-3.5rem)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 pt-12 pb-10 border-b border-[var(--border)]">

        <div className="flex items-start justify-between gap-4 mb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--brand)] text-[var(--brand)] text-xs font-bold uppercase tracking-widest"
          >
            <Zap className="h-3 w-3" />
            Miden Testnet Is Live
          </div>
          <span className="text-xs text-[var(--muted-foreground)] font-mono hidden sm:block">
            ZK · Privacy · Testnet
          </span>
        </div>

        {/* Big headline */}
        <div className="flex-1 flex flex-col justify-center">
          <h1
            className="font-display uppercase leading-[0.9] tracking-tight mb-0"
            style={{ fontSize: "clamp(3.5rem, 11vw, 13rem)" }}
          >
            <span className="block">Explore</span>
            <span className="block text-[var(--brand)]">Miden.</span>
            <span className="block">Build.</span>
            <span className="block">Connect.</span>
          </h1>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 mt-10">
          <div className="max-w-sm">
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-6">
              An independent community hub for finding projects, builders, and activity across the Miden ecosystem.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quests">
                <Button size="lg" className="uppercase tracking-wider font-bold text-sm">
                  Explore Quests
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="uppercase tracking-wider font-bold text-sm gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border border-[var(--border)] w-full sm:w-auto">
            {[
              { label: "Contributors", value: totalUsers.toLocaleString() },
              { label: "Completions", value: totalCompletions.toLocaleString() },
              { label: "Points Awarded", value: totalPoints.toLocaleString() },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`px-3 sm:px-6 py-4 text-center ${i > 0 ? "border-l border-[var(--border)]" : ""}`}
              >
                <div className="font-display text-2xl sm:text-3xl leading-none text-[var(--brand)]" style={{ fontFamily: "var(--font-anton, impact)" }}>
                  {stat.value}
                </div>
                <div className="text-[9px] sm:text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest mt-1 font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              How It Works
            </span>
            <h2 className="font-display uppercase text-4xl sm:text-5xl leading-none mt-2" style={{ fontFamily: "var(--font-anton, impact)" }}>
              Three Steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--border)]">
            {[
              {
                step: "01",
                title: "Connect Your Wallet",
                desc: "Sign in with your Miden Web Wallet. No gas, just a signature.",
              },
              {
                step: "02",
                title: "Complete Quests",
                desc: "Do on-chain actions, contribute code, grow the community, or engage socially.",
              },
              {
                step: "03",
                title: "Earn Points",
                desc: "Points are awarded automatically when your contribution is verified.",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`p-8 ${i > 0 ? "border-t md:border-t-0 md:border-l border-[var(--border)]" : ""}`}
              >
                <div
                  className="font-display text-7xl leading-none text-[var(--brand)] mb-6 opacity-40"
                  style={{ fontFamily: "var(--font-anton, impact)" }}
                >
                  {item.step}
                </div>
                <h3 className="font-display text-xl uppercase leading-tight mb-3" style={{ fontFamily: "var(--font-anton, impact)" }}>
                  {item.title}
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest quests ─────────────────────────────────────────── */}
      {recentQuests.length > 0 && (
        <section className="py-20 px-4 sm:px-8 lg:px-12 border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Open Now
                </span>
                <h2 className="font-display uppercase text-4xl sm:text-5xl leading-none mt-2" style={{ fontFamily: "var(--font-anton, impact)" }}>
                  Latest Quests.
                </h2>
              </div>
              <Link
                href="/quests"
                className="hidden sm:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--brand)] hover:underline"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-[var(--border)]">
              {recentQuests.map((quest, i) => {
                const cat = categoryConfig[quest.category]
                return (
                  <Link key={quest.id} href={`/quests/${quest.id}`} className="group">
                    <div
                      className={`p-6 h-full flex flex-col justify-between hover:bg-[var(--card)] transition-colors ${
                        i > 0 ? "border-t sm:border-t-0 sm:border-l border-[var(--border)]" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant={cat.variant} className="flex items-center gap-1 text-xs uppercase tracking-wide">
                            <cat.icon className="h-3 w-3" />
                            {quest.category}
                          </Badge>
                          <span className="flex items-center gap-1 text-[var(--brand)] text-sm font-bold">
                            <Star className="h-3.5 w-3.5" />
                            {quest.points}
                          </span>
                        </div>
                        <p className="font-bold text-base group-hover:text-[var(--brand)] transition-colors leading-snug">
                          {quest.title}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-4 line-clamp-2 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA strip ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <h2
            className="font-display uppercase leading-none text-4xl sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-anton, impact)" }}
          >
            Building on<br />
            <span className="text-[var(--brand)]">Miden?</span>
          </h2>
          <div className="flex flex-col gap-4">
            <p className="text-[var(--muted-foreground)] text-sm max-w-xs leading-relaxed">
              Browse the ecosystem directory, discover projects, and connect with other builders.
            </p>
            <Link href="/ecosystem">
              <Button size="lg" className="uppercase tracking-wider font-bold text-sm w-full sm:w-auto">
                Explore Ecosystem
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
