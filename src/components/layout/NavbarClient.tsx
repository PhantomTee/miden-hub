"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Shield } from "lucide-react"
import { WalletButton } from "@/components/wallet/WalletButton"
import { ThemeToggle } from "./ThemeToggle"

interface NavbarClientProps {
  walletAddress?: string
  isAdmin?: boolean
}

export function NavbarClient({ walletAddress, isAdmin }: NavbarClientProps) {
  const [open, setOpen] = useState(false)

  const links = [
    { href: "/quests", label: "Quests" },
    { href: "/ecosystem", label: "Ecosystem" },
    { href: "/feed", label: "Feed" },
    { href: "/leaderboard", label: "Leaderboard" },
    ...(walletAddress
      ? [
          { href: "/contribute", label: "Contribute" },
          { href: `/profile/${walletAddress}`, label: "Profile" },
        ]
      : []),
  ]

  return (
    <div className="flex flex-1 items-center justify-between">
      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="nav-pill text-[var(--muted-foreground)]">
            {link.label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className="nav-pill"
            style={{ borderColor: "var(--brand)", color: "var(--brand)" }}
          >
            <Shield className="h-3 w-3" />
            Admin
          </Link>
        )}
      </nav>

      {/* Right side controls — always pushed to the right edge */}
      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />
        <div className="hidden sm:block">
          <WalletButton walletAddress={walletAddress} />
        </div>
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-[var(--border)] bg-[var(--background)] z-40 px-4 py-4 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-pill text-[var(--muted-foreground)] w-full justify-start"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="nav-pill w-full justify-start"
              style={{ borderColor: "var(--brand)", color: "var(--brand)" }}
              onClick={() => setOpen(false)}
            >
              <Shield className="h-3 w-3" />
              Admin
            </Link>
          )}
          {/* Wallet button in mobile drawer */}
          <div className="pt-2 border-t border-[var(--border)] sm:hidden">
            <WalletButton walletAddress={walletAddress} />
          </div>
        </div>
      )}
    </div>
  )
}
