"use client";
import { useMemo, useState } from "react";

/** ------------------ Datos mock ------------------ **/
const MOCK_DATA = Object.freeze([
  // date (YYYY-MM-DD), tipo, ruta, bus, chofer, km, costo_clp, puntual (S/N)
  { date: "2025-09-01", type: "Operacional", route: "A-12", bus: "B-01", driver: "P. Muñoz", km: 18.2, cost: 11250, onTime: "S" },
  { date: "2025-09-01", type: "Costos",      route: "B-04", bus: "B-03", driver: "L. Soto",  km: 12.7, cost:  8350, onTime: "N" },
  { date: "2025-09-02", type: "Operacional", route: "C-02", bus: "B-02", driver: "H. Pérez", km: 21.9, cost: 12600, onTime: "S" },
  { date: "2025-09-03", type: "Puntualidad", route: "A-12", bus: "B-01", driver: "P. Muñoz", km: 18.3, cost: 11400, onTime: "S" },
  { date: "2025-09-04", type: "Costos",      route: "B-04", bus: "B-03", driver: "L. Soto",  km: 13.1, cost:  8420, onTime: "S" },
  { date: "2025-09-04", type: "Operacional", route: "D-07", bus: "B-04", driver: "C. Álvarez",km: 25.4, cost: 14900, onTime: "N" },
  { date: "2025-09-05", type: "Puntualidad", route: "C-02", bus: "B-02", driver: "H. Pérez", km: 22.1, cost: 12750, onTime: "S" },
]);

const REPORT_TYPES = ["Operacional", "Costos", "Puntualidad"];

/** ------------------ Utilidades ------------------ **/
function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const headLine = headers.join(",");
  const body = rows
    .map((r) =>
      headers
        .map((h) => {
          const val = r[h] ?? "";
          // escapar comillas y comas
          const str = String(val).replaceAll('"', '""');
          return /[",\n]/.test(str) ? `"${str}"` : str;
        })
        .join(",")
    )
    .join("\n");
  return `${headLine}\n${body}`;
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** ------------------ Página ------------------ **/
export default function ReportsPage() {
  const [start, setStart] = useState("2025-09-01");
  const [end, setEnd] = useState("2025-09-05");
  const [type, setType] = useState("Operacional");
  const [showPreview, setShowPreview] = useState(true);

  const filtered = useMemo(() => {
    return MOCK_DATA.filter((r) => {
      const inType = r.type === type;
      const inFrom = start ? r.date >= start : true;
      const inTo = end ? r.date <= end : true;
      return inType && inFrom && inTo;
    });
  }, [start, end, type]);

  function handleExport() {
    const csv = toCsv(filtered);
    const filename = `trackmontt_${type.toLowerCase()}_${start || "all"}_${end || "all"}.csv`;
    download(filename, csv);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-xl font-semibold text-black">Reportes</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-lg border px-3 py-2 text-sm text-black hover:bg-black/5"
          >
            {showPreview ? "Ocultar preview" : "Mostrar preview"}
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            title="Exportar CSV (mock)"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-black">Fecha inicio</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black">Fecha fin</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-black">Tipo de reporte</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="mt-4 text-sm text-black/60">
          <span className="mr-4">Coincidencias: <b className="text-black">{filtered.length}</b></span>
          <span>Rango: <b className="text-black">{start || "—"}</b> a <b className="text-black">{end || "—"}</b></span>
        </div>
      </section>

      {/* Preview en tabla (opcional) */}
      {showPreview && (
        <section className="overflow-x-auto rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
          <table className="min-w-full text-sm text-black">
            <thead className="bg-slate-50 text-left text-black/70">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Ruta</th>
                <th className="px-4 py-3">Bus</th>
                <th className="px-4 py-3">Chofer</th>
                <th className="px-4 py-3">Km</th>
                <th className="px-4 py-3">Costo (CLP)</th>
                <th className="px-4 py-3">Puntual</th>
              </tr>
            </thead>
            <tbody className="divide-y text-black">
              {filtered.map((r, idx) => (
                <tr key={`${r.date}-${r.route}-${idx}`} className="odd:bg-white even:bg-slate-50/30">
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{r.route}</td>
                  <td className="px-4 py-3">{r.bus}</td>
                  <td className="px-4 py-3">{r.driver}</td>
                  <td className="px-4 py-3">{r.km}</td>
                  <td className="px-4 py-3">{r.cost.toLocaleString("es-CL")}</td>
                  <td className="px-4 py-3">{r.onTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
