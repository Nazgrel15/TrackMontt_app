// src/app/(protected)/admin/stops/page.jsx
import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import StopsClient from "./StopsClient";


export default async function StopsPage() { // <--- async
  const role = await readRole(); // <--- await
  if (role !== "Administrador") {
    redirect("/dashboard");
  }
  return <StopsClient />;
}