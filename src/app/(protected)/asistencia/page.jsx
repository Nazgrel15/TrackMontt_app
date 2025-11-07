'use client';
import { useEffect, useMemo, useState } from 'react';

/** 🔹 Mock: servicios con asistencia (puedes reemplazar por fetch a tu API) */
const MOCK_SERVICES = [
  {
    id: 'VJ-1024',
    date: '2025-11-06',
    routeName: 'Ruta AM – Planta Chincui',
    passengers: [
      { id: 'p1', name: 'Ana Soto', rut: '12.345.678-9', present: true,  checkin: '06:55', checkout: null },
      { id: 'p2', name: 'Carlos Ruiz', rut: '10.111.222-3', present: true,  checkin: '07:02', checkout: null },
      { id: 'p3', name: 'Daniela Lagos', rut: '16.555.444-8', present: false, checkin: null,   checkout: null },
      { id: 'p4', name: 'Felipe Arias', rut: '11.222.333-4', present: true,  checkin: '07:05', checkout: null },
    ],
  },
  {
    id: 'VJ-1025',
    date: '2025-11-06',
    routeName: 'Ruta PM – Chinquihue',
    passengers: [
      { id: 'p1', name: 'Ana Soto', rut: '12.345.678-9', present: false, checkin: null, checkout: null },
      { id: 'p5', name: 'Gonzalo Peña', rut: '15.666.777-1', present: true, checkin: '18:10', checkout: null },
      { id: 'p6', name: 'María Torres', rut: '13.444.222-9', present: true, checkin: '18:09', checkout: null },
    ],
  },
];

export default function AsistenciaPage() {
  // 🔐 Rol simulado
  const [role] = useState('admin'); // 'admin' | 'supervisor' | 'viewer'

  // 📌 Servicio seleccionado
  const [serviceId, setServiceId] = useState(MOCK_SERVICES[0]?.id || '');
  const currentService = useMemo(
    () => MOCK_SERVICES.find(s => s.id === serviceId),
    [serviceId]
  );

  // 🗂️ Filtrado y edición local
  const [rows, setRows] = useState(currentService?.passengers || []);
  const [query, setQuery] = useState('');

  // ➕ Form "Agregar pasajero"
  const [newP, setNewP] = useState({
    name: '', rut: '', present: false, checkin: '', checkout: ''
  });

  useEffect(() => {
    setRows(currentService?.passengers || []);
  }, [serviceId]);

  const canEdit = role === 'admin' || role === 'supervisor';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) || r.rut.toLowerCase().includes(q)
    );
  }, [rows, query]);

  // 🔧 helpers
  const genId = () => 'p_' + Math.random().toString(36).slice(2, 9);

  // ✅ Agregar pasajero (solo front/mock)
  const addPassenger = () => {
    if (!canEdit) return;
    const name = newP.name.trim();
    const rut = newP.rut.trim();
    if (!name || !rut) {
      alert('Nombre y RUT son obligatorios');
      return;
    }
    const row = {
      id: genId(),
      name,
      rut,
      present: !!newP.present,
      checkin: newP.checkin || null,
      checkout: newP.checkout || null,
    };

    // agrega a la tabla visible
    setRows(prev => [...prev, row]);

    // opcional: actualizar el mock para que no se pierda al cambiar de servicio
    const idx = MOCK_SERVICES.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      const svc = MOCK_SERVICES[idx];
      MOCK_SERVICES[idx] = {
        ...svc,
        passengers: [...(svc.passengers || []), row],
      };
    }

    // limpiar formulario
    setNewP({ name: '', rut: '', present: false, checkin: '', checkout: '' });
  };

  // ❌ Eliminar pasajero (solo front/mock)
  const removePassenger = (pid) => {
    if (!canEdit) return;
    setRows(prev => prev.filter(r => r.id !== pid));
    const idx = MOCK_SERVICES.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      const svc = MOCK_SERVICES[idx];
      MOCK_SERVICES[idx] = {
        ...svc,
        passengers: (svc.passengers || []).filter(r => r.id !== pid),
      };
    }
  };

  // ✅ Editar estado manualmente
  const togglePresent = (pid) => {
    if (!canEdit) return;
    setRows(prev => prev.map(r => (r.id === pid ? { ...r, present: !r.present } : r)));

    const idx = MOCK_SERVICES.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      const svc = MOCK_SERVICES[idx];
      MOCK_SERVICES[idx] = {
        ...svc,
        passengers: (svc.passengers || []).map(r => r.id === pid ? { ...r, present: !r.present } : r),
      };
    }
  };

  // ✅ Guardar cambios (stub)
  const saveChanges = async () => {
    console.log('Guardar asistencia :: servicio', serviceId, rows);
    alert('Cambios guardados (demo). Integra tu endpoint cuando esté listo.');
  };

  // ✅ Exportación CSV
  const exportCSV = () => {
    if (!currentService) return;
    const header = [
      'Servicio','Fecha','Ruta','ID Pasajero','Nombre','RUT','Estado','Check-in','Check-out'
    ];
    const lines = filtered.map(r => ([
      currentService.id,
      currentService.date,
      currentService.routeName,
      r.id,
      r.name,
      r.rut,
      r.present ? 'Presente' : 'Ausente',
      r.checkin || '',
      r.checkout || '',
    ]));

    const csv = [header, ...lines].map(cols =>
      cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `asistencia_${currentService.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  };

  // 🔎 Utilidades
  const markAll = (value) => {
    if (!canEdit) return;
    setRows(prev => prev.map(r => ({ ...r, present: value })));
    const idx = MOCK_SERVICES.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      const svc = MOCK_SERVICES[idx];
      MOCK_SERVICES[idx] = {
        ...svc,
        passengers: (svc.passengers || []).map(r => ({ ...r, present: value })),
      };
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-4">
      {/* 🧊 Card contenedor (tema oscuro) + tipografía local */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-xl text-[15px] text-slate-900 opacity-100 [color-scheme:light]">
        <header className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Asistencia</h1>
          <p className="text-sm opacity-70 leading-7">
            Consulta y ajuste de asistencia por servicio.
          </p>
        </header>

        {/* Filtros superiores */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="service" className="text-sm opacity-80">Servicio:</label>
            <select
              id="service"
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="border border-white/20 bg-transparent rounded-xl px-3 py-2 text-[15px]"
            >
              {MOCK_SERVICES.map(s => (
                <option key={s.id} value={s.id} className="bg-[#0f1220]">
                  {s.id} — {s.routeName} ({s.date})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre o RUT…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="border border-white/20 bg-transparent rounded-xl px-3 py-2 w-64 placeholder:opacity-60 text-[15px]"
            />
            <button onClick={exportCSV} className="px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10">
              Exportar CSV
            </button>
          </div>
        </section>

        {/* ➕ Agregar pasajero */}
        {canEdit && (
          <section className="mb-4 rounded-xl border border-white/10 p-3">
            <h2 className="font-semibold mb-2 text-sm">Agregar pasajero</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newP.name}
                onChange={e => setNewP(p => ({ ...p, name: e.target.value }))}
                className="border border-white/20 bg-transparent rounded-xl px-3 py-2 text-[15px]"
              />
              <input
                type="text"
                placeholder="RUT 12.345.678-9"
                value={newP.rut}
                onChange={e => setNewP(p => ({ ...p, rut: e.target.value }))}
                className="border border-white/20 bg-transparent rounded-xl px-3 py-2 text-[15px]"
              />
              <input
                type="time"
                placeholder="Check-in"
                value={newP.checkin}
                onChange={e => setNewP(p => ({ ...p, checkin: e.target.value }))}
                className="border border-white/20 bg-transparent rounded-xl px-3 py-2 text-[15px]"
              />
              <input
                type="time"
                placeholder="Check-out"
                value={newP.checkout}
                onChange={e => setNewP(p => ({ ...p, checkout: e.target.value }))}
                className="border border-white/20 bg-transparent rounded-xl px-3 py-2 text-[15px]"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newP.present}
                    onChange={e => setNewP(p => ({ ...p, present: e.target.checked }))}
                  />
                  Presente
                </label>
                <button
                  onClick={addPassenger}
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900"

                >
                  Agregar
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Acciones masivas */}
        <section className="mb-3 flex gap-2">
          <button
            onClick={() => markAll(true)}
            disabled={!canEdit}
            className="px-3 py-2 rounded-xl border border-white/20 disabled:opacity-50 hover:bg-white/10"
          >
            Marcar todos presentes
          </button>
          <button
            onClick={() => markAll(false)}
            disabled={!canEdit}
            className="px-3 py-2 rounded-xl border border-white/20 disabled:opacity-50 hover:bg-white/10"
          >
            Marcar todos ausentes
          </button>
          {canEdit ? (
            <button
              onClick={saveChanges}
              className="ml-auto px-4 py-2 rounded-2xl bg-blue-600 text-white"
            >
              Guardar cambios
            </button>
          ) : (
            <span className="ml-auto text-sm opacity-70">
              Solo lectura (rol: {role})
            </span>
          )}
        </section>

        {/* Tabla */}
        <div className="overflow-x-auto border border-white/10 rounded-2xl">
          <table className="min-w-full text-[15px]">
            <thead className="bg-white/10">
              <tr className="text-left">
                <th className="px-4 py-3 text-[13px] font-semibold">#</th>
                <th className="px-4 py-3 text-[13px] font-semibold">Nombre</th>
                <th className="px-4 py-3 text-[13px] font-semibold">RUT</th>
                <th className="px-4 py-3 text-[13px] font-semibold">Estado</th>
                <th className="px-4 py-3 text-[13px] font-semibold">Check-in</th>
                <th className="px-4 py-3 text-[13px] font-semibold">Check-out</th>
                {canEdit && <th className="px-4 py-3 text-[13px] font-semibold">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.rut}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.present ? 'bg-green-200/20 text-green-300' : 'bg-red-200/20 text-red-300'
                      }`}
                    >
                      {r.present ? 'Presente' : 'Ausente'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{r.checkin || '—'}</td>
                  <td className="px-4 py-2">{r.checkout || '—'}</td>
                  {canEdit && (
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => togglePresent(r.id)}
                        className={`px-3 py-1.5 rounded-xl ${
                          r.present ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                        }`}
                      >
                        {r.present ? 'Marcar ausente' : 'Marcar presente'}
                      </button>
                      <button
                        onClick={() => removePassenger(r.id)}
                        className="px-3 py-1.5 rounded-xl border border-white/20 hover:bg-white/10"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center opacity-60" colSpan={canEdit ? 7 : 6}>
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Meta del servicio */}
        {currentService && (
          <p className="text-xs text-slate-500 mt-3">
            Servicio <b>{currentService.id}</b> — {currentService.routeName} — {currentService.date}
          </p>
        )}
      </div>
    </main>
  );
}
