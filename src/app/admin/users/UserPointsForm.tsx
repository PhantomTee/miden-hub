"use client"

import { useState } from "react"

export function UserPointsForm({
  userId,
  currentPoints,
}: {
  userId: string
  currentPoints: number
}) {
  const [delta, setDelta] = useState("")
  const [points, setPoints] = useState(currentPoints)
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(delta)
    if (!num || isNaN(num)) return
    setStatus("loading")
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsDelta: num }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setPoints(updated.totalPoints)
      setDelta("")
      setStatus("ok")
      setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("err")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        type="number"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        placeholder="+/-"
        className="w-20 px-2 py-1 bg-[var(--card)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--brand)] text-center"
      />
      <button
        type="submit"
        disabled={status === "loading" || !delta}
        className="px-2 py-1 text-xs font-bold border border-[var(--border)] hover:border-[var(--brand)] disabled:opacity-40 transition-colors"
      >
        {status === "loading" ? "..." : status === "ok" ? "Saved" : status === "err" ? "Err" : "Apply"}
      </button>
      <span className="text-xs text-[var(--muted-foreground)] w-10 text-right tabular-nums">
        {points}
      </span>
    </form>
  )
}
