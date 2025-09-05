import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import DriversClient from "./DriversClient";

export default function DriversPage() {
  const role = readRole();
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <DriversClient />;
}