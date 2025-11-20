"use client";
import { useEffect, useState, useMemo } from "react";

/* ======== Componente de Formulario ======== */
function ServiceForm({ initial, buses, choferes, stopsList, onCancel, onSubmit }) {
  const [fecha, setFecha]       = useState(initial?.fecha ? new Date(initial.fecha).toISOString().split('T')[0] : "");
  const [turno, setTurno]       = useState(initial?.turno ?? "Mañana");
  const [busId, setBusId]       = useState(initial?.busId ?? "");
  const [choferId, setChoferId] = useState(initial?.choferId ?? "");
  
  // Manejo de paradas seleccionadas (ordenadas)
  const [selectedStops, setSelectedStops] = useState(initial?.paradas || []);
  const [stopToAdd, setStopToAdd] = useState("");

  // Estados de validación
  const [errors, setErrors] = useState({});

  function addStop() {
    if (stopToAdd && !selectedStops.includes(stopToAdd)) {
      setSelectedStops([...selectedStops, stopToAdd]);
      setStopToAdd("");
    }
  }

  function removeStop(stopName) {
    setSelectedStops(selectedStops.filter(s => s !== stopName));
  }

  function moveStop(index, direction) {
    const newStops = [...selectedStops];
    const [removed] = newStops.splice(index, 1);
    newStops.splice(index + direction, 0, removed);
    setSelectedStops(newStops);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = {};
    if (!fecha) err.fecha = "Fecha requerida";
    if (!busId) err.busId = "Bus requerido";
    if (!choferId) err.choferId = "Chofer requerido";
    if (selectedStops.length < 2) err.paradas = "Mínimo 2 paradas (Origen -> Destino)";

    setErrors(err);
    if (Object.keys(err).length) return;

    onSubmit({
      fecha,
      turno,
      busId,
      choferId,
      paradas: selectedStops
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm text-black">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        
        {/* Fecha y Turno */}
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={e => setFecha(e.target.value)} 
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
          {errors.fecha && <p className="text-xs text-red-600">{errors.fecha}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Turno</label>
          <select 
            value={turno} 
            onChange={e => setTurno(e.target.value)} 
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option>Mañana</option>
            <option>Tarde</option>
            <option>Noche</option>
          </select>
        </div>

        {/* Selectores Dinámicos */}
        <div>
          <label className="block text-sm font-medium">Bus Asignado</label>
          <select 
            value={busId} 
            onChange={e => setBusId(e.target.value)} 
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Seleccionar Bus --</option>
            {buses.map(b => (
              <option key={b.id} value={b.id}>{b.patente} ({b.capacidad} pax)</option>
            ))}
          </select>
          {errors.busId && <p className="text-xs text-red-600">{errors.busId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Chofer Asignado</label>
          <select 
            value={choferId} 
            onChange={e => setChoferId(e.target.value)} 
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Seleccionar Chofer --</option>
            {choferes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.choferId && <p className="text-xs text-red-600">{errors.choferId}</p>}
        </div>
      </div>

      {/* Gestor de Paradas (Ordenable) */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Ruta (Paradas Ordenadas)</label>
        
        <div className="flex gap-2 mb-2">
          <select 
            value={stopToAdd} 
            onChange={e => setStopToAdd(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2"
          >
            <option value="">-- Agregar Parada --</option>
            {stopsList.map(s => (
              <option key={s.id} value={s.nombre}>{s.nombre}</option>
            ))}
          </select>
          <button type="button" onClick={addStop} className="bg-gray-100 px-4 rounded-lg hover:bg-gray-200">+</button>
        </div>

        <ul className="space-y-2 bg-slate-50 p-3 rounded-lg min-h-[100px]">
          {selectedStops.length === 0 && <li className="text-sm text-gray-400 text-center">Agrega paradas para armar la ruta...</li>}
          {selectedStops.map((stop, idx) => (
            <li key={idx} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{idx + 1}</span>
                {stop}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" disabled={idx === 0} onClick={() => moveStop(idx, -1)} className="px-2 text-gray-500 hover:text-black">↑</button>
                <button type="button" disabled={idx === selectedStops.length - 1} onClick={() => moveStop(idx, 1)} className="px-2 text-gray-500 hover:text-black">↓</button>
                <button type="button" onClick={() => removeStop(stop)} className="px-2 text-red-500 hover:text-red-700">×</button>
              </div>
            </li>
          ))}
        </ul>
        {errors.paradas && <p className="text-xs text-red-600 mt-1">{errors.paradas}</p>}
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold">Guardar Servicio</button>
      </div>
    </form>
  );
}

/* ======== Tabla de Servicios ======== */
function ServicesTable({ services, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-slate-50 text-gray-500">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Turno</th>
            <th className="px-4 py-3">Ruta</th>
            <th className="px-4 py-3">Bus / Chofer</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {services.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(s.fecha).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">{s.turno}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-blue-700">{s.paradas[0]}</span>
                  <span className="text-xs text-gray-400">▼</span>
                  <span className="font-medium text-emerald-700">{s.paradas[s.paradas.length - 1]}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{s.bus?.patente || "Sin Bus"}</div>
                <div className="text-xs text-gray-500">{s.chofer?.nombre || "Sin Chofer"}</div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${s.estado === 'Programado' ? 'bg-slate-100 text-slate-700' : 
                    s.estado === 'EnCurso' ? 'bg-blue-100 text-blue-700' : 
                    'bg-green-100 text-green-700'}`}>
                  {s.estado}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button 
                  onClick={() => onDelete(s.id)}
                  className="text-red-600 hover:bg-red-50 px-3 py-1 rounded border border-transparent hover:border-red-100 transition"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
          {services.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay servicios programados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ======== Página Principal ======== */
export default function PlanningPage() {
  // Datos maestros
  const [buses, setBuses] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [stopsList, setStopsList] = useState([]);
  
  // Datos transaccionales
  const [services, setServices] = useState([]);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial de todos los datos
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [resBuses, resDrivers, resStops, resServices] = await Promise.all([
          fetch("/api/buses"),
          fetch("/api/drivers"),
          fetch("/api/stops"),
          fetch("/api/services")
        ]);

        if (resBuses.ok) setBuses(await resBuses.json());
        if (resDrivers.ok) setChoferes(await resDrivers.json());
        if (resStops.ok) setStopsList(await resStops.json());
        if (resServices.ok) setServices(await resServices.json());

      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newSvc = await res.json();
        // Recargar la lista completa para traer las relaciones (bus/chofer) correctamente populadas
        const refresh = await fetch("/api/services");
        setServices(await refresh.json());
        setShowForm(false);
      } else {
        alert("Error al crear servicio");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro deseas cancelar este servicio?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Planificación de Servicios</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition"
        >
          + Nuevo Servicio
        </button>
      </div>

      {showForm && (
        <ServiceForm 
          buses={buses}
          choferes={choferes}
          stopsList={stopsList}
          onCancel={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}

      {isLoading ? (
        <p className="text-center text-gray-500 py-10">Cargando planificador...</p>
      ) : (
        <ServicesTable services={services} onDelete={handleDelete} />
      )}
    </div>
  );
}