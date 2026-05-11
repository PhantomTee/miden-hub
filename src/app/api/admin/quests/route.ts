import { db } from "@/lib/db"
import { verifyAdmin } from "@/lib/dal"
import { QuestCategory, VerificationType } from "@prisma/client"
import { z } from "zod"

const QuestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.nativeEnum(QuestCategory),
  points: z.number().int().positive(),
  verificationType: z.nativeEnum(VerificationType),
  verificationParams: z.record(z.string(), z.string()),
  isActive: z.boolean().default(true),
  maxCompletions: z.number().int().positive().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    await verifyAdmin()
    const body = await request.json()
    const parsed = QuestSchema.safeParse(body)
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

    const { verificationParams, ...rest } = parsed.data
    const quest = await db.quest.create({ data: { ...rest, verificationParams } })
    return Response.json(quest, { status: 201 })
  } catch (err) {
    console.error("[admin/quests POST]", err)
    return Response.json({ error: "Failed to create quest" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await verifyAdmin()
    const quests = await db.quest.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { completions: true } } },
    })
    return Response.json(quests)
  } catch (err) {
    console.error("[admin/quests GET]", err)
    return Response.json({ error: "Failed to load quests" }, { status: 500 })
  }
}
