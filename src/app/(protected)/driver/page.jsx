import { readRole } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import DriverClient from "./DriverClient";

export const dynamic = 'force-dynamic';


export default async function DriverPage() {
  const role = await readRole();

  if (role !== "Chofer") {
    redirect("/dashboard");
  }

  return <DriverClient />;
}