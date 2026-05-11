"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { VerificationType } from "@prisma/client"

interface ClaimButtonProps {
  questId: string
  verificationType: VerificationType
  completionStatus: string | null
  isLoggedIn: boolean
}

export function ClaimButton({ questId, verificationType, completionStatus, isLoggedIn }: ClaimButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ status: string; pointsAwarded: number } | null>(null)
  const [txHash, setTxHash] = useState("")
  const [prNumber, setPrNumber] = useState("")

  if (!isLoggedIn) {
    return (
      <div className="text-center py-4 text-[var(--muted-foreground)]">
        Connect your wallet to claim this quest
      </div>
    )
  }

  if (completionStatus === "VERIFIED" || result?.status === "VERIFIED") {
    return (
      <div className="flex items-center gap-2 text-emerald-400 font-medium">
        <CheckCircle2 className="h-5 w-5" />
        Quest completed! You earned {result?.pointsAwarded ?? 0} points.
      </div>
    )
  }

  if (completionStatus === "FAILED" || result?.status === "FAILED") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <XCircle className="h-4 w-4" />
          Verification failed. Make sure you&apos;ve completed the requirements.
        </div>
        <Button variant="outline" onClick={() => setResult(null)}>
          Try Again
        </Button>
      </div>
    )
  }

  async function handleClaim() {
    setLoading(true)
    try {
      const body: Record<string, string> = {}
      if (verificationType === "MIDEN_TX") body.txHash = txHash
      if (verificationType === "GITHUB_PR") body.prNumber = prNumber

      const res = await fetch(`/api/quests/${questId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ status: "FAILED", pointsAwarded: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {verificationType === "MIDEN_TX" && (
        <div className="space-y-2">
          <Label htmlFor="txHash">Transaction Hash</Label>
          <Input
            id="txHash"
            placeholder="0x..."
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
        </div>
      )}
      {verificationType === "GITHUB_PR" && (
        <div className="space-y-2">
          <Label htmlFor="prNumber">Pull Request Number</Label>
          <Input
            id="prNumber"
            placeholder="123"
            value={prNumber}
            onChange={(e) => setPrNumber(e.target.value)}
          />
        </div>
      )}
      <Button onClick={handleClaim} disabled={loading} size="lg" className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Verifying..." : "Claim Quest"}
      </Button>
    </div>
  )
}
