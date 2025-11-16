// src/app/(protected)/asistencia/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import AsistenciaClient from "./AsistenciaClient";

export default async function AsistenciaPage() { // <--- async
  const role = await readRole(); // <--- await
  
  // AC 2: Solo Admin y Supervisor pueden ver/editar
  const allowedRoles = ["Administrador", "Supervisor"];

  if (!allowedRoles.includes(role)) {
    redirect("/dashboard"); // O /driver si es chofer
  }

  return <AsistenciaClient />;
}