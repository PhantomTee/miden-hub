import { randomBytes } from "crypto"

const nonceStore = new Map<string, { nonce: string; expiresAt: number }>()

export async function POST() {
  const nonce = randomBytes(16).toString("hex")
  const key = randomBytes(8).toString("hex")
  nonceStore.set(key, { nonce, expiresAt: Date.now() + 5 * 60 * 1000 })

  // Clean expired nonces
  for (const [k, v] of nonceStore.entries()) {
    if (v.expiresAt < Date.now()) nonceStore.delete(k)
  }

  return Response.json({ nonce, key })
}

export { nonceStore }
