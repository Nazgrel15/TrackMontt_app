// src/app/(protected)/layout.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Función helper (movida aquí para ser usada localmente)
async function getSession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token, 
      JWT_SECRET
    );
    return payload; // Retorna { userId, email, role, name, ... }
  } catch (e) {
    console.log("Error verificando JWT en Layout:", e.message);
    return null;
  }
}

export default async function ProtectedLayout({ children }) {
  
  // ================== CAMBIO AQUÍ ==================
  // 1. Primero 'await' a cookies()
  const cookieStore = await cookies(); 
  // 2. Luego .get() sobre el resultado
  const token = cookieStore.get("tm_auth")?.value; 
  // ===============================================

  const session = await getSession(token); // session ahora tiene { name, role, ... }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Pasamos el 'name' y 'role' de la sesión a los componentes */}
      <AppHeader role={session.role} userName={session.name} />
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <Sidebar role={session.role} />
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}