// src/app/(protected)/admin/AdminClient.jsx
"use client";
import { useMemo, useState, useEffect } from "react"; // 👈 1. Importar useEffect

/* ======== Constantes ======== */
const ROLES = ["Supervisor", "Chofer"]; // Roles que un Admin puede crear/editar

/* ======== Validaciones ======== */
// 👈 2. Validación actualizada (incluye password)
function validateUser({ name, email, role }, isEditing = false) {
  const e = {};
  if (!name?.trim()) e.name = "El nombre es obligatorio.";
  if (!email?.trim()) e.email = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Formato de correo inválido.";
  if (!role) e.role = "Selecciona un rol.";
  
  // (La validación de password se hará en el formulario)
  return e;
}

/* ======== Formulario (con lógica de password) ======== */
function UserForm({ initial, onCancel, onSubmit }) {
  const [name, setName]     = useState(initial?.name  ?? "");
  const [email, setEmail]   = useState(initial?.email ?? "");
  const [role, setRole]     = useState(initial?.role  ?? ROLES[0]); // Supervisor por defecto
  // 👈 3. Estados para contraseña (solo al crear)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  
  const [errors, setErrors] = useState({});
  const isEditing = !!initial; // Estamos en modo edición si hay 'initial'

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name: name.trim(), email: email.trim(), role };
    const eobj = validateUser(payload, isEditing);

    // 👈 4. Validar contraseña SÓLO al crear
    if (!isEditing) {
      if (!password) {
        eobj.password = "La contraseña es obligatoria.";
      } else if (password.length < 4) { // (Tu seed usa "1234")
        eobj.password = "La contraseña debe tener al menos 4 caracteres.";
      } else if (password !== confirm) {
        eobj.password = "Las contraseñas no coinciden.";
      }
    }
    
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    // Si creamos, pasamos la contraseña
    if (!isEditing) {
      onSubmit({ ...payload, password });
    } else {
      onSubmit(payload); // Si editamos, no la pasamos
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-black">
        {/* ... campos name, email, role (sin cambios) ... */}
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
        
        {/* 👈 5. Mostrar campos de contraseña SÓLO al crear */}
        {!isEditing && (
          <>
            <hr className="md:col-span-2 border-gray-200" />
            <div>
              <label className="block text-sm font-medium text-black">Contraseña</label>
              <input
                type="password"
                value={password} onChange={(e)=>setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirm} onChange={(e)=>setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Repetir contraseña"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600 md:col-span-2">{errors.password}</p>}
          </>
        )}
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

/* ======== Tabla (Se añade isLoading y error) ======== */
function UsersTable({ users, onEdit, onDelete, onSearch, isLoading, error }) {
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
            {/* 👈 6. Lógica de carga y error */}
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-black/60">Cargando usuarios...</td></tr>
            )}
            {error && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-red-600">{error}</td></tr>
            )}
            {!isLoading && !error && users.map(u => (
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
            {!isLoading && !error && users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-black/60">No hay usuarios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======== Página (LÓGICA DE API) ======== */
export default function AdminPage() {
  // 👈 7. Estados para datos, carga y filtro
  const [users, setUsers]       = useState([]); // Inicia vacío
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]     = useState("");
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 👈 8. Función para cargar datos desde la API
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

  // 👈 9. Cargar datos cuando el componente se monta
  useEffect(() => {
    loadData();
  }, []);

  // 👈 10. Lógica de filtro
  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f)
    );
  }, [users, filter]);

  // --- (Funciones de formulario sin cambios) ---
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

  // 👈 11. handleSubmit (POST / PUT)
  async function handleSubmit(payload) {
    setError(null);
    const url = editing ? `/api/users/${editing.id}` : '/api/users';
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // El payload ya tiene (o no) la password desde el form
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el usuario");
      }
      
      setShowForm(false);
      setEditing(null);
      await loadData(); // Recargar la tabla
    } catch (err) {
      alert(`Error: ${err.message}`);
      setError(err.message);
    }
  }
  
  // 👈 12. handleDelete (DELETE)
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
    <div className="mx-auto grid max-w-6xl gap-6">
      {/* Header sección */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Administración — Usuarios y Roles</h1>
        <button
          onClick={handleNew}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
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

      <UsersTable 
        users={list} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onSearch={setFilter}
        isLoading={isLoading} // 👈 13. Pasar estados
        error={error}       // 👈 13. Pasar estados
      />
    </div>
  );
}