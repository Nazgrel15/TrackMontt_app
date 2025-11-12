// src/app/(protected)/perfil/page.jsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeAuth } from "@/lib/auth";
import PerfilClient from "./PerfilClient";

// Esta función lee la cookie del lado del servidor
async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("tm_auth")?.value;
  const session = decodeAuth(cookie);
  return session;
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