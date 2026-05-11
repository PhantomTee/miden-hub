import { verifyAdmin } from "@/lib/dal"
import { db } from "@/lib/db"
import { truncateAddress, formatPoints } from "@/lib/utils"
import { UserPointsForm } from "./UserPointsForm"
import { Star, Trophy, CheckCircle2, Upload } from "lucide-react"
import Link from "next/link"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await verifyAdmin()
  const { q, page } = await searchParams
  const pageNum = Math.max(1, parseInt(page ?? "1"))
  const pageSize = 25
  const skip = (pageNum - 1) * pageSize

  const where = q
    ? {
        OR: [
          { walletAddress: { contains: q, mode: "insensitive" as const } },
          { username: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { totalPoints: "desc" },
      skip,
      take: pageSize,
      include: {
        _count: { select: { completions: true, submissions: true } },
      },
    }),
    db.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            {total} total user{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Back to dashboard
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by address or username..."
            className="flex-1 px-3 py-2 bg-[var(--card)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--brand)] placeholder:text-[var(--muted-foreground)]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--brand)] text-black text-sm font-bold hover:bg-[var(--brand-dark)] transition-colors"
          >
            Search
          </button>
          {q && (
            <Link
              href="/admin/users"
              className="px-4 py-2 border border-[var(--border)] text-sm hover:border-[var(--brand)] transition-colors"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* User table */}
      <div className="border border-[var(--border)] divide-y divide-[var(--border)]">
        {users.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">No users found.</div>
        ) : (
          users.map((user, i) => (
            <div key={user.id} className="flex items-center gap-4 px-4 py-3">
              {/* Rank */}
              <span className="text-xs text-[var(--muted-foreground)] w-8 shrink-0 text-right">
                #{skip + i + 1}
              </span>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {user.username ?? truncateAddress(user.walletAddress)}
                  </span>
                  {user.isAdmin && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--brand)] border border-[var(--brand)] px-1.5 py-0.5">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] font-mono truncate">
                  {user.walletAddress}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1 text-[var(--brand)] text-sm font-bold">
                  <Star className="h-3.5 w-3.5" />
                  {formatPoints(user.totalPoints)}
                </span>
                <span className="flex items-center gap-1 text-[var(--muted-foreground)] text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {user._count.completions}
                </span>
                <span className="flex items-center gap-1 text-[var(--muted-foreground)] text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  {user._count.submissions}
                </span>
              </div>

              {/* Point adjustment */}
              <div className="shrink-0">
                <UserPointsForm userId={user.id} currentPoints={user.totalPoints} />
              </div>

              {/* Profile link */}
              <Link
                href={`/profile/${user.walletAddress}`}
                className="shrink-0 text-xs text-[var(--muted-foreground)] hover:text-[var(--brand)] transition-colors"
              >
                View
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Page {pageNum} of {totalPages}
          </p>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={`/admin/users?${q ? `q=${q}&` : ""}page=${pageNum - 1}`}
                className="px-3 py-1.5 border border-[var(--border)] text-sm hover:border-[var(--brand)] transition-colors"
              >
                Prev
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={`/admin/users?${q ? `q=${q}&` : ""}page=${pageNum + 1}`}
                className="px-3 py-1.5 border border-[var(--border)] text-sm hover:border-[var(--brand)] transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
