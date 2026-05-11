"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"

const MidenWalletProvider = dynamic(
  () => import("./MidenWalletProvider").then((m) => m.MidenWalletProvider),
  { ssr: false }
)

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return <MidenWalletProvider>{children}</MidenWalletProvider>
}
