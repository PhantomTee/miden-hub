import Link from "next/link"
import { Medal, Star } from "lucide-react"
import { truncateAddress, formatPoints } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface LeaderboardUser {
  rank: number
  id: string
  walletAddress: string
  username?: string | null
  displayPoints: number
}

interface LeaderboardTableProps {
  users: LeaderboardUser[]
  currentUserId?: string
}

const medalColor = ["text-yellow-400", "text-slate-400", "text-amber-600"]

export function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--muted-foreground)]">
        No contributions yet. Be the first!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/profile/${user.walletAddress}`}
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:border-[var(--miden-purple)]",
            user.id === currentUserId
              ? "border-[var(--miden-purple)] bg-[var(--miden-purple)]/5"
              : "border-[var(--border)] bg-[var(--card)]"
          )}
        >
          {/* Rank */}
          <div className="w-8 text-center shrink-0">
            {user.rank <= 3 ? (
              <Medal className={cn("h-5 w-5 mx-auto", medalColor[user.rank - 1])} />
            ) : (
              <span className="text-sm font-mono text-[var(--muted-foreground)]">#{user.rank}</span>
            )}
          </div>

          {/* Avatar placeholder */}
          <div className="w-9 h-9 rounded-full miden-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(user.username ?? user.walletAddress).charAt(0).toUpperCase()}
          </div>

          {/* Name / address */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {user.username ?? truncateAddress(user.walletAddress)}
            </div>
            {user.username && (
              <div className="text-xs text-[var(--muted-foreground)] font-mono truncate">
                {truncateAddress(user.walletAddress)}
              </div>
            )}
          </div>

          {/* Points */}
          <div className="flex items-center gap-1 text-[var(--miden-purple-light)] font-semibold shrink-0">
            <Star className="h-4 w-4" />
            {formatPoints(user.displayPoints)}
          </div>
        </Link>
      ))}
    </div>
  )
}
