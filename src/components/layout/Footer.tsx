import Link from "next/link"
import { GitBranch } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8">

          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="inline-flex items-center px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)]">
                <span className="font-display text-sm tracking-widest uppercase leading-none" style={{ fontFamily: "var(--font-anton, impact)" }}>
                  Miden<span style={{ color: "var(--brand)" }}>Hub</span>
                </span>
              </div>
            </Link>
            <span className="text-[var(--muted-foreground)] text-xs hidden sm:block">
              The contribution hub for the Miden ecosystem.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5">
            <Link href="/quests" className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Quests
            </Link>
            <Link href="/feed" className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Feed
            </Link>
            <Link href="/leaderboard" className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Leaderboard
            </Link>
            <a
              href="https://github.com/0xMiden"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="GitHub"
            >
              <GitBranch className="h-4 w-4" />
            </a>
            <a
              href="https://t.me/MidenProtocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Telegram"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.26 14.4l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.556.099z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
