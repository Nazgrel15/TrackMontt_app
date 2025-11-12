// src/app/(protected)/perfil/PerfilClient.jsx
"use client";
import { useState } from "react";

// Helper de validación (similar al de AdminClient)
function validateUser({ name, email }) {
  const e = {};
  if (!name?.trim()) e.name = "El nombre es obligatorio.";
  if (!email?.trim()) e.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Formato de correo inválido.";
  return e;
}

export default function PerfilClient({ user }) {
  // AC 1: Nombre, correo, contraseña (mock)
  // Usamos los datos de la sesión (user) que nos pasó el componente de servidor
  const [name, setName] = useState(user?.name ?? "Usuario Demo");
  const [email, setEmail] = useState(user?.email ?? "demo@empresa.cl");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // AC 2: Activar/desactivar MFA (mock)
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // AC 3: Guardar cambios con validación
  function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    const payload = { name: name.trim(), email: email.trim() };
    
    const err = validateUser(payload);
    if (password && password !== confirmPassword) {
      err.password = "Las contraseñas no coinciden.";
    }
    
    setErrors(err);
    if (Object.keys(err).length) return;

    // --- Simulación de guardado ---
    console.log("Datos guardados (mock):", { ...payload, mfaEnabled });
    setSuccess(true);
    // Limpiar contraseñas
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6 text-black">
      <h1 className="text-xl font-semibold text-black">Mi Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        
        {/* Sección de Datos Básicos */}
        <div>
          <h2 className="text-lg font-medium text-black">Datos Personales</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-black">Nombre</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Nombre y Apellido"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Correo</label>
              <input
                type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="usuario@empresa.cl"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Sección de Contraseña */}
        <div>
          <h2 className="text-lg font-medium text-black">Cambiar Contraseña</h2>
          <p className="text-sm text-black/60">Dejar en blanco para no cambiar.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-black">Nueva Contraseña</label>
              <input
                type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600 md:col-span-2">{errors.password}</p>}
          </div>
        </div>

        {/* Sección de MFA */}
        <div>
          <h2 className="text-lg font-medium text-black">Seguridad (MFA)</h2>
          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-black">
                Activar Autenticación de Múltiples Factores (MFA)
              </span>
            </label>
            <p className="mt-1 text-xs text-black/60">
              (Simulación - Aún no implementado en backend)
            </p>
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="flex items-center justify-end gap-3 border-t pt-5">
          {success && <span className="text-sm text-green-600">¡Perfil guardado!</span>}
          <button type="submit" className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}