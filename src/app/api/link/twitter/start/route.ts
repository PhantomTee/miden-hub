import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"
import { randomBytes, createHash } from "crypto"

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await getSession()
  if (!session) return NextResponse.redirect(new URL("/", appUrl))

  // PKCE: generate code_verifier + code_challenge
  const codeVerifier = base64url(randomBytes(32))
  const codeChallenge = base64url(Buffer.from(createHash("sha256").update(codeVerifier).digest()))
  const state = base64url(randomBytes(16))

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: process.env.TWITTER_REDIRECT_URI!,
    scope: "users.read tweet.read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  const res = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`)

  // Store verifier + state in short-lived cookies (10 min)
  res.cookies.set("tw_verifier", codeVerifier, { httpOnly: true, maxAge: 600, path: "/" })
  res.cookies.set("tw_state", state, { httpOnly: true, maxAge: 600, path: "/" })

  return res
}
