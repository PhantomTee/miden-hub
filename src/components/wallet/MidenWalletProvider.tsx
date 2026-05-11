"use client"

import { useMemo } from "react"
import { WalletProvider } from "@demox-labs/miden-wallet-adapter-react"
import { MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter-miden"
import { WalletAdapterNetwork, PrivateDataPermission } from "@demox-labs/miden-wallet-adapter-base"

export function MidenWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new MidenWalletAdapter()], [])

  return (
    <WalletProvider
      wallets={wallets}
      network={WalletAdapterNetwork.Testnet}
      privateDataPermission={PrivateDataPermission.UponRequest}
      autoConnect={false}
    >
      {children}
    </WalletProvider>
  )
}
