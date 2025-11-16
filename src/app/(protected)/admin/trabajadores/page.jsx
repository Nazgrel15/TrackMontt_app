// src/app/(protected)/admin/trabajadores/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import TrabajadoresClient from "./TrabajadoresClient";

export default async function TrabajadoresPage() { // <--- async
  const role = await readRole(); // <--- await
  
  const allowedRoles = ["Administrador", "Supervisor"];

  if (!allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return <TrabajadoresClient />;
}