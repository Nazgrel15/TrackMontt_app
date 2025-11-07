import { NextResponse } from "next/server";

export async function POST(req) {
  const { email = "demo@empresa.cl", role = "Supervisor", tenant = "DemoCo" } =
    await req.json().catch(() => ({}));

  const payload = { email, role, tenant, iat: Date.now() };
  const cookie = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");

  // Normaliza el rol y selecciona destino
  const r = String(role).trim().toLowerCase();
  const dest = r === "chofer" ? "/driver" : "/dashboard";

  const res = NextResponse.redirect(new URL(dest, req.url)); // 307 por defecto
  res.cookies.set("tm_auth", cookie, {
    path: "/",
    // En producción: httpOnly: true. En demo puedes dejarlo en false si lo necesitas en el cliente.
    httpOnly: false,
    sameSite: "Lax",
  });

  return res;
}
