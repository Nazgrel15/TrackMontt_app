// src/app/(protected)/salud/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import SaludClient from "./SaludClient";

export default async function SaludPage() { // <--- async
  const role = await readRole(); // <--- await
  
  // Página solo para Administradores
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  
  return <SaludClient />;
}