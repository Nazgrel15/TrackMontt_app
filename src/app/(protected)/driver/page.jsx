// src/app/(protected)/driver/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import DriverClient from "./DriverClient";


export default function DriverPage() {
  const role = readRole();

  // Solo "Chofer" puede entrar a /driver
  if (role !== "Chofer") {
    redirect("/dashboard"); // o "/map" si prefieres
  }

  return <DriverClient />;
}
