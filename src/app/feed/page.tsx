"use client"

import { useEffect, useState, useCallback } from "react"
import { LikeButton } from "@/components/feed/LikeButton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SUBMISSION_CATEGORIES } from "@/lib/submission-config"
import { ExternalLink, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { truncateAddress } from "@/lib/utils"

type FeedItem = {
  id: string
  category: "TWEET" | "DAPP" | "ARTICLE" | "VIDEO"
  title: string
  description: string
  link: string
  pointsAwarded: number
  reviewedAt: string | null
  user: { walletAddress: string; username: string | null }
  likeCount: number
  likedByMe: boolean
  isOwn: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  TWEET: "Tweet",
  DAPP: "dApp",
  ARTICLE: "Article",
  VIDEO: "Video",
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [category, setCategory] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Detect if logged in by trying a session-dependent request
  useEffect(() => {
    fetch("/api/submissions?address=_check_", { method: "GET" })
      .then((r) => {
        setIsLoggedIn(r.status !== 401)
      })
      .catch(() => {})
  }, [])

  const load = useCallback(async (cat: string, cursor?: string) => {
    const params = new URLSearchParams()
    if (cat) params.set("category", cat)
    if (cursor) params.set("cursor", cursor)
    const res = await fetch(`/api/feed?${params}`)
    if (!res.ok) return { items: [], nextCursor: null }
    const data = await res.json()
    return data as { items: FeedItem[]; nextCursor: string | null }
  }, [])

  useEffect(() => {
    setLoading(true)
    load(category).then((data) => {
      setItems(data.items)
      setNextCursor(data.nextCursor)
      setLoading(false)
    })
  }, [category, load])

  async function loadMore() {
    if (!nextCursor) return
    setLoadingMore(true)
    const data = await load(category, nextCursor)
    setItems((prev) => [...prev, ...data.items])
    setNextCursor(data.nextCursor)
    setLoadingMore(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Feed</h1>
        <p className="text-[var(--muted-foreground)]">
          Approved contributions from the Miden ecosystem
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            category === ""
              ? "border-[var(--miden-purple)] bg-[var(--miden-purple)]/10 text-[var(--miden-purple-light)]"
              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--miden-purple)]/50"
          }`}
        >
          All
        </button>
        {SUBMISSION_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              category === cat.value
                ? "border-[var(--miden-purple)] bg-[var(--miden-purple)]/10 text-[var(--miden-purple-light)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--miden-purple)]/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-[var(--muted-foreground)]">Loading…</div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          No contributions yet.{" "}
          <a href="/contribute" className="text-[var(--miden-purple-light)] hover:underline">
            Be the first →
          </a>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="hover:border-[var(--miden-purple)]/40 transition-colors">
            <CardContent className="p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    by{" "}
                    <a
                      href={`/profile/${item.user.walletAddress}`}
                      className="hover:text-[var(--miden-purple-light)] transition-colors"
                    >
                      {item.user.username ?? truncateAddress(item.user.walletAddress)}
                    </a>
                  </span>
                  {item.reviewedAt && (
                    <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Clock className="h-3 w-3" />
                      {timeAgo(item.reviewedAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[var(--miden-purple-light)] text-sm font-semibold shrink-0">
                  <Star className="h-3.5 w-3.5" />
                  {item.pointsAwarded}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-base">{item.title}</h3>

              {/* Description */}
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-3">
                {item.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--miden-purple-light)] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View contribution
                </a>
                <LikeButton
                  submissionId={item.id}
                  initialCount={item.likeCount}
                  initialLiked={item.likedByMe}
                  isOwn={item.isOwn}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nextCursor && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
