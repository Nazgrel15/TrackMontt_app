// src/app/(protected)/driver/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import DriverClient from "./DriverClient";

export default async function DriverPage() {
  const role = await readRole();

  if (role !== "Chofer") {
    redirect("/dashboard");
  }

  // Renderizamos normalmente (SSR), sin dynamic.
  return <DriverClient />;
}
