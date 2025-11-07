import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import StopsClient from "./StopsClient";


export default function StopsPage() {
  const role = readRole();
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <StopsClient />;
}
