import { getSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL!))

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: "read:user",
    state: session.userId,
  })

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
