// src/app/(protected)/admin/parametros/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import ParametrosClient from "./ParametrosClient";

export default async function ParametrosPage() { // <--- async
  const role = await readRole(); // <--- await
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <ParametrosClient />;
}