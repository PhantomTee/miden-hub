"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEFAULT_POINTS } from "@/lib/submission-config"
import { CheckCircle2, XCircle, ExternalLink, Clock, Star } from "lucide-react"

type Submission = {
  id: string
  category: "TWEET" | "DAPP" | "ARTICLE" | "VIDEO"
  title: string
  description: string
  link: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  pointsAwarded: number
  adminNote: string | null
  createdAt: string
  user: { walletAddress: string; username: string | null }
}

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL"

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "outline",
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filter, setFilter] = useState<StatusFilter>("PENDING")
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)

  // Per-submission review state
  const [points, setPoints] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const url =
      filter === "ALL" ? "/api/submissions" : `/api/submissions?status=${filter}`
    const res = await fetch(url)
    if (res.ok) setSubmissions(await res.json())
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function review(id: string, action: "APPROVE" | "REJECT") {
    setReviewing(id)
    const sub = submissions.find((s) => s.id === id)!
    const pointsVal = points[id] ? parseInt(points[id]) : undefined
    const adminNote = notes[id] || undefined

    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        points: action === "APPROVE" ? pointsVal : undefined,
        adminNote,
      }),
    })
    setReviewing(null)
    load()
    // Clean up local state for this submission
    setPoints((p) => { const n = { ...p }; delete n[id]; return n })
    setNotes((n) => { const c = { ...n }; delete c[id]; return c })
  }

  const pending = submissions.filter((s) => s.status === "PENDING").length

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Submissions</h1>
          {pending > 0 && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {pending} pending review
            </p>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 p-1 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filter === s
                  ? "bg-[var(--miden-purple)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-[var(--muted-foreground)]">Loading…</div>
      )}

      {!loading && submissions.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          No {filter === "ALL" ? "" : filter.toLowerCase()} submissions
        </div>
      )}

      <div className="space-y-4">
        {submissions.map((sub) => (
          <Card key={sub.id} className={sub.status === "PENDING" ? "border-[var(--miden-purple)]/30" : ""}>
            <CardContent className="p-5 space-y-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={statusVariant[sub.status] ?? "secondary"}>
                      {sub.status}
                    </Badge>
                    <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                      {sub.category}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold">{sub.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    by{" "}
                    <span className="font-mono text-xs">
                      {sub.user.username ?? sub.user.walletAddress.slice(0, 12) + "…"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[var(--miden-purple-light)] text-sm font-semibold shrink-0">
                  <Star className="h-3.5 w-3.5" />
                  {sub.status === "APPROVED"
                    ? sub.pointsAwarded
                    : DEFAULT_POINTS[sub.category]}{" "}
                  pts
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-3">{sub.description}</p>

              {/* Link */}
              <a
                href={sub.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--miden-purple-light)] hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {sub.link}
              </a>

              {/* Admin note (if already reviewed) */}
              {sub.adminNote && (
                <div className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">Note: </span>
                  {sub.adminNote}
                </div>
              )}

              {/* Review controls (PENDING only) */}
              {sub.status === "PENDING" && (
                <div className="border-t border-[var(--border)] pt-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">
                        Points override{" "}
                        <span className="text-[var(--muted-foreground)]">
                          (default: {DEFAULT_POINTS[sub.category]})
                        </span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={points[sub.id] ?? ""}
                        onChange={(e) =>
                          setPoints((p) => ({ ...p, [sub.id]: e.target.value }))
                        }
                        placeholder={String(DEFAULT_POINTS[sub.category])}
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-medium mb-1">
                        Admin note{" "}
                        <span className="text-[var(--muted-foreground)]">(visible to user)</span>
                      </label>
                      <input
                        type="text"
                        value={notes[sub.id] ?? ""}
                        onChange={(e) =>
                          setNotes((n) => ({ ...n, [sub.id]: e.target.value }))
                        }
                        placeholder="Optional feedback…"
                        maxLength={500}
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-green-600 hover:bg-green-500"
                      disabled={reviewing === sub.id}
                      onClick={() => review(sub.id, "APPROVE")}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                      disabled={reviewing === sub.id}
                      onClick={() => review(sub.id, "REJECT")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                    {reviewing === sub.id && (
                      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Clock className="h-3 w-3 animate-spin" />
                        Processing…
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
