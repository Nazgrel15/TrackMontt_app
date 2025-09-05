// middleware.js
import { NextResponse } from "next/server";

const AUTH_COOKIE = "tm_auth";
const PROTECTED = ["/dashboard", "/planning", "/map", "/reports", "/admin", "/driver"];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const hasAuth = !!req.cookies.get(AUTH_COOKIE)?.value;

  // Rutas públicas y assets -> dejar pasar
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images");

  if (isPublic) {
    // Evita bucle: si ya está logueado y va a /login, mándalo al dashboard
    if (pathname.startsWith("/login") && hasAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas -> exigir cookie
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (needsAuth && !hasAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// No ejecutar middleware en api/static (reduce riesgos de bucle)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
