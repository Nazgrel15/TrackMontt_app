import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import TrabajadoresClient from "./TrabajadoresClient";

export default function TrabajadoresPage() {
  const role = readRole();
  
  const allowedRoles = ["Administrador", "Supervisor"];

  if (!allowedRoles.includes(role)) {
    redirect("/dashboard");
  }

  return <TrabajadoresClient />;
}