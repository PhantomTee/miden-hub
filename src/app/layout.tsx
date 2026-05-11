import type { Metadata } from "next"
import { Geist, Geist_Mono, Anton } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { WalletProviderWrapper } from "@/components/wallet/WalletProviderWrapper"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "Miden Hub: Contribute & Earn",
  description: "The contribution hub for the Miden ecosystem. Complete quests, earn points, and shape the future of ZK.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {/* Apply saved theme before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
        <WalletProviderWrapper>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProviderWrapper>
      </body>
    </html>
  )
}
