"use client"

import { useState, useMemo } from "react"
import { GitBranch, Globe, ExternalLink, Search } from "lucide-react"

export type EcosystemProject = {
  name: string
  category: string
  summary: string
  tags: string[]
  status: string
  xUrl: string | null
  githubUrl: string | null
  websiteUrl: string | null
}

const STATUS_STYLES: Record<string, string> = {
  "Building":     "border-yellow-500/40 text-yellow-400",
  "Testnet":      "border-blue-500/40 text-blue-400",
  "Live/Testing": "border-emerald-500/40 text-emerald-400",
  "Partnership":  "border-[var(--brand)]/40 text-[var(--brand)]",
}

const CATEGORIES = ["All", "Finance", "DeFi", "Wallet", "DevTool", "Infrastructure", "Partnership"]

export function EcosystemClient({ projects }: { projects: EcosystemProject[] }) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return projects.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory
      if (!matchesCategory) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [projects, query, activeCategory])

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, tag..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--brand)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`nav-pill transition-colors ${
              activeCategory === cat
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project count */}
      <p className="text-xs text-[var(--muted-foreground)] mb-6 font-bold uppercase tracking-wider">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        {query ? ` matching "${query}"` : ""}
      </p>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="border border-[var(--border)] py-16 text-center">
          <p className="text-[var(--foreground)] font-bold mb-1">No ecosystem projects found.</p>
          <p className="text-[var(--muted-foreground)] text-sm">Try another search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-[var(--border)]">
          {filtered.map((project, i) => {
            const statusStyle = STATUS_STYLES[project.status] ?? "border-[var(--border)] text-[var(--muted-foreground)]"
            const hasLinks = project.websiteUrl || project.xUrl || project.githubUrl
            const col = i % 3
            const row = Math.floor(i / 3)
            const borderLeft = col > 0 ? "sm:border-l border-[var(--border)]" : ""
            const borderTop  = row > 0 ? "border-t border-[var(--border)]" : (i > 0 ? "border-t sm:border-t-0 border-[var(--border)]" : "")

            return (
              <div
                key={project.name}
                className={`flex flex-col p-6 ${borderLeft} ${borderTop}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-base leading-tight">{project.name}</h3>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${statusStyle}`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Category */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand)] mb-3">
                  {project.category}
                </p>

                {/* Summary */}
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed flex-1 mb-4">
                  {project.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold uppercase tracking-wide border border-[var(--border)] px-2 py-0.5 text-[var(--muted-foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                {hasLinks ? (
                  <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
                    {project.websiteUrl && (
                      <a
                        href={project.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--brand)] transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </a>
                    )}
                    {project.xUrl && (
                      <a
                        href={project.xUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--brand)] transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        X
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--brand)] transition-colors"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-[var(--border)]">
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-bold">
                      Links not verified yet
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
