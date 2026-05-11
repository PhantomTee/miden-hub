import { NextRequest, NextResponse } from "next/server"
import { decrypt } from "@/lib/session"

const adminRoutes = ["/admin"]
const authRoutes = ["/contribute"]
// Routes that need both auth + completed profile
const profileRequiredRoutes = ["/contribute"]

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isAdminRoute = adminRoutes.some((r) => path.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => path.startsWith(r))

  if (!isAdminRoute && !isAuthRoute) return NextResponse.next()

  const cookie = req.cookies.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  if (isAdminRoute && !session.isAdmin) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  const needsProfile = profileRequiredRoutes.some((r) => path.startsWith(r))
  if (needsProfile && !session.profileComplete) {
    const url = new URL(`/profile/${session.walletAddress}`, req.nextUrl)
    url.searchParams.set("setup", "1")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
