"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SUBMISSION_CATEGORIES } from "@/lib/submission-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, Star, CheckCircle2 } from "lucide-react"

export default function ContributePage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const category = SUBMISSION_CATEGORIES.find((c) => c.value === selectedCategory)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCategory) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, title, description, link }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Submission failed")
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Submission received!</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          The Miden team will review your contribution. You&apos;ll receive points once it&apos;s approved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/contribute")}>
            Submit another
          </Button>
          <Button onClick={() => router.push("/leaderboard")}>View leaderboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit a contribution</h1>
        <p className="text-[var(--muted-foreground)]">
          Share your work with the Miden team. Approved submissions earn points towards the leaderboard.
        </p>
      </div>

      {/* Category picker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {SUBMISSION_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setSelectedCategory(cat.value)}
            className={`relative p-4 rounded-xl border text-left transition-all ${
              selectedCategory === cat.value
                ? "border-[var(--miden-purple)] bg-[var(--miden-purple)]/10 miden-glow"
                : "border-[var(--border)] hover:border-[var(--miden-purple)]/50"
            }`}
          >
            <div className="text-sm font-medium mb-1">{cat.label}</div>
            <div className="flex items-center gap-1 text-[var(--miden-purple-light)] text-xs font-semibold">
              <Star className="h-3 w-3" />
              {cat.defaultPoints} pts
            </div>
            {selectedCategory === cat.value && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--miden-purple)]" />
            )}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{category?.label}</CardTitle>
            <CardDescription>{category?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your submission a short title"
                  minLength={3}
                  maxLength={120}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your contribution and what makes it valuable to the Miden ecosystem"
                  minLength={10}
                  maxLength={2000}
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors resize-none"
                />
                <div className="text-xs text-[var(--muted-foreground)] mt-1 text-right">
                  {description.length}/2000
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{category?.linkLabel}</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={category?.linkPlaceholder}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
                />
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="text-sm text-[var(--muted-foreground)]">
                  Default reward:{" "}
                  <span className="text-[var(--miden-purple-light)] font-semibold">
                    {category?.defaultPoints} points
                  </span>
                </div>
                <Button type="submit" disabled={submitting} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {submitting ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!selectedCategory && (
        <p className="text-center text-sm text-[var(--muted-foreground)] mt-4">
          Select a category above to continue
        </p>
      )}
    </div>
  )
}
