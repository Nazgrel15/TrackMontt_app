// src/app/(protected)/admin/integrations/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import SsoClient from "./SsoClient";
import HrClient from "./HrClient"; // 👈 Importamos el nuevo componente

export default async function IntegrationsPage() {
  const role = await readRole();
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  
  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black pb-20">
      <h1 className="text-xl font-semibold">Panel de Integraciones</h1>
      
      {/* Sección 1: Seguridad (SSO) */}
      <SsoClient />

      {/* Sección 2: Recursos Humanos */}
      <HrClient />
    </div>
  );
}