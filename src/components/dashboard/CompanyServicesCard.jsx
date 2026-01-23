"use client";

import Link from "next/link";
import { resolveServiceDefinition } from "@/config/clientServices.config";
import { formatServiceCharge } from "@/utils/formatters";

const CompanyServicesCard = ({ empresa }) => {
  const servicios = empresa?.serviciosAsignados || [];

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
      <header className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[color:var(--text-primary)]">
          {empresa?.nombre || empresa?.empresaRut}
        </h3>
        <span className="text-xs text-[color:var(--text-secondary)]">
          RUT {empresa?.empresaRut}
        </span>
      </header>

      {servicios.length === 0 ? (
        <p className="text-sm text-[color:var(--text-secondary)]">
          No se registran servicios activos para esta empresa.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm text-[color:var(--text-secondary)]">
          {servicios.map((servicio) => {
            const definition =
              servicio.definition ||
              resolveServiceDefinition(servicio.serviceKey) ||
              resolveServiceDefinition(servicio.nombre);
            const href = definition ? `/servicios/${definition.slug}` : null;

            return (
              <li
                key={`${empresa?.empresaRut}-${servicio.servicioId || servicio.nombre}`}
                className="flex items-center justify-between rounded-xl border border-white/50 bg-[color:var(--theme-soft)]/70 px-3 py-2 text-xs font-medium text-[color:var(--text-primary)]"
              >
                {href ? (
                  <Link
                    href={href}
                    className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    {servicio.nombre}
                  </Link>
                ) : (
                  <span>{servicio.nombre}</span>
                )}
                <span className="text-[color:var(--theme-primary)]">
                  {formatServiceCharge(servicio)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
};

export default CompanyServicesCard;
