"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Zap, GitBranch, X, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const filters = [
  { label: "All", value: null, icon: null },
  { label: "On-Chain", value: "ONCHAIN", icon: Zap },
  { label: "GitHub", value: "GITHUB", icon: GitBranch },
  { label: "Social", value: "SOCIAL", icon: X },
  { label: "Community", value: "COMMUNITY", icon: Users },
]

interface QuestFiltersProps {
  activeCategory?: string
}

export function QuestFilters({ activeCategory }: QuestFiltersProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => {
        const href = f.value ? `${pathname}?category=${f.value}` : pathname
        const isActive = f.value ? activeCategory === f.value : !activeCategory

        return (
          <Link
            key={f.label}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border",
              isActive
                ? "bg-[var(--miden-purple)] border-[var(--miden-purple)] text-white"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--miden-purple)] hover:text-[var(--foreground)]"
            )}
          >
            {f.icon && <f.icon className="h-3.5 w-3.5" />}
            {f.label}
          </Link>
        )
      })}
    </div>
  )
}
