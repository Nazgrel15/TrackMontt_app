// src/app/(protected)/planning/page.jsx
"use client";
import { useEffect, useState } from "react";

/* ======== Componente de Formulario Moderno ======== */
function ServiceForm({ initial, buses, choferes, stopsList, workers, onCancel, onSubmit }) {
  const [fecha, setFecha] = useState(initial?.fecha ? new Date(initial.fecha).toISOString().split('T')[0] : "");
  const [turno, setTurno] = useState(initial?.turno ?? "Mañana");
  const [busId, setBusId] = useState(initial?.busId ?? "");
  const [choferId, setChoferId] = useState(initial?.choferId ?? "");

  const [selectedStops, setSelectedStops] = useState(initial?.paradas || []);
  const [stopToAdd, setStopToAdd] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState(initial?.trabajadorIds || []);
  const [workerSearch, setWorkerSearch] = useState("");
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
    if (selectedStops.length < 2) err.paradas = "Mínimo 2 paradas";

    setErrors(err);
    if (Object.keys(err).length) return;

    // 🔧 FIX: Convertir fecha a ISO con mediodía para evitar problema de timezone
    const [year, month, day] = fecha.split('-');
    const fechaISO = new Date(year, month - 1, day, 12, 0, 0).toISOString();

    onSubmit({
      fecha: fechaISO,
      turno,
      busId,
      choferId,
      paradas: selectedStops,
      trabajadorIds: selectedWorkers
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Fecha del Servicio</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {errors.fecha && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fecha}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Turno</label>
          <div className="relative">
            <select
              value={turno}
              onChange={e => setTurno(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option>Mañana</option><option>Tarde</option><option>Noche</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Bus Asignado</label>
          <select
            value={busId}
            onChange={e => setBusId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">Seleccionar Bus</option>
            {buses.map(b => <option key={b.id} value={b.id}>{b.patente}</option>)}
          </select>
          {errors.busId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.busId}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Chofer Asignado</label>
          <select
            value={choferId}
            onChange={e => setChoferId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">Seleccionar Chofer</option>
            {choferes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {errors.choferId && <p className="mt-1 text-xs text-red-500 font-medium">{errors.choferId}</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <label className="block text-sm font-bold text-slate-700 mb-4">Ruta (Paradas)</label>

        <div className="flex gap-3 mb-6">
          <select
            value={stopToAdd}
            onChange={e => setStopToAdd(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">-- Seleccionar Parada --</option>
            {stopsList.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <button
            type="button"
            onClick={addStop}
            className="rounded-xl bg-blue-600 px-6 text-white font-bold text-xl hover:bg-blue-700 hover:shadow-lg transition-all"
          >
            +
          </button>
        </div>

        <div className="relative pl-6 space-y-4">
          {/* Vertical Line */}
          <div className="absolute left-[35px] top-4 bottom-4 w-0.5 bg-slate-200 border-l-2 border-dashed border-slate-300"></div>

          {selectedStops.length === 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400 italic">Agrega paradas para configurar la ruta...</p>
            </div>
          )}

          {selectedStops.map((stop, idx) => (
            <div key={idx} className="relative flex items-center group">
              {/* Dot */}
              <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow-md ${idx === 0 ? 'bg-blue-500' : idx === selectedStops.length - 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                <span className="text-xs font-bold text-white">{idx + 1}</span>
              </div>

              {/* Card */}
              <div className="ml-6 flex-1 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                <span className="font-medium text-slate-700 px-2">{stop}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" disabled={idx === 0} onClick={() => moveStop(idx, -1)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">↑</button>
                  <button type="button" disabled={idx === selectedStops.length - 1} onClick={() => moveStop(idx, 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">↓</button>
                  <button type="button" onClick={() => removeStop(stop)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.paradas && <p className="text-xs text-red-500 mt-3 font-medium text-center">{errors.paradas}</p>}
      </div>

      {/* Trabajadores Asignados */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-sm font-bold text-slate-700 mb-4">Trabajadores Asignados ({selectedWorkers.length})</label>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar trabajador..."
            value={workerSearch}
            onChange={(e) => setWorkerSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* Selected Workers Chips */}
        {selectedWorkers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            {selectedWorkers.map(wId => {
              const worker = workers.find(w => w.id === wId);
              if (!worker) return null;
              return (
                <div key={wId} className="inline-flex items-center gap-2 bg-white pl-3 pr-2 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-700">{worker.nombre}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{worker.area}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkers(prev => prev.filter(id => id !== wId))}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Workers List Grouped by Area */}
        <div className="max-h-96 overflow-y-auto space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
          {Object.entries(
            workers
              .filter(w => {
                const search = workerSearch.toLowerCase();
                return w.nombre.toLowerCase().includes(search) || w.rut.toLowerCase().includes(search) || w.area.toLowerCase().includes(search);
              })
              .reduce((acc, worker) => {
                if (!acc[worker.area]) acc[worker.area] = [];
                acc[worker.area].push(worker);
                return acc;
              }, {})
          ).map(([area, areaWorkers]) => (
            <div key={area} className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{area}</h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{areaWorkers.length} trabajadores</span>
              </div>
              <div className="space-y-1">
                {areaWorkers.map(worker => (
                  <label
                    key={worker.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkers.includes(worker.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWorkers(prev => [...prev, worker.id]);
                        } else {
                          setSelectedWorkers(prev => prev.filter(id => id !== worker.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{worker.nombre}</p>
                      <p className="text-xs font-mono text-slate-500">{worker.rut}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(workers.reduce((acc, w) => ({ ...acc, [w.area]: true }), {})).length === 0 && (
            <p className="text-center text-slate-400 py-8">No hay trabajadores disponibles</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
        >
          {initial ? "Guardar Cambios" : "Crear Servicio"}
        </button>
      </div>
    </form>
  );
}

/* ======== Modal Wrapper ======== */
function ServiceModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Gestión de Servicio</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ======== Tabla de Servicios Modernizada ======== */
function ServicesTable({ services, onDelete, onClone, onEdit }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha / Turno</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ruta</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asignación</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {services.map((s) => (
              <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{new Date(s.fecha).toLocaleDateString()}</div>
                  <div className="text-xs text-slate-500">{s.turno}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div className="h-3 w-0.5 bg-slate-200"></div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-900">{s.paradas[0]}</span>
                      <span className="text-xs font-medium text-slate-500">{s.paradas[s.paradas.length - 1]}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 pl-4">
                    +{s.paradas.length - 2} paradas intermedias
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{s.chofer?.nombre || "Sin Chofer"}</div>
                      <div className="text-xs text-slate-500">{s.bus?.patente || "Sin Bus"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${s.estado === 'Programado' ? 'bg-slate-100 text-slate-700' :
                      s.estado === 'EnCurso' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' :
                        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'}`}>
                    {s.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(s)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => onClone(s)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Clonar Servicio"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No hay servicios programados aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página Principal ======== */
export default function PlanningPage() {
  const [buses, setBuses] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [stopsList, setStopsList] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [resBuses, resDrivers, resStops, resServices, resWorkers] = await Promise.all([
        fetch("/api/buses"),
        fetch("/api/drivers"),
        fetch("/api/stops"),
        fetch("/api/services"),
        fetch("/api/workers")
      ]);

      if (resBuses.ok) setBuses(await resBuses.json());
      if (resDrivers.ok) setChoferes(await resDrivers.json());
      if (resStops.ok) setStopsList(await resStops.json());
      if (resServices.ok) setServices(await resServices.json());
      if (resWorkers.ok) setWorkers(await resWorkers.json());

    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await loadAll();
        setIsModalOpen(false);
        setEditingService(null);
      } else {
        alert("Error al guardar servicio");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleClone = async (service) => {
    const d = new Date(service.fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const serviceDateStr = `${year}-${month}-${day}`;
    const baseDate = new Date(serviceDateStr + "T12:00:00");
    baseDate.setDate(baseDate.getDate() + 1);
    const defaultDate = baseDate.toISOString().split('T')[0];

    const newDate = prompt(`Clonar servicio del ${serviceDateStr}.\nFecha para el nuevo servicio:`, defaultDate);
    if (!newDate) return;

    try {
      const res = await fetch(`/api/services/clone/${service.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: newDate })
      });

      if (res.ok) {
        alert("¡Servicio clonado exitosamente!");
        await loadAll();
      } else {
        const err = await res.json();
        alert("Error al clonar: " + (err.error || "Desconocido"));
      }
    } catch (e) {
      alert("Error de conexión al clonar.");
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

  const openNewModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Planificación</h1>
          <p className="text-slate-500 mt-1">Gestione los turnos y rutas de la flota.</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Servicio
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-slate-400 font-medium">Cargando planificador...</p>
        </div>
      ) : (
        <ServicesTable
          services={services}
          onDelete={handleDelete}
          onClone={handleClone}
          onEdit={openEditModal}
        />
      )}

      <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ServiceForm
          initial={editingService}
          buses={buses}
          choferes={choferes}
          stopsList={stopsList}
          workers={workers}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      </ServiceModal>
    </div>
  );
}