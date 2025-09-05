"use client";
import { useMemo, useState } from "react";

/* ======== Datos mock estables ======== */
const ROLES = ["Administrador", "Supervisor", "Chofer"];
const INITIAL_USERS = Object.freeze([
  { id: "U-001", name: "Kevin Herrera", email: "kevin@trackmontt.cl", role: "Administrador" },
  { id: "U-002", name: "Laura Soto",   email: "laura@trackmontt.cl", role: "Supervisor"   },
  { id: "U-003", name: "Pedro Muñoz",  email: "pedro@trackmontt.cl", role: "Chofer"       },
]);

/* ======== Utilidades ======== */
function validateUser({ name, email, role }) {
  const e = {};
  if (!name?.trim()) e.name = "El nombre es obligatorio.";
  if (!email?.trim()) e.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Formato de correo inválido.";
  if (!role) e.role = "Selecciona un rol.";
  return e;
}

/* ======== Formulario ======== */
function UserForm({ initial, onCancel, onSubmit }) {
  const [name, setName]   = useState(initial?.name  ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole]   = useState(initial?.role  ?? ROLES[1]); // Supervisor por defecto
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: name.trim(), email: email.trim(), role };
    const eobj = validateUser(payload);
    setErrors(eobj);
    if (Object.keys(eobj).length) return;
    onSubmit({ id: initial?.id ?? null, ...payload });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-black">
        <div>
          <label className="block text-sm font-medium text-black">Nombre</label>
          <input
            value={name} onChange={(e)=>setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Nombre y Apellido"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Correo</label>
          <input
            value={email} onChange={(e)=>setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="usuario@empresa.cl"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black">Rol</label>
          <select
            value={role} onChange={(e)=>setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-black">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 text-sm text-black hover:bg-black/5">Cancelar</button>
        <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          {initial ? "Guardar cambios" : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}

/* ======== Tabla ======== */
function UsersTable({ users, onEdit, onDelete, onSearch }) {
  return (
    <div className="rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <input
          onChange={(e)=>onSearch(e.target.value)}
          placeholder="Buscar por nombre/correo…"
          className="w-72 max-w-full rounded-lg border text-black border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-black">
          <thead className="bg-slate-50 text-left text-black/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="odd:bg-white even:bg-slate-50/30">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>onEdit(u)} className="mr-2 rounded-lg border px-3 py-1 hover:bg-black/5">Editar</button>
                  <button onClick={()=>onDelete(u.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-red-700 hover:bg-red-100">Borrar</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-black/60">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página ======== */
export default function AdminPage() {
  // estado base
  const [users, setUsers] = useState(() => [...INITIAL_USERS]);
  const [seq, setSeq] = useState(4); // próximo ID: U-004
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f)
    );
  }, [users, filter]);

  function handleNew() {
    setEditing(null);
    setShowForm(true);
  }
  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }
  function handleSubmit(payload) {
    if (editing) {
      setUsers(prev => prev.map(u => (u.id === editing.id ? { ...editing, ...payload } : u)));
    } else {
      const id = `U-${String(seq).padStart(3, "0")}`;
      setSeq(n => n + 1);
      setUsers(prev => [...prev, { id, ...payload }]);
    }
    setShowForm(false);
    setEditing(null);
  }
  function handleEdit(u) {
    setEditing(u);
    setShowForm(true);
  }
  function handleDelete(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      {/* Header sección */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Usuarios y Roles</h1>
        <button
          onClick={handleNew}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          title="Mock: sin backend aún"
        >
          Crear usuario
        </button>
      </div>

      {showForm && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-black">{editing ? "Editar usuario" : "Nuevo usuario"}</h2>
          <UserForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}

      <UsersTable users={list} onEdit={handleEdit} onDelete={handleDelete} onSearch={setFilter} />
    </div>
  );
}
