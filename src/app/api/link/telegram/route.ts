import { db } from "@/lib/db"
import { getSession } from "@/lib/session"

// Called by Telegram bot webhook when user sends /start <userId>
export async function POST(request: Request) {
  const { telegramUserId, walletAddress } = await request.json()

  if (!telegramUserId || !walletAddress) {
    return Response.json({ error: "Missing fields" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { walletAddress } })
  if (!user) return Response.json({ error: "User not found" }, { status: 404 })

  await db.linkedAccount.upsert({
    where: { userId_provider: { userId: user.id, provider: "TELEGRAM" } },
    update: { providerId: String(telegramUserId) },
    create: { userId: user.id, provider: "TELEGRAM", providerId: String(telegramUserId) },
  })

  return Response.json({ ok: true })
}

// Used by frontend to get Telegram link status
export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const linked = await db.linkedAccount.findUnique({
    where: { userId_provider: { userId: session.userId, provider: "TELEGRAM" } },
  })

  return Response.json({ linked: !!linked })
}
