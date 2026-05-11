"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Trash2 } from "lucide-react"

interface QuestFormData {
  title: string
  description: string
  category: string
  points: number
  verificationType: string
  verificationParams: Record<string, string>
  isActive: boolean
  maxCompletions: number | null
}

interface QuestFormProps {
  questId?: string
  defaultValues?: Partial<QuestFormData>
}

const verificationParamFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
  GITHUB_STAR: [
    { key: "repoOwner", label: "Repo Owner", placeholder: "0xMiden" },
    { key: "repoName", label: "Repo Name", placeholder: "miden-vm" },
  ],
  GITHUB_PR: [
    { key: "repoOwner", label: "Repo Owner", placeholder: "0xMiden" },
    { key: "repoName", label: "Repo Name", placeholder: "miden-base" },
  ],
  TWITTER_FOLLOW: [{ key: "accountToFollow", label: "Account to Follow", placeholder: "0xMiden" }],
  TWITTER_RETWEET: [{ key: "tweetId", label: "Tweet ID", placeholder: "123456789" }],
  TELEGRAM_JOIN: [{ key: "telegramChannelId", label: "Telegram Channel ID", placeholder: "-1001234567890" }],
  MIDEN_TX: [],
}

export function QuestForm({ questId, defaultValues }: QuestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<QuestFormData>({
    title: defaultValues?.title ?? "",
    description: defaultValues?.description ?? "",
    category: defaultValues?.category ?? "ONCHAIN",
    points: defaultValues?.points ?? 100,
    verificationType: defaultValues?.verificationType ?? "MIDEN_TX",
    verificationParams: (defaultValues?.verificationParams as Record<string, string>) ?? {},
    isActive: defaultValues?.isActive ?? true,
    maxCompletions: defaultValues?.maxCompletions ?? null,
  })

  const paramFields = verificationParamFields[form.verificationType] ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = questId ? `/api/admin/quests/${questId}` : "/api/admin/quests"
      const method = questId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, points: Number(form.points) }),
      })
      if (res.ok) router.push("/admin/quests")
      else {
        const err = await res.json()
        alert(`Error: ${JSON.stringify(err.error)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!questId || !confirm("Delete this quest?")) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/quests/${questId}`, { method: "DELETE" })
      router.push("/admin/quests")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ONCHAIN", "GITHUB", "SOCIAL", "COMMUNITY"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min={1}
            value={form.points}
            onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Verification Type</Label>
        <Select
          value={form.verificationType}
          onValueChange={(v) => setForm({ ...form, verificationType: v, verificationParams: {} })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(verificationParamFields).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paramFields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Input
            placeholder={field.placeholder}
            value={form.verificationParams[field.key] ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                verificationParams: { ...form.verificationParams, [field.key]: e.target.value },
              })
            }
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxCompletions">Max Completions (optional)</Label>
          <Input
            id="maxCompletions"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={form.maxCompletions ?? ""}
            onChange={(e) =>
              setForm({ ...form, maxCompletions: e.target.value ? Number(e.target.value) : null })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.isActive ? "active" : "draft"}
            onValueChange={(v) => setForm({ ...form, isActive: v === "active" })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {questId ? "Save Changes" : "Create Quest"}
        </Button>
        {questId && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
