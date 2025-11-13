"use client";
import { useState } from "react";

export default function LoginPage() {
  // Valores por defecto para pruebas rápidas
  const [email, setEmail] = useState("kevin@trackmontt.cl"); 
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);

    if (res.ok) {
      // Si el login es OK, la API nos devuelve los datos del usuario
      const user = await res.json();
      // El middleware ahora nos dejará pasar, así que redirigimos
      if (user.role === "Chofer") {
        window.location.href = "/driver";
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      // Si la API devuelve un error (401, 500), lo mostramos
      const errData = await res.json();
      setError(errData.error || "Error desconocido");
    }
  }

  return (
  <main className="min-h-screen grid place-items-center bg-slate-50">
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5"
    >
      <div className="text-center mb-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <span className="text-2xl font-bold text-blue-700">TM</span>
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-900 mt-2">
          TrackMontt
        </h1>
      </div>

      <label className="block text-sm font-medium text-neutral-700 mb-1">
        Correo
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 px-3 py-2 mb-4
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />

      <label className="block text-sm font-medium text-neutral-700 mb-1">
        Contraseña
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 px-3 py-2 mb-4
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-semibold shadow-sm
                   hover:bg-blue-700 active:bg-blue-800
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                   disabled:opacity-50"
      >
        {isLoading ? "Cargando..." : "Entrar"}
      </button>
      
      {error && (
        <p className="mt-3 text-xs text-red-600 text-center">
          {error}
        </p>
      )}
    </form>
  </main>
  );
}