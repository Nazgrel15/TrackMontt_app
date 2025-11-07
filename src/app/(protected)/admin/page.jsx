// src/app/(protected)/admin/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

function getRoleFromCookie() {
  const raw = cookies().get("tm_auth")?.value;
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    return parsed?.role || null;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const role = getRoleFromCookie();
  if (role !== "Administrador") {
    // no es admin → fuera de aquí
    redirect("/dashboard");
  }
  return <AdminClient />;
}
