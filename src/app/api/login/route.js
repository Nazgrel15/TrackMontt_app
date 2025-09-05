import { NextResponse } from "next/server";

export async function POST(req) {
  const { email = "demo@empresa.cl", role = "Supervisor", tenant = "DemoCo" } =
    await req.json().catch(() => ({}));

  const payload = { email, role, tenant, iat: Date.now() };
  const cookie = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("tm_auth", cookie, {
    path: "/",
    httpOnly: false, // demo; en prod: true
    sameSite: "Lax",
  });
  return res;
}
