import { EcosystemClient, EcosystemProject } from "@/components/ecosystem/EcosystemClient"

const PROJECTS: EcosystemProject[] = [
  {
    name: "Miden Wallet",
    category: "Wallet",
    summary: "The official Miden Web Wallet — a browser-based wallet for managing Miden accounts, sending notes, and interacting with the Miden testnet.",
    tags: ["Wallet", "Official", "Browser"],
    status: "Testnet",
    xUrl: "https://x.com/0xPolygonMiden",
    githubUrl: "https://github.com/0xPolygonMiden/miden-wallet",
    websiteUrl: "https://wallet.miden.io",
  },
  {
    name: "Miden VM",
    category: "Infrastructure",
    summary: "STARK-based zero-knowledge virtual machine powering Miden's execution layer. Write provable programs in Miden Assembly or the higher-level Miden IR.",
    tags: ["ZK", "VM", "Core", "Rust"],
    status: "Live/Testing",
    xUrl: "https://x.com/0xPolygonMiden",
    githubUrl: "https://github.com/0xPolygonMiden/miden-vm",
    websiteUrl: "https://0xpolygonmiden.github.io/miden-vm/",
  },
  {
    name: "Miden Client",
    category: "DevTool",
    summary: "Rust + WASM client library for interacting with the Miden network. Manages account state, proves transactions locally, and submits them to the node.",
    tags: ["SDK", "Rust", "WASM", "Official"],
    status: "Testnet",
    xUrl: null,
    githubUrl: "https://github.com/0xPolygonMiden/miden-client",
    websiteUrl: null,
  },
  {
    name: "Miden Base",
    category: "Infrastructure",
    summary: "Core types, account models, note schemas, and transaction primitives that underpin the entire Miden protocol.",
    tags: ["Protocol", "Core", "Rust"],
    status: "Live/Testing",
    xUrl: null,
    githubUrl: "https://github.com/0xPolygonMiden/miden-base",
    websiteUrl: null,
  },
  {
    name: "Polygon × Miden",
    category: "Partnership",
    summary: "Polygon Labs backs Miden's development, providing research, engineering, and ecosystem resources to accelerate the rollup's path to mainnet.",
    tags: ["L2", "Polygon", "Research"],
    status: "Partnership",
    xUrl: "https://x.com/0xPolygon",
    githubUrl: null,
    websiteUrl: "https://polygon.technology",
  },
  {
    name: "ZKredentials",
    category: "Infrastructure",
    summary: "Privacy-preserving credential system built on Miden. Issue and verify attestations without revealing underlying identity data on-chain.",
    tags: ["Identity", "ZK", "Privacy"],
    status: "Building",
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
  },
  {
    name: "MidenSwap",
    category: "DeFi",
    summary: "Experimental AMM prototype demonstrating private liquidity pools on Miden. Users swap tokens without exposing amounts or addresses publicly.",
    tags: ["AMM", "DEX", "Private"],
    status: "Building",
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
  },
  {
    name: "NoteForge",
    category: "DevTool",
    summary: "Visual note-scripting playground for Miden. Drag-and-drop note conditions, export Miden Assembly, and test execution in a sandboxed VM.",
    tags: ["DevEx", "Tooling", "No-code"],
    status: "Building",
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
  },
  {
    name: "Miden Lend",
    category: "Finance",
    summary: "Proof-of-concept private lending protocol. Borrowers prove collateral ratios with ZK proofs; lenders earn yield without seeing counterparty positions.",
    tags: ["Lending", "Privacy", "DeFi"],
    status: "Building",
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
  },
  {
    name: "StealthPay",
    category: "Finance",
    summary: "Stealth-address payment layer on top of Miden notes. Send funds to a published stealth meta-address; only the recipient can detect and claim the note.",
    tags: ["Payments", "Stealth", "Privacy"],
    status: "Building",
    xUrl: null,
    githubUrl: null,
    websiteUrl: null,
  },
]

const STATS = [
  { label: "Projects", value: PROJECTS.length },
  { label: "Categories", value: new Set(PROJECTS.map((p) => p.category)).size },
  { label: "Live / Testnet", value: PROJECTS.filter((p) => p.status === "Live/Testing" || p.status === "Testnet").length },
]

export const metadata = {
  title: "Ecosystem | Miden Hub",
  description: "Explore projects building on the Miden network — wallets, DeFi protocols, developer tooling, and more.",
}

export default function EcosystemPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand)] mb-3">
          Ecosystem
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Building on Miden
        </h1>
        <p className="text-[var(--muted-foreground)] text-base max-w-2xl leading-relaxed mb-8">
          Discover the projects, protocols, and tools being built on the Miden network —
          from private DeFi and stealth payments to developer tooling and infrastructure.
        </p>

        {/* Stats row */}
        <div className="inline-flex border border-[var(--border)] divide-x divide-[var(--border)]">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-3 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] font-bold mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive client section */}
      <EcosystemClient projects={PROJECTS} />

      {/* CTA */}
      <div className="mt-16 border border-[var(--border)] p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand)] mb-3">
          Get listed
        </p>
        <h2 className="text-xl font-bold mb-3">Building on Miden?</h2>
        <p className="text-[var(--muted-foreground)] text-sm mb-6 max-w-md mx-auto">
          Complete Miden ecosystem quests, earn points, and get your project featured on this page.
        </p>
        <a
          href="/contribute"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Start Contributing →
        </a>
      </div>
    </main>
  )
}
