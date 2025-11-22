"use client";
import { useState, useEffect } from "react";

export default function WebhooksClient() {
  const [webhooks, setWebhooks] = useState([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar webhooks existentes
  const loadWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks");
      if (res.ok) setWebhooks(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWebhooks(); }, []);

  // Agregar nuevo webhook
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url,
          events: ["service.created"] // Por defecto escuchamos este evento
        })
      });

      if (res.ok) {
        setUrl("");
        loadWebhooks();
        alert("Webhook registrado correctamente");
      } else {
        alert("Error al registrar");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  // Eliminar webhook
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este webhook?")) return;
    try {
      await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" });
      loadWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-black">Webhooks (Notificaciones)</h2>
          <p className="text-sm text-gray-500">Envía datos automáticamente a otros sistemas cuando ocurren eventos.</p>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-600">
          📡
        </div>
      </div>

      {/* Formulario de Agregar */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input 
          type="url" 
          placeholder="https://api.tusegundo-sistema.com/webhook" 
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
          Agregar
        </button>
      </form>

      {/* Lista de Webhooks */}
      <div className="space-y-2">
        {loading && <p className="text-sm text-gray-400">Cargando...</p>}
        {!loading && webhooks.length === 0 && <p className="text-sm text-gray-400 italic">No hay webhooks configurados.</p>}
        
        {webhooks.map(wh => (
          <div key={wh.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-black truncate" title={wh.url}>{wh.url}</p>
              <div className="flex gap-2 mt-1">
                {wh.events.map(ev => (
                  <span key={ev} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{ev}</span>
                ))}
              </div>
            </div>
            <button onClick={() => handleDelete(wh.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg text-sm">
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}