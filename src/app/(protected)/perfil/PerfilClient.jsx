"use client";
import { useState, useEffect } from "react";

// --- Componente Toast ---
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl">
        <span className="text-green-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}

// --- Helper de Validación ---
function validateUser({ name, email }) {
  const e = {};
  if (!name?.trim()) e.name = "El nombre es obligatorio.";
  if (!email?.trim()) e.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Formato de correo inválido.";
  return e;
}

export default function PerfilClient({ user }) {
  // Estados del Formulario
  const [name, setName] = useState(user?.name ?? "Usuario Demo");
  const [email, setEmail] = useState(user?.email ?? "demo@empresa.cl");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de UI
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'security'
  const [errors, setErrors] = useState({});
  const [toastMsg, setToastMsg] = useState(null);

  // Estados MFA
  const [mfaStatus, setMfaStatus] = useState("inactive"); // 'inactive' | 'setup' | 'active'
  const [mfaCode, setMfaCode] = useState("");
  const [qrUrl, setQrUrl] = useState(null);

  // Manejo de Guardado General
  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: name.trim(), email: email.trim() };

    const err = validateUser(payload);
    if (password && password !== confirmPassword) {
      err.password = "Las contraseñas no coinciden.";
    }

    setErrors(err);
    if (Object.keys(err).length) return;

    console.log("Datos guardados (mock):", { ...payload });
    setToastMsg("Cambios guardados exitosamente");
    setPassword("");
    setConfirmPassword("");
  }

  // Manejo de MFA
  const handleStartMfa = async () => {
    try {
      const res = await fetch("/api/auth/mfa/generate");
      if (res.ok) {
        const data = await res.json();
        setMfaCode(""); // Limpiar input
        // Aquí deberíamos guardar el secreto o QR si queremos mostrarlo, 
        // pero el componente espera que 'mfaStatus' cambie a 'setup' para mostrarlo.
        // Necesitamos un estado para la URL del QR.
        setQrUrl(data.qrImageUrl);
        setMfaStatus("setup");
      } else {
        alert("Error al iniciar configuración MFA");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const handleVerifyMfa = async () => {
    if (mfaCode.length !== 6) {
      return alert("El código debe tener 6 dígitos");
    }

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mfaCode }),
      });

      if (res.ok) {
        setMfaStatus("active");
        setToastMsg("MFA activado correctamente");
        setMfaCode("");
      } else {
        const data = await res.json();
        alert(data.error || "Código inválido");
      }
    } catch (e) {
      console.error(e);
      alert("Error al verificar código");
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-12 text-slate-800">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración de Cuenta</h1>
        <p className="mt-2 text-slate-500">Gestiona tu información personal y la seguridad de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

        {/* Columna Izquierda: Resumen */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5">
            <div className="absolute top-0 left-0 h-24 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="relative mt-12 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200 shadow-md flex items-center justify-center text-3xl font-bold text-slate-400">
                {name.charAt(0).toUpperCase()}
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                <div className="mt-1 flex justify-center">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {user?.role || "Usuario"}
                  </span>
                </div>
              </div>

              <div className="mt-6 w-full border-t border-slate-100 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Miembro desde</span>
                  <span className="font-medium text-slate-900">2024</span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Estado</span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Activo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación Móvil (si fuera necesario) o Info Extra */}
          <div className="rounded-2xl bg-blue-50 p-5 border border-blue-100">
            <h3 className="font-semibold text-blue-900">¿Necesitas ayuda?</h3>
            <p className="mt-1 text-sm text-blue-700">
              Si tienes problemas con tu cuenta, contacta al soporte técnico.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Formularios */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden">

            {/* Tabs Header */}
            <div className="border-b border-slate-100">
              <nav className="flex gap-6 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`border-b-2 py-4 text-sm font-medium transition-colors ${activeTab === "personal"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                >
                  Datos Personales
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`border-b-2 py-4 text-sm font-medium transition-colors ${activeTab === "security"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                >
                  Seguridad
                </button>
              </nav>
            </div>

            {/* Contenido Tabs */}
            <div className="p-6 sm:p-8">

              {/* --- TAB: DATOS PERSONALES --- */}
              {activeTab === "personal" && (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre Completo</label>
                      <input
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500 transition-all"
                        placeholder="Tu nombre"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo Electrónico</label>
                      <input
                        type="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500 transition-all"
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="col-span-2">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-start">
                          <span className="bg-white pr-3 text-sm font-medium text-slate-500">Cambio de Contraseña</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="col-span-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{errors.password}</p>}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}

              {/* --- TAB: SEGURIDAD (MFA) --- */}
              {activeTab === "security" && (
                <div className="space-y-8 animate-in fade-in duration-300">

                  {/* Estado Actual */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <h3 className="font-medium text-slate-900">Autenticación de Dos Factores (2FA)</h3>
                      <p className="text-sm text-slate-500">Añade una capa extra de seguridad a tu cuenta.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${mfaStatus === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}>
                      {mfaStatus === "active" ? "Activado" : "Inactivo"}
                    </span>
                  </div>

                  {/* Flujo de Activación */}
                  {mfaStatus === "inactive" && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Protege tu cuenta</h3>
                      <p className="mx-auto mt-2 max-w-md text-slate-600">
                        Recomendamos activar 2FA para evitar accesos no autorizados. Necesitarás una app como Google Authenticator.
                      </p>
                      <button
                        onClick={handleStartMfa}
                        className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all"
                      >
                        Comenzar Configuración
                      </button>
                    </div>
                  )}

                  {mfaStatus === "setup" && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">Configura tu Authenticator</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* QR Code Area */}
                        <div className="flex flex-col items-center justify-center space-y-4 border-r border-slate-100 pr-0 md:pr-8">
                          <div className="h-48 w-48 rounded-xl bg-white p-2 shadow-inner border border-slate-200 flex items-center justify-center">
                            {/* QR Real */}
                            {qrUrl ? (
                              <img src={qrUrl} alt="QR MFA" className="h-full w-full object-contain" />
                            ) : (
                              <div className="h-full w-full bg-slate-900 pattern-dots animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs font-mono text-slate-400">SECRET: JBSWY3DPEHPK3PXP</p>
                        </div>

                        {/* Instructions & Input */}
                        <div className="space-y-6">
                          <ol className="space-y-4 text-sm text-slate-600 list-decimal list-inside">
                            <li>Abre tu aplicación de autenticación (Google Authenticator, Authy, etc).</li>
                            <li>Escanea el código QR o ingresa la clave manualmente.</li>
                            <li>Ingresa el código de 6 dígitos que genera la app.</li>
                          </ol>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Código de Verificación
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={mfaCode}
                              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                              className="block w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-center text-2xl font-mono tracking-[0.5em] text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="000000"
                            />
                          </div>

                          <button
                            onClick={handleVerifyMfa}
                            disabled={mfaCode.length !== 6}
                            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            Verificar y Activar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {mfaStatus === "active" && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">¡2FA está activo!</h3>
                      <p className="mt-2 text-slate-600">
                        Tu cuenta está protegida. Se te solicitará un código cada vez que inicies sesión en un nuevo dispositivo.
                      </p>
                      <button
                        onClick={() => setMfaStatus("inactive")}
                        className="mt-6 text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                      >
                        Desactivar 2FA (No recomendado)
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}