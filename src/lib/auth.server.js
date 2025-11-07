// src/lib/auth.server.js
import { cookies } from "next/headers";

export function readRole() {
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
