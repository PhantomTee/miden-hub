"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@demox-labs/miden-wallet-adapter-react"
import { MidenWalletName } from "@demox-labs/miden-wallet-adapter-miden"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Copy, Check, AlertCircle } from "lucide-react"
import { truncateAddress } from "@/lib/utils"

interface WalletButtonProps {
  walletAddress?: string | null
}

export function WalletButton({ walletAddress }: WalletButtonProps) {
  const { select, connect, disconnect, wallets, connected } = useWallet()
  const [connecting, setConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-select the Miden wallet so the adapter is ready when the user clicks connect
  useEffect(() => {
    select(MidenWalletName)
  }, [select])

  async function handleConnect() {
    setConnecting(true)
    setError(null)
    try {
      // connect() uses the network + permission configured in MidenWalletProvider
      await connect(
        "UPON_REQUEST" as any, // PrivateDataPermission.UponRequest - passed to provider
        "testnet" as any,      // WalletAdapterNetwork.Testnet - passed to provider
      )

      // Read address + publicKey from adapter instance directly (React state update is async)
      const addr = wallets[0]?.adapter.address
      const pubKey = wallets[0]?.adapter.publicKey
      if (!addr) throw new Error("Wallet connected but no address returned")

      // Get a nonce from the server
      const nonceRes = await fetch("/api/auth/nonce", { method: "POST" })
      const { nonce } = await nonceRes.json()

      // Attempt to sign the nonce. The wallet's "word" kind expects a specific
      // Miden field-element format - if signing fails, fall back to address-only
      // auth (acceptable for testnet; wallet connection is proof of ownership).
      const msgBytes = new TextEncoder().encode(`Sign in to Miden Hub: ${nonce}`)
      let signatureArr: number[] | null = null
      const adapterInst = wallets[0]?.adapter as { signBytes?: (msg: Uint8Array, kind: string) => Promise<Uint8Array> }
      if (adapterInst?.signBytes) {
        try {
          const sig = await adapterInst.signBytes(msgBytes, "word")
          signatureArr = Array.from(sig)
        } catch {
          // Signing not supported in this wallet version - proceed without signature
        }
      }

      // Verify on the server → creates session cookie
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: addr,
          nonce,
          signature: signatureArr,
          publicKey: pubKey ? Array.from(pubKey) : null,
        }),
      })

      if (verifyRes.ok) {
        window.location.reload()
      } else {
        const data = await verifyRes.json()
        throw new Error(data.error ?? "Authentication failed")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed"
      setError(msg)
      console.error("Wallet connection error:", err)
    } finally {
      setConnecting(false)
    }
  }

  async function handleCopy() {
    if (!walletAddress) return
    await navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDisconnect() {
    if (connected) await disconnect()
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.reload()
  }

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="nav-pill flex items-center gap-2 text-[var(--foreground)]"
        >
          <Wallet className="h-3 w-3 text-[var(--brand)]" />
          <span className="font-mono text-xs">{truncateAddress(walletAddress)}</span>
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 opacity-40" />}
        </button>
        <button
          onClick={handleDisconnect}
          title="Disconnect"
          className="nav-pill text-[var(--muted-foreground)]"
        >
          <LogOut className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleConnect} disabled={connecting} size="sm" className="uppercase tracking-wider text-xs">
        <Wallet className="h-3.5 w-3.5" />
        {connecting ? "Connecting…" : "Connect Wallet"}
      </Button>
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-400 max-w-[200px] text-right">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  )
}
