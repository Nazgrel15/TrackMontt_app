// src/app/(protected)/auditoria/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import AuditoriaClient from "./AuditoriaClient";

export default async function AuditoriaPage() { // <--- async
  const role = await readRole(); // <--- await
  
  // Página solo para Administradores
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  
  return <AuditoriaClient />;
}