"use client";

import Link from "next/link";
import { RiUserSettingsLine, RiShieldKeyholeLine } from "@remixicon/react";
import { useRole } from "@/context/RoleContext";
import Restricted from "@/components/restricted/Restricted";

const cards = [
  {
    title: "Subusuarios",
    description: "Gestiona subusuarios, empresas asignadas y permisos de visibilidad.",
    href: "/client-admin/usuarios",
    icon: RiUserSettingsLine,
  },
  {
    title: "Trabajadores protegidos",
    description: "Administra la nómina de RUT protegidos por empresa.",
    href: "/client-admin/protegidos",
    icon: RiShieldKeyholeLine,
  },
];

export default function ClientAdminHubPage() {
  const { isClientAdmin } = useRole();

  if (!isClientAdmin) {
    return <Restricted />;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Administración de Usuarios</h1>
        <p className="text-sm text-slate-500">
          Selecciona el módulo que deseas administrar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <card.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
                <p className="text-sm text-slate-500">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
