// src/app/login/page.jsx
"use client";
import { useState } from "react";

export default function LoginPage() {
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");

  // Login Normal (Usuario + Password)
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = { email, password };
    if (mfaRequired) {
      payload.mfaToken = mfaToken;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (res.ok) {
      const user = await res.json();
      if (user.role === "Chofer") window.location.href = "/driver";
      else window.location.href = "/dashboard";
    } else {
      const errData = await res.json();
      if (res.status === 403 && errData.mfaRequired) {
        setMfaRequired(true);
        setError(null);
      } else {
        setError(errData.error || "Error desconocido");
      }
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
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900 p-4">
      <div className="w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/5">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-2xl font-bold text-white">TM</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TrackMontt</h1>
          <p className="text-slate-500 mt-2">Gestión de transporte corporativo</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {!mfaRequired ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  placeholder="nombre@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Código de Verificación</h3>
                <p className="text-sm text-slate-500">Ingresa el código de 6 dígitos de tu app autenticadora.</p>
              </div>
              <input
                type="text"
                maxLength={6}
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                placeholder="000000"
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mfaRequired ? "Verificando..." : "Iniciando sesión..."}
              </span>
            ) : (mfaRequired ? "Verificar Código" : "Iniciar Sesión")}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase font-medium tracking-wider"><span className="bg-white px-3 text-slate-400">O continúa con</span></div>
        </div>

        <button
          type="button"
          onClick={handleSSO}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          SSO Corporativo
        </button>

        {error && (
          <div className="mt-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}