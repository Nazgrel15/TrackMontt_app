// src/app/(protected)/driver/incidente/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import IncidenteClient from "./IncidenteClient";

export default async function IncidentePage() { // <--- async
  const role = await readRole(); // <--- await

  // Solo "Chofer" puede entrar a esta ruta
  if (role !== "Chofer") {
    redirect("/dashboard"); // O cualquier ruta por defecto para otros roles
  }

  return <IncidenteClient />;
}