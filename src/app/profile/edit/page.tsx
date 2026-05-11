"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Wallet } from "lucide-react"
import Link from "next/link"

type ProfileData = {
  walletAddress: string
  username: string | null
  bio: string | null
  avatarUrl: string | null
  website: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    fetch("/api/profile/me")
      .then((r) => {
        if (r.status === 401) { router.push("/"); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setProfile(data)
        setUsername(data.username ?? "")
        setBio(data.bio ?? "")
        setWebsite(data.website ?? "")
        setAvatarUrl(data.avatarUrl ?? "")
        setLoading(false)
      })
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const res = await fetch("/api/profile/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username || undefined,
        bio: bio || undefined,
        website: website || undefined,
        avatarUrl: avatarUrl || undefined,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      const msg =
        typeof data.error === "string"
          ? data.error
          : Object.values(data.error?.fieldErrors ?? {}).flat().join(", ")
      setError(msg)
    } else {
      setSuccess(true)
      setTimeout(() => router.push(`/profile/${profile?.walletAddress}`), 800)
    }
  }

  if (loading) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-[var(--muted-foreground)]">Loading…</div>
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          href={`/profile/${profile?.walletAddress}`}
          className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Complete your profile to unlock full platform access.
        </p>
      </div>

      {/* Wallet address (read-only) */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--secondary)] mb-6">
        <Wallet className="h-4 w-4 text-[var(--miden-purple)] shrink-0" />
        <span className="font-mono text-sm text-[var(--muted-foreground)] truncate">
          {profile?.walletAddress}
        </span>
        <span className="ml-auto text-xs text-[var(--muted-foreground)] shrink-0">Not editable</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile details</CardTitle>
          <CardDescription>Fields marked with * are required to reach 70% completion.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Username <span className="text-[var(--miden-purple-light)]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_handle"
                maxLength={32}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Letters, numbers, _ . - only</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Bio <span className="text-[var(--miden-purple-light)]">*</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the Miden community about yourself…"
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors resize-none"
              />
              <div className="text-xs text-[var(--muted-foreground)] mt-1 text-right">{bio.length}/300</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…/avatar.png"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--miden-purple)] transition-colors"
              />
              {avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="mt-2 w-12 h-12 rounded-full object-cover border border-[var(--border)]"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                Profile saved! Redirecting…
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
