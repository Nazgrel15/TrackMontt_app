// src/lib/auth.server.js
import { cookies } from "next/headers";
import { jwtVerify } from "jose"; // 👈 Importar 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const AUTH_COOKIE = "tm_auth";

// Función "getSession" (reemplaza a readRole, pero más completa)
async function getSession() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // payload contiene { userId, email, name, role, empresaId }
    return payload;
  } catch (e) {
    console.error("Error verificando JWT en auth.server.js:", e.message);
    return null;
  }
}

/**
 * Lee solo el rol.
 * Las páginas de admin (fleet, drivers, etc.) usan esto.
 */
export async function readRole() {
  const session = await getSession();
  return session?.role || null;
}

/**
 * (Opcional) Lee toda la sesión si la necesitas
 */
export async function readSession() {
  const session = await getSession();
  return session;
}