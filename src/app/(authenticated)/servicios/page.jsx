"use client";

import Link from "next/link";
import { useMemo } from "react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import { resolveServiceDefinition } from "@/config/clientServices.config";

const buildServiceLink = (service) => {
  if (!service?.definition) return null;
  return `/servicios/${service.definition.slug}`;
};

const ServicesPage = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const {
    servicesByType,
    loading: loadingServicios,
  } = useEmpresasServicios(empresas);

  const content = useMemo(() => {
    if (loadingEmpresas || loadingServicios) {
      return (
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
          Cargando servicios asignados...
        </div>
      );
    }

    if (!servicesByType.length) {
      return (
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
          Aún no tienes servicios contratados. Si crees que esto es un error, por
          favor contacta a tu ejecutivo Previley.
        </div>
      );
    }

    return (
      <div className="grid gap-5 lg:grid-cols-2">
        {servicesByType.map((service) => {
          const definition =
            service.definition || resolveServiceDefinition(service.serviceKey);
          if (!definition) return null;
          const empresasConServicio = service.empresas || [];
          const link = buildServiceLink(service);
          return (
            <article
              key={service.serviceKey}
              className="group flex flex-col gap-5 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-elevated"
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
                    Servicio
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                    {definition.icon} {definition.label}
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-[color:var(--theme-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)]">
                  {empresasConServicio.length}{" "}
                  {empresasConServicio.length === 1 ? "empresa" : "empresas"}
                </span>
              </header>

              <p className="text-sm text-[color:var(--text-secondary)]">
                {definition.description}
              </p>

              <div className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-[color:var(--text-secondary)]">
                <span className="font-semibold text-[color:var(--text-primary)]">
                  Empresas con este servicio
                </span>
                {empresasConServicio.map((empresa) => (
                  <span key={empresa.empresaRut} className="flex items-center justify-between">
                    <span>{empresa.empresaNombre}</span>
                    {empresa.servicio?.porcentajeCobro !== undefined ? (
                      <span className="font-semibold text-[color:var(--theme-primary)]">
                        {Number(empresa.servicio.porcentajeCobro).toFixed(2)}%
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>

              {link ? (
                <Link
                  href={link}
                  className="inline-flex items-center justify-between rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--theme-primary)] transition group-hover:bg-[color:var(--theme-primary)]/15"
                >
                  Ver dashboard y documentos
                  <span aria-hidden className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    );
  }, [loadingEmpresas, loadingServicios, servicesByType]);

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-elevated backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
            Servicios contratados
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Tus soluciones Previley
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)] sm:text-base">
            Revisa cada servicio que tienes activo, accede a indicadores,
            documentos y comparte la información necesaria para avanzar con la
            facturación.
          </p>
        </header>

        {content}
      </div>
    </section>
  );
};

export default ServicesPage;
