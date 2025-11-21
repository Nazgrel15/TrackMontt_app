// src/app/(protected)/driver/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import DriverClient from "./DriverClient"; // <--- Importación normal y limpia

export default async function DriverPage() { 
  const role = await readRole(); 

  // Solo "Chofer" puede entrar a /driver
  if (role !== "Chofer") {
    redirect("/dashboard"); 
  }

  return <DriverClient />;
}