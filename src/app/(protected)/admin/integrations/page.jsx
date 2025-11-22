import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import SsoClient from "./SsoClient";

export default async function IntegrationsPage() {
  const role = await readRole();
  if (role !== "Administrador") redirect("/dashboard");
  return <SsoClient />;
}