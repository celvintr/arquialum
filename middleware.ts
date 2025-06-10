import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Verificar si la ruta es pública
    const isPublicRoute =
      req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname.startsWith("/auth") ||
      req.nextUrl.pathname.startsWith("/api/auth")

    // Si es una ruta pública, permitir acceso sin verificación
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Si no hay token y está intentando acceder a rutas protegidas
    if (!req.nextauth.token && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Si tiene token y está en login, redirigir al dashboard
    if (req.nextauth.token && req.nextUrl.pathname === "/auth/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a rutas públicas sin verificación
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/auth") ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true
        }

        // Requerir token para rutas del dashboard
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
