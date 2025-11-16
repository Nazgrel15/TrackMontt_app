// src/app/(protected)/admin/fleet/page.jsx
import { redirect } from "next/navigation";
import FleetClient from "./FleetClient";
import { readRole } from "@/lib/auth.server";

// 1. Convertir la función en "async"
export default async function FleetPage() {
  // 2. Usar "await" al llamar a readRole
  const role = await readRole();

  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <FleetClient />;
}