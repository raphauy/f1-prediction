import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { nextUrl } = request
  
  // Skip middleware for static files and API routes
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Get token using JWT approach (works in Edge Runtime)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isLoggedIn = !!token
  const userRole = token?.role as string || ""

  // Public routes (no authentication required)
  const publicRoutes = ["/login", "/", "/register"]
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/invite/")
  
  if (isPublicRoute) {
    // Only redirect logged-in users from login and home pages
    if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/")) {
      // Redirect authenticated users to their dashboard
      // Superadmins go to admin, others go to workspaces
      const redirectTo = userRole === "superadmin" ? "/admin" : "/w"
      return NextResponse.redirect(new URL(redirectTo, nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Role-based access control
  // Only superadmins can access /admin
  if (nextUrl.pathname.startsWith("/admin") && userRole !== "superadmin") {
    return NextResponse.redirect(new URL("/w", nextUrl))
  }

  // Workspace routes - only authenticated users can access
  if (nextUrl.pathname.startsWith("/w") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}