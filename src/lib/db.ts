import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("[db] DATABASE_URL is not set — queries will fail")
  }

  const adapter = new PrismaPg({
    connectionString: url,
    ssl: url?.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
  })

  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
