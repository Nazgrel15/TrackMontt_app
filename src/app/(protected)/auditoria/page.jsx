// src/app/(protected)/auditoria/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import AuditoriaClient from "./AuditoriaClient"; // Este lo creamos en el paso 3

export default function AuditoriaPage() {
  const role = readRole();
  
  // Página solo para Administradores
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  
  return <AuditoriaClient />;
}