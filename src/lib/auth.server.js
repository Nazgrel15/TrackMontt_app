import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const AUTH_COOKIE = "tm_auth";

async function getSession() {
  const cookieStore = await cookies(); // <--- ¡AQUÍ DEBE ESTAR EL AWAIT!
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (e) {
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