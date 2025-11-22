// src/app/login/page.jsx
"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("kevin@trackmontt.cl"); 
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login Normal (Usuario + Password)
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
      const user = await res.json();
      if (user.role === "Chofer") window.location.href = "/driver";
      else window.location.href = "/dashboard";
    } else {
      const errData = await res.json();
      setError(errData.error || "Error desconocido");
    }
  }

  // ✨ Simulación Login SSO ✨
  async function handleSSO() {
    if (!email) return setError("Ingresa tu correo corporativo primero.");
    setError(null);
    setIsLoading(true);

    // Simulamos la redirección al proveedor y el retorno con un token
    try {
      // Aquí llamamos al callback directamente con un token "mock" válido
      const res = await fetch("/api/auth/sso/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          externalToken: "VALID_MOCK_TOKEN" // Token simulado
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role === "Chofer") window.location.href = "/driver";
        else window.location.href = "/dashboard";
      } else {
        setError(data.error || "Error en autenticación SSO");
      }
    } catch (err) {
      setError("Error de conexión SSO");
    } finally {
      setIsLoading(false);
    }
  }

  return (
  <main className="min-h-screen grid place-items-center bg-slate-50 text-black">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
      <div className="text-center mb-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <span className="text-2xl font-bold text-blue-700">TM</span>
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-900 mt-2">TrackMontt</h1>
        <p className="text-sm text-gray-500">Gestión de transporte corporativo</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Cargando..." : "Entrar"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">O ingresa con</span></div>
      </div>

      <button
        type="button"
        onClick={handleSSO}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        SSO Corporativo
      </button>
      
      {error && <p className="mt-4 text-xs text-red-600 text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}
    </div>
  </main>
  );
}