"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogPanel, TextInput, Select, SelectItem, Button } from "@tremor/react";
import { RiAddLine, RiEditLine, RiSettings3Line, RiShieldKeyholeLine, RiUserUnfollowLine } from "@remixicon/react";
import { useRole } from "@/context/RoleContext";
import Restricted from "@/components/restricted/Restricted";
import CustomBadge from "@/components/badge/Badge";
import useClientAdminUsers from "@/hooks/useClientAdminUsers";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { showErrorAlert, showInfoAlert, showSuccessAlert } from "@/utils/alerts";

const emptyForm = {
  nombre: "",
  apellido: "",
  rut: "",
  telefono: "",
  email: "",
  password: "",
  rol: "cliente",
};

const roleOptions = [
  { value: "cliente", label: "Cliente" },
  { value: "cliente_admin", label: "Cliente admin" },
];

export default function ClientAdminUsuariosPage() {
  const { isClientAdmin } = useRole();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const { users, loading, error, createUser, updateUser, setEmpresas, setPermissions, deleteUser } =
    useClientAdminUsers();
  const { empresas: empresasPermitidas } = useEmpresasPermitidas();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState({ type: null, user: null });
  const [form, setForm] = useState(emptyForm);
  const [selectedEmpresas, setSelectedEmpresas] = useState([]);
  const [canSeeProtected, setCanSeeProtected] = useState(false);

  const empresaOptions = useMemo(
    () =>
      (empresasPermitidas || []).map((e) => ({
        value: e.empresaRut,
        label: e.nombre ? `${e.nombre} (${e.empresaRut})` : e.empresaRut,
      })),
    [empresasPermitidas]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users || []).filter((user) => {
      const fullName = `${user.nombre || ""} ${user.apellido || ""}`.toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const matchesText = !q || fullName.includes(q) || email.includes(q);
      const matchesRole = roleFilter === "all" || user.rol === roleFilter;
      return matchesText && matchesRole;
    });
  }, [users, search, roleFilter]);

  if (!isClientAdmin) {
    return <Restricted />;
  }

  const closeModal = () => {
    setModal({ type: null, user: null });
    setForm(emptyForm);
    setSelectedEmpresas([]);
    setCanSeeProtected(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setSelectedEmpresas([]);
    setModal({ type: "create", user: null });
  };

  const openEdit = (user) => {
    setForm({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      rut: user.rut || "",
      telefono: user.telefono || "",
      email: user.email || "",
      password: "",
      rol: user.rol || "cliente",
      estado: user.estado,
      status: user.status,
    });
    setModal({ type: "edit", user });
  };

  const openEmpresas = (user) => {
    const currentEmpresas = (user.empresas || []).map((e) => e.empresaRut);
    setSelectedEmpresas(currentEmpresas);
    setModal({ type: "empresas", user });
  };

  const openPermissions = (user) => {
    setCanSeeProtected(Boolean(user.canSeeProtected));
    setModal({ type: "permissions", user });
  };

  const openDeactivate = (user) => {
    setModal({ type: "deactivate", user });
  };

  const handleCreate = async () => {
    if (!form.nombre || !form.apellido || !form.rut || !form.telefono || !form.email || !form.password) {
      showErrorAlert("Faltan datos", "Completa todos los campos obligatorios.");
      return;
    }
    if (!selectedEmpresas.length) {
      showErrorAlert("Empresas requeridas", "Selecciona al menos una empresa.");
      return;
    }
    try {
      await createUser({ ...form, empresas: selectedEmpresas });
      showSuccessAlert("Usuario creado", "Subusuario creado correctamente.");
      closeModal();
    } catch (err) {
      showErrorAlert("Error", err?.response?.data?.message || err?.message || "No se pudo crear el usuario.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUser(modal.user.id, {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        rol: form.rol,
        estado: form.estado,
        status: form.status,
      });
      showSuccessAlert("Usuario actualizado", "Cambios guardados correctamente.");
      closeModal();
    } catch (err) {
      showErrorAlert("Error", err?.response?.data?.message || err?.message || "No se pudo actualizar.");
    }
  };

  const handleSetEmpresas = async () => {
    if (!selectedEmpresas.length) {
      showErrorAlert("Empresas requeridas", "Selecciona al menos una empresa.");
      return;
    }
    try {
      await setEmpresas(modal.user.id, { empresas: selectedEmpresas });
      showSuccessAlert("Empresas actualizadas", "Asignación guardada.");
      showInfoAlert(
        "Re-login requerido",
        "El cambio se aplicará cuando el usuario vuelva a iniciar sesión."
      );
      closeModal();
    } catch (err) {
      showErrorAlert("Error", err?.response?.data?.message || err?.message || "No se pudo asignar empresas.");
    }
  };

  const handleSetPermissions = async () => {
    try {
      await setPermissions(modal.user.id, { canSeeProtected });
      showSuccessAlert("Permisos actualizados", "Permisos guardados correctamente.");
      showInfoAlert(
        "Re-login requerido",
        "El cambio se aplicará cuando el usuario vuelva a iniciar sesión."
      );
      closeModal();
    } catch (err) {
      showErrorAlert("Error", err?.response?.data?.message || err?.message || "No se pudo actualizar permisos.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await deleteUser(modal.user.id);
      showSuccessAlert("Usuario desactivado", "El usuario fue suspendido.");
      closeModal();
    } catch (err) {
      showErrorAlert("Error", err?.response?.data?.message || err?.message || "No se pudo desactivar.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Administración de Usuarios</h1>
          <p className="text-sm text-slate-500">
            Gestiona subusuarios, empresas asignadas y permisos de visibilidad.
          </p>
        </div>
        <Button icon={RiAddLine} onClick={openCreate}>
          Nuevo subusuario
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
        <TextInput
          placeholder="Buscar por nombre o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] flex-1"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter} className="min-w-[180px]">
          <SelectItem value="all">Todos los roles</SelectItem>
          {roleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Usuario</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Rol</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Empresas</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Protegidos</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                  Cargando usuarios...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td className="px-4 py-6 text-center text-rose-500" colSpan={6}>
                  No se pudieron cargar los usuarios.
                </td>
              </tr>
            )}
            {!loading && !error && filteredUsers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              filteredUsers.map((user) => {
                const isSelf = currentUserId && Number(user.id) === Number(currentUserId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{user.rol}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(user.empresas || []).length === 0 && (
                          <span className="text-xs text-slate-400">Sin empresas</span>
                        )}
                        {(user.empresas || []).map((empresa) => (
                          <span
                            key={empresa.empresaRut}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            {empresa.nombre || empresa.empresaRut}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <CustomBadge variant={user.canSeeProtected ? "emerald" : "gray"} textTransform="normal">
                        {user.canSeeProtected ? "Habilitado" : "Bloqueado"}
                      </CustomBadge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {user.status || user.estado || "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                        >
                          <RiEditLine className="h-4 w-4" />
                          Editar
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEmpresas(user)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                            >
                              <RiSettings3Line className="h-4 w-4" />
                              Empresas
                            </button>
                            <button
                              type="button"
                              onClick={() => openPermissions(user)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                            >
                              <RiShieldKeyholeLine className="h-4 w-4" />
                              Permisos
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeactivate(user)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm hover:bg-rose-100"
                            >
                              <RiUserUnfollowLine className="h-4 w-4" />
                              Desactivar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      <Dialog open={modal.type === "create"} onClose={closeModal} className="z-50 flex items-center justify-center">
        <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">Crear subusuario</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TextInput placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextInput placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            <TextInput placeholder="RUT" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
            <TextInput placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <TextInput placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextInput placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select value={form.rol} onValueChange={(value) => setForm({ ...form, rol: value })}>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Empresas asignadas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {empresaOptions.length === 0 && (
                <span className="text-xs text-slate-400">No hay empresas disponibles.</span>
              )}
              {empresaOptions.map((opt) => {
                const checked = selectedEmpresas.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                      checked ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmpresas([...selectedEmpresas, opt.value]);
                        } else {
                          setSelectedEmpresas(selectedEmpresas.filter((v) => v !== opt.value));
                        }
                      }}
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear</Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={modal.type === "edit"} onClose={closeModal} className="z-50 flex items-center justify-center">
        <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">Editar subusuario</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TextInput placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextInput placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            <TextInput placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <TextInput placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Select value={form.rol} onValueChange={(value) => setForm({ ...form, rol: value })}>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleUpdate}>Guardar</Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Modal Empresas */}
      <Dialog open={modal.type === "empresas"} onClose={closeModal} className="z-50 flex items-center justify-center">
        <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">Asignar empresas</h3>
          <p className="mt-1 text-sm text-slate-500">
            Solo puedes asignar empresas dentro de tu alcance.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {empresaOptions.map((opt) => {
              const checked = selectedEmpresas.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                    checked ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmpresas([...selectedEmpresas, opt.value]);
                      } else {
                        setSelectedEmpresas(selectedEmpresas.filter((v) => v !== opt.value));
                      }
                    }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSetEmpresas}>Guardar</Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Modal Permisos */}
      <Dialog open={modal.type === "permissions"} onClose={closeModal} className="z-50 flex items-center justify-center">
        <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">Permisos de visibilidad</h3>
          <p className="mt-2 text-sm text-slate-500">
            Habilita la visibilidad de trabajadores protegidos para este subusuario.
          </p>
          <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={canSeeProtected}
              onChange={(e) => setCanSeeProtected(e.target.checked)}
            />
            Puede ver trabajadores protegidos
          </label>
          <p className="mt-3 text-xs text-slate-500">
            El cambio se aplicará cuando el usuario vuelva a iniciar sesión.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSetPermissions}>Guardar</Button>
          </div>
        </DialogPanel>
      </Dialog>

      {/* Modal Desactivar */}
      <Dialog open={modal.type === "deactivate"} onClose={closeModal} className="z-50 flex items-center justify-center">
        <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">Desactivar usuario</h3>
          <p className="mt-2 text-sm text-slate-500">
            El usuario quedará suspendido y no podrá iniciar sesión.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button color="red" onClick={handleDeactivate}>Desactivar</Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
