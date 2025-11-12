// src/app/(protected)/driver/incidente/page.jsx
import { readRole } from "@/lib/auth.server"; // [cite: 4-15]
import { redirect } from "next/navigation";
import IncidenteClient from "./IncidenteClient";

export default function IncidentePage() {
  const role = readRole(); // [cite: 4-15]

  // Solo "Chofer" puede entrar a esta ruta
  if (role !== "Chofer") {
    redirect("/dashboard"); // O cualquier ruta por defecto para otros roles
  }

  return <IncidenteClient />;
}