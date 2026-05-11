"use client"

import { useState } from "react"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  submissionId: string
  initialCount: number
  initialLiked: boolean
  isOwn: boolean
  isLoggedIn: boolean
}

export function LikeButton({
  submissionId,
  initialCount,
  initialLiked,
  isOwn,
  isLoggedIn,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!isLoggedIn) {
      alert("Connect your wallet to like submissions.")
      return
    }
    if (isOwn) return
    if (loading) return

    // Optimistic update
    setLiked((prev) => !prev)
    setCount((prev) => (liked ? prev - 1 : prev + 1))
    setLoading(true)

    try {
      const res = await fetch(`/api/submissions/${submissionId}/like`, {
        method: "POST",
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      } else {
        // Revert on error
        setLiked((prev) => !prev)
        setCount((prev) => (liked ? prev + 1 : prev - 1))
      }
    } catch {
      setLiked((prev) => !prev)
      setCount((prev) => (liked ? prev + 1 : prev - 1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isOwn}
      title={isOwn ? "Can't like your own submission" : liked ? "Unlike" : "Like"}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        isOwn
          ? "opacity-30 cursor-not-allowed"
          : liked
          ? "text-red-400 hover:text-red-300"
          : "text-[var(--muted-foreground)] hover:text-red-400"
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-all ${liked ? "fill-current scale-110" : ""}`}
      />
      <span>{count}</span>
    </button>
  )
}
