"use client";
import { useState, useMemo } from "react";
import Papa from "papaparse"; // 👈 Importamos la librería

// Datos mock iniciales
const INITIAL_TRABAJADORES = Object.freeze([
  { id: "T-001", rut: "11.111.111-1", nombre: "Ana González", area: "Planta" },
  { id: "T-002", rut: "22.222.222-2", nombre: "Bruno Díaz", area: "Cultivo" },
]);

// --- Función para validar cada fila del CSV ---
// (Criterio de Aceptación 2: Validación)
function validateRow(row, index) {
  const errors = [];
  // Usamos .trim() para limpiar espacios en blanco
  if (!row.rut || row.rut.trim() === "") {
    errors.push(`Fila ${index + 2}: Falta RUT.`); // +2 porque la Fila 1 es cabecera
  }
  if (!row.nombre || row.nombre.trim() === "") {
    errors.push(`Fila ${index + 2}: Falta nombre.`);
  }
  if (!row.area || row.area.trim() === "") {
    errors.push(`Fila ${index + 2}: Falta área.`);
  }
  // Aquí podrías agregar más validaciones (ej. formato de RUT)
  return errors;
}


export default function TrabajadoresClient() {
  const [trabajadores, setTrabajadores] = useState(() => [...INITIAL_TRABAJADORES]);
  const [filter, setFilter] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Lista filtrada para la tabla
  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return trabajadores;
    return trabajadores.filter(t =>
      t.nombre.toLowerCase().includes(f) ||
      t.rut.toLowerCase().includes(f) ||
      t.area.toLowerCase().includes(f)
    );
  }, [trabajadores, filter]);

  // --- Manejador del archivo (Criterio de Aceptación 1: Subida) ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setValidationErrors([]);
    setSuccessMessage("");

    // Usamos PapaParse
    Papa.parse(file, {
      header: true, // Trata la primera fila como cabecera (rut, nombre, area)
      skipEmptyLines: true,
      encoding: "ISO-8859-1",
      complete: (results) => {
        const data = results.data;
        const errors = [];
        const nuevosTrabajadores = [];

        // Validamos fila por fila
        data.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          } else {
            // (Mock) Si pasa la validación, lo preparamos para agregarlo
            nuevosTrabajadores.push({
              id: `T-${String(Math.random()).slice(2, 7)}`, // ID de prueba
              rut: row.rut,
              nombre: row.nombre,
              area: row.area,
            });
          }
        });

        if (errors.length > 0) {
          // Si hay errores, los mostramos y no importamos nada
          setValidationErrors(errors);
          setSuccessMessage("");
        } else {
          // (Criterio de Aceptación 3: Registro en tabla)
          // ÉXITO: Agregamos los nuevos trabajadores al estado (simulando la BD)
          setTrabajadores(prev => [...prev, ...nuevosTrabajadores]);
          setSuccessMessage(`¡${nuevosTrabajadores.length} trabajadores importados con éxito!`);
          setValidationErrors([]);
        }
        setIsUploading(false);
      },
      error: (err) => {
        setValidationErrors([`Error al leer el archivo: ${err.message}`]);
        setIsUploading(false);
      }
    });

    // Limpiamos el input para que se pueda subir el mismo archivo otra vez
    event.target.value = null;
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 text-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Trabajadores</h1>
      </div>

      {/* Sección de Carga de Archivo */}
      <section className="rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <h2 className="text-lg font-medium text-black">Importar desde CSV</h2>
        <p className="mt-1 text-sm text-black/60">
          Sube un archivo .csv con las columnas exactas: <b>rut</b>, <b>nombre</b>, <b>area</b>.
        </p>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
          className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     file:mr-3 file:rounded-md file:border-0
                     file:bg-blue-50 file:py-1 file:px-3
                     file:text-sm file:font-medium file:text-blue-700
                     hover:file:bg-blue-100"
        />

        {/* Mensajes de Estado */}
        {isUploading && <p className="mt-2 text-sm text-blue-600">Procesando archivo, espere...</p>}
        
        {successMessage && (
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-semibold">Se encontraron errores y no se pudo importar:</p>
            <ul className="mt-1 list-disc pl-5">
              {/* Mostramos solo los primeros 5 errores para no saturar */}
              {validationErrors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
              {validationErrors.length > 5 && <li>...y {validationErrors.length - 5} errores más.</li>}
            </ul>
          </div>
        )}
      </section>

      {/* Tabla de Trabajadores (Criterio de Aceptación 3) */}
      <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <h2 className="text-lg font-medium text-black">Trabajadores Registrados ({list.length})</h2>
          <input
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar por nombre/RUT/área…"
            className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-black/70">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">RUT</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((t) => (
                <tr key={t.id} className="odd:bg-white even:bg-slate-50/30">
                  <td className="px-4 py-3">{t.id}</td>
                  <td className="px-4 py-3">{t.rut}</td>
                  <td className="px-4 py-3">{t.nombre}</td>
                  <td className="px-4 py-3">{t.area}</td>
                  <td className="px-4 py-3 text-right">
                    {/* (Mock) Acciones simplificadas */}
                    <button className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                    <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}