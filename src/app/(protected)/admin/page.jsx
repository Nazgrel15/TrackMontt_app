// src/app/(protected)/admin/page.jsx
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { readRole } from "@/lib/auth.server";


export default function AdminPage() {
  const role = readRole();
  if (role !== "Administrador") {
    // no es admin → fuera de aquí
    redirect("/dashboard");
  }
  return <AdminClient />;
}