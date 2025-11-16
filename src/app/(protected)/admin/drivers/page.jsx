// src/app/(protected)/admin/drivers/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import DriversClient from "./DriversClient";

export default async function DriversPage() { // <--- async
  const role = await readRole(); // <--- await
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <DriversClient />;
}