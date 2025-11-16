// src/app/(protected)/alertas/page.jsx 
// (Tu archivo se llama 'alerts' pero la ruta en el sidebar es 'Alertas', revisa eso)
import { redirect } from "next/navigation";
import { readRole } from "@/lib/auth.server";
import AlertsClient from "./AlertsClient";

export default async function AlertsPage() { // <--- async
  const role = await readRole(); // <--- await
  
  // Solo Admin y Supervisor pueden ver alertas
  // El Chofer es redirigido
  if (role === "Chofer") {
    redirect("/driver");
  }

  // Carga el componente cliente que tiene la UI interactiva
  return <AlertsClient />;
}