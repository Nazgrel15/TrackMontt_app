export function decodeAuth(cookieValue) {
  if (!cookieValue) return null;
  try {
    const obj = JSON.parse(Buffer.from(cookieValue, "base64").toString("utf-8"));
    // Esperamos { email, role: "Administrador"|"Supervisor"|"Chofer", tenant, iat }
    if (!obj?.role) return null;
    return obj;
  } catch {
    return null;
  }
}
