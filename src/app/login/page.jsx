"use client";
import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState("Administrador");

  async function onSubmit(e) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@empresa.cl", role }),
    });
    if (res.redirected) {
      window.location.href = res.url; // seguir la redirección a /dashboard
    }
    // el endpoint redirige a /dashboard
  }

  return (
  <main className="min-h-screen grid place-items-center bg-slate-50">
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5"
    >
      <h1 className="text-2xl font-extrabold text-neutral-900 mb-4">
        Iniciar sesión
      </h1>

      <label className="block text-sm font-medium text-neutral-700 mb-1">
        Rol
      </label>
      <select
        className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 px-3 py-2 mb-4
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                   focus:border-blue-500"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option>Administrador</option>
        <option>Supervisor</option>
        <option>Chofer</option>
      </select>

      <button
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-semibold shadow-sm
                   hover:bg-blue-700 active:bg-blue-800
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        Entrar
      </button>

      <p className="mt-3 text-xs text-neutral-600">
        *Mock de login para pruebas.
      </p>
    </form>
  </main>
  );
}
