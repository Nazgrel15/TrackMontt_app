'use client';
import { useState } from 'react';
import { hasBusConflict } from '@/lib/planning/conflicts';

export default function CloneServiceDialog({ service, services, onCloned }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(service?.date || '');
  const [start, setStart] = useState(service?.start || '');
  const [end, setEnd] = useState(service?.end || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!date) return setError('Selecciona una fecha.');
    if (start && end && start >= end) return setError('La hora de término debe ser mayor.');

    const conflict = hasBusConflict(services, { busId: service.busId, date, start, end });
    if (conflict) return setError('Conflicto: el bus ya está asignado en ese rango.');

    setBusy(true);
    const cloned = {
      ...service,
      id: 'DRAFT_' + Math.random().toString(36).slice(2, 8),
      date, start, end,
      status: 'borrador',
    };
    onCloned?.(cloned);
    setBusy(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-900"
      >
        Clonar servicio
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center mb-3">
              <h3 className="text-lg font-semibold">Clonar servicio</h3>
              <span className="ml-auto text-xs text-slate-500">Bus #{service.busId}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm">
                <span className="block mb-1">Fecha</span>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2" />
              </label>
              <label className="text-sm">
                <span className="block mb-1">Inicio</span>
                <input type="time" value={start} onChange={e=>setStart(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2" />
              </label>
              <label className="text-sm">
                <span className="block mb-1">Término</span>
                <input type="time" value={end} onChange={e=>setEnd(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2" />
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={()=>setOpen(false)}
                className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50" disabled={busy}>
                Cancelar
              </button>
              <button onClick={submit}
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50" disabled={busy}>
                {busy ? 'Clonando…' : 'Crear borrador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
