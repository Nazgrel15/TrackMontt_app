// src/app/(protected)/alertas/page.jsx
import { redirect } from "next/navigation";
import { readRole } from "@/lib/auth.server";
import AlertsClient from "./AlertsClient";

export default function AlertsPage() {
  const role = readRole();
  
  // Solo Admin y Supervisor pueden ver alertas
  // El Chofer es redirigido
  if (role === "Chofer") {
    redirect("/driver");
  }

  // Carga el componente cliente que tiene la UI interactiva
  return <AlertsClient />;
}