// src/middleware.js
import { NextResponse } from "next/server";

const AUTH_COOKIE = "tm_auth";
const PROTECTED = ["/dashboard", "/planning", "/map", "/reports", "/admin", "/driver", "/perfil, "/notificaciones,];

// Decodifica el rol desde tm_auth (base64 con JSON { role: "..." })
function getRoleFromAuthCookie(req) {
  const raw = req.cookies.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  try {
    // atob está disponible en el runtime del middleware (Edge)
    const json = atob(raw);
    const parsed = JSON.parse(json);
    return parsed?.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const hasAuth = !!req.cookies.get(AUTH_COOKIE)?.value;
  const role = getRoleFromAuthCookie(req); // "Administrador" | "Supervisor" | "Chofer" | null

  // Rutas públicas y assets -> dejar pasar
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images");

  if (isPublic) {
    // Si ya está logueado y va a /login, redirigir según rol
    if (pathname.startsWith("/login") && hasAuth) {
      const target = role === "Chofer" ? "/driver" : "/dashboard";
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  // Rutas protegidas -> exigir cookie
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (needsAuth && !hasAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirecciones por rol
  // 1) Chofer no debe ver /dashboard
  if (pathname.startsWith("/dashboard") && role === "Chofer") {
    return NextResponse.redirect(new URL("/driver", req.url));
  }

  // 2) (Opcional) No-chofer no debe ver /driver
  if (pathname.startsWith("/driver") && role !== "Chofer") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// No ejecutar middleware en api/static (reduce riesgos de bucle)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
