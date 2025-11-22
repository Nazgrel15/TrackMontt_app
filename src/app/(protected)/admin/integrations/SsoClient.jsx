"use client";
import { useState, useEffect } from "react";

export default function SsoClient() {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState("google"); // google, azure-ad, etc.
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [issuerUrl, setIssuerUrl] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Cargar configuración
  useEffect(() => {
    fetch("/api/integrations/sso")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setEnabled(data.ssoEnabled ?? false);
          setProvider(data.ssoProvider ?? "google");
          setClientId(data.ssoClientId ?? "");
          setIssuerUrl(data.ssoIssuerUrl ?? "");
          // clientSecret no se devuelve por seguridad
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. Guardar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/sso", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          provider,
          clientId,
          clientSecret, // Solo se envía si el usuario lo escribió
          issuerUrl
        }),
      });

      if (res.ok) alert("Configuración SSO actualizada");
      else alert("Error al guardar");
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 text-black">
      <h1 className="text-xl font-semibold">Integraciones — Single Sign-On (SSO)</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Habilitar Login Corporativo</h2>
            <p className="text-sm text-gray-500">Permite a los usuarios ingresar con su cuenta de empresa.</p>
          </div>
          {/* Switch simple */}
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <hr className="border-gray-100"/>

        <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select value={provider} onChange={e=>setProvider(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="google">Google Workspace</option>
              <option value="azure-ad">Microsoft Azure AD</option>
              <option value="okta">Okta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
            <input value={clientId} onChange={e=>setClientId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
            <input 
              type="password" 
              placeholder={clientSecret ? "••••••••" : "Ingresar nuevo secreto"} 
              value={clientSecret} 
              onChange={e=>setClientSecret(e.target.value)} 
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuer URL (Opcional)</label>
            <input value={issuerUrl} onChange={e=>setIssuerUrl(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="https://accounts.google.com" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}