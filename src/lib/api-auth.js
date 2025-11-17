// src/lib/api-auth.js
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const AUTH_COOKIE = "tm_auth";

/**
 * Obtiene la sesión de un usuario autenticado desde la cookie.
 * Si se requiere 'admin', devuelve un error 403 si el rol no coincide.
 */
export async function getApiSession(request, { requireAdmin = false } = {}) {
  // Obtenemos la cookie store de forma asíncrona
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return { session: null, error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // El payload tiene: { userId, email, name, role, empresaId }
    if (!payload || typeof payload.role !== 'string') {
      throw new Error("Payload de JWT inválido");
    }

    // AC 3: Solo Admin accede
    if (requireAdmin && payload.role !== "Administrador") {
      return { session: null, error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) };
    }

    return { session: payload, error: null };

  } catch (err) {
    console.error("Error verificando JWT en API:", err.message);
    return { session: null, error: NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 }) };
  }
}