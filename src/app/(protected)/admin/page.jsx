// src/app/(protected)/admin/page.jsx
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { readRole } from "@/lib/auth.server";

export default async function AdminPage() { // <--- async
  const role = await readRole(); // <--- await
  if (role !== "Administrador") {
    // no es admin → fuera de aquí
    redirect("/dashboard");
  }
  return <AdminClient />;
}