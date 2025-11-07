import { redirect } from "next/navigation";
import FleetClient from "./FleetClient";
import { readRole } from "@/lib/auth.server";

export default function FleetPage() {
  const role = readRole();
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <FleetClient />;
}
