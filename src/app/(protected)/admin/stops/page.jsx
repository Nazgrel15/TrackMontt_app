import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import StopsClient from "./StopsClient"; 

export default async function StopsPage() {
  const role = await readRole();
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <StopsClient />;
}