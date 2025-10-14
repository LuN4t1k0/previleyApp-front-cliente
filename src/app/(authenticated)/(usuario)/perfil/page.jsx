"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import apiService from "@/app/api/apiService";

const PerfilPage = () => {
  const { data: session, update } = useSession();
  const usuarioId = session?.user?.id;

  const [formValues, setFormValues] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!usuarioId) return;

    const fetchPerfil = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/usuarios/${usuarioId}/detalle`);
        const data = response?.data || {};
        setFormValues({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          telefono: data.telefono || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        toast.error("No pudimos cargar tu perfil. Inténtalo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [usuarioId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!usuarioId) return;

    setSaving(true);
    try {
      await apiService.patch(`/usuarios/${usuarioId}`, formValues);
      toast.success("Perfil actualizado correctamente.");

      // Actualiza la sesión para reflejar los cambios
      if (typeof update === "function") {
        await update({
          ...session,
          user: {
            ...session?.user,
            nombre: formValues.nombre,
            apellido: formValues.apellido,
            email: formValues.email,
          },
        });
      }
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      toast.error("No se pudo guardar el perfil. Revisa los datos e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:px-6">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-elevated backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
            Tu cuenta
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Perfil personal
          </h1>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)] sm:text-base">
            Actualiza tus datos de contacto y asegúrate de que podamos comunicarnos contigo oportunamente.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur"
        >
          <fieldset className="grid gap-4 sm:grid-cols-2" disabled={loading || saving}>
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre" className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formValues.nombre}
                onChange={handleChange}
                required
                className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="apellido" className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={formValues.apellido}
                onChange={handleChange}
                required
                className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="telefono" className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formValues.telefono}
                onChange={handleChange}
                required
                className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                required
                className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none"
              />
            </div>
          </fieldset>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/change-password"
              className="text-sm font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
            >
              Cambiar contraseña →
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--theme-primary-dark)] disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PerfilPage;
