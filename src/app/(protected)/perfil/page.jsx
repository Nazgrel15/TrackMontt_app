// src/app/(protected)/perfil/page.jsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import PerfilClient from "./PerfilClient";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tm_auth")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (e) {
    return null;
  }
}

export default async function PerfilPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Todos los roles pueden ver su perfil.
  // Pasamos los datos actuales de la sesión al cliente.
  return <PerfilClient user={session} />;
}