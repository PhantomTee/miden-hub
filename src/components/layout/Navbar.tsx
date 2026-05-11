import Link from "next/link"
import { getOptionalSession } from "@/lib/dal"
import { NavbarClient } from "./NavbarClient"

export async function Navbar() {
  const session = await getOptionalSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <div className="inline-flex items-center px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)]">
              <span className="font-display text-sm tracking-widest uppercase leading-none">
                Miden<span style={{ color: "var(--brand)" }}>Hub</span>
              </span>
            </div>
          </Link>

          {/* All interactive parts (nav links, theme toggle, wallet, hamburger) */}
          <NavbarClient
            walletAddress={session?.walletAddress}
            isAdmin={session?.isAdmin}
          />

        </div>
      </div>
    </header>
  )
}
