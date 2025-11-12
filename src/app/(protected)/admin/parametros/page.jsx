import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import ParametrosClient from "./ParametrosClient"; // Este lo creamos en el paso 2

export default function ParametrosPage() {
  const role = readRole();
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <ParametrosClient />;
}