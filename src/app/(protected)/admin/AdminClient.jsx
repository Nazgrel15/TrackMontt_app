// src/app/(protected)/admin/AdminClient.jsx
"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

/* ======== Constantes ======== */
const ROLES = ["Supervisor", "Chofer"];

/* ======== Validaciones ======== */
function validateUser({ name, email, role }, isEditing = false) {
  const e = {};
  if (!name?.trim()) e.name = "El nombre es obligatorio.";
  if (!email?.trim()) e.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Formato de correo inválido.";
  if (!role) e.role = "Selecciona un rol.";
  return e;
}

/* ======== Formulario ======== */
function UserForm({ initial, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState(initial?.role ?? ROLES[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const isEditing = !!initial;

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: name.trim(), email: email.trim(), role };
    const eobj = validateUser(payload, isEditing);

    if (!isEditing) {
      if (!password) {
        eobj.password = "La contraseña es obligatoria.";
      } else if (password.length < 4) {
        eobj.password = "La contraseña debe tener al menos 4 caracteres.";
      } else if (password !== confirm) {
        eobj.password = "Las contraseñas no coinciden.";
      }
    }

    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    if (!isEditing) {
      onSubmit({ ...payload, password });
    } else {
      onSubmit(payload);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="Ej: Juan Pérez"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
          <input
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="usuario@empresa.cl"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Rol del Usuario</label>
          <select
            value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
          >
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          {errors.role && <p className="mt-1 text-xs text-red-500 font-medium">{errors.role}</p>}
        </div>

        {!isEditing && (
          <>
            <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <p className="text-sm text-slate-500 mb-4">Seguridad de la cuenta</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium md:col-span-2">{errors.password}</p>}
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
        >
          {initial ? "Guardar Cambios" : "Crear Usuario"}
        </button>
      </div>
    </form>
  );
}

/* ======== Tabla ======== */
function UsersTable({ users, onEdit, onDelete, onSearch, isLoading, error }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrador': return "bg-purple-100 text-purple-700 border-purple-200";
      case 'Supervisor': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'Chofer': return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Usuarios del Sistema</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-72 max-w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">Cargando usuarios...</td></tr>
            )}
            {error && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-red-500 font-medium">{error}</td></tr>
            )}
            {!isLoading && !error && users.map(u => (
              <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="text-sm text-slate-500">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(u)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => onDelete(u.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && !error && users.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No hay usuarios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Componente de Navegación ======== */
function AdminNavGrid() {
  const links = [
    { href: "/admin/fleet", title: "Gestión de Flota", icon: "🚌", color: "bg-blue-50 text-blue-600" },
    { href: "/admin/drivers", title: "Choferes", icon: "👨‍✈️", color: "bg-indigo-50 text-indigo-600" },
    { href: "/admin/stops", title: "Paradas y Rutas", icon: "🚏", color: "bg-purple-50 text-purple-600" },
    { href: "/admin/trabajadores", title: "Trabajadores", icon: "👷", color: "bg-orange-50 text-orange-600" },
    { href: "/admin/parametros", title: "Parametros", icon: "⚙️", color: "bg-slate-50 text-slate-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-3xl ${link.color} group-hover:scale-110 transition-transform`}>
            {link.icon}
          </div>
          <span className="font-bold text-slate-700 text-sm text-center group-hover:text-blue-600 transition-colors">{link.title}</span>
        </Link>
      ))}
    </div>
  );
}

/* ======== Página Principal ======== */
export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
  function handleEdit(u) {
    setEditing(u);
    setShowForm(true);
  }

  async function handleSubmit(payload) {
    setError(null);
    const url = editing ? `/api/users/${editing.id}` : '/api/users';
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el usuario");
      }

      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
    setError(null);

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar el usuario");
      }

      await loadData();
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 mt-2 text-lg">Gestión centralizada de recursos y usuarios.</p>
      </div>

      {/* Navegación */}
      <AdminNavGrid />

      {/* Sección Usuarios */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h2>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Crear Usuario
        </button>
      </div>

      {showForm && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
          <UserForm initial={editing} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      )}

      <UsersTable
        users={list}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={setFilter}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}