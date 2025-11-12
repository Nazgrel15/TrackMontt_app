// src/app/(protected)/salud/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import SaludClient from "./SaludClient"; // Este lo creamos en el paso 3

export default function SaludPage() {
  const role = readRole();
  
  // Página solo para Administradores
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  
  return <SaludClient />;
}