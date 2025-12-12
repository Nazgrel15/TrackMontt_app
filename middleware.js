// src/middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // 👈 Importamos 'jose' para verificar JWT

const AUTH_COOKIE = "tm_auth";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Tu lista de rutas protegidas
const PROTECTED = [
  "/dashboard",
  "/planning",
  "/map",
  "/reports",
  "/admin",
  "/driver",
  "/perfil",
  "/notificaciones",
  "/asistencia",
  "/auditoria",
  "/salud"
];

// Un mapa para saber a dónde redirigir a cada rol
const ROLE_REDIRECT_MAP = {
  "Chofer": "/driver",
  "Administrador": "/dashboard",
  "Supervisor": "/dashboard"
};

export async function middleware(request) { // 👈 La función es ASÍNCRONA
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // DEBUG: Log para identificar el problema
  console.log(`[MIDDLEWARE] pathname: ${pathname}, hasToken: ${!!token}`);

  // 1. Rutas públicas y assets -> dejar pasar
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/manifest.json");

  if (isPublic) {
    // Si el usuario YA tiene un token e intenta ir a /login, lo redirigimos
    if (token && (pathname.startsWith("/login") || pathname === "/")) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role;
        const target = ROLE_REDIRECT_MAP[role] || "/dashboard";
        return NextResponse.redirect(new URL(target, request.url));
      } catch (e) {
        return NextResponse.next(); // Token malo, déjalo ir a /login
      }
    }
    return NextResponse.next();
  }

  // 2. Rutas protegidas -> verificar cookie
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (needsAuth) {
    // 2a. Si NO hay token, a /login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2b. SI HAY TOKEN, intentamos verificarlo
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role;

      // 2c. Validar acceso por rol
      if (pathname.startsWith("/dashboard") && role === "Chofer") {
        return NextResponse.redirect(new URL("/driver", request.url));
      }
      if (pathname.startsWith("/driver") && role !== "Chofer") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (pathname.startsWith("/admin") && role !== "Administrador") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (pathname.startsWith("/auditoria") && role !== "Administrador") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (pathname.startsWith("/salud") && role !== "Administrador") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Si todo está bien, dejamos que continúe
      return NextResponse.next();

    } catch (err) {
      // 2d. El token es inválido (expirado, etc.)
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

// (Tu config de matcher sigue igual)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
