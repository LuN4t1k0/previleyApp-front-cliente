"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  RiBuildingLine,
  RiArrowRightLine,
  RiBriefcaseLine,
  RiSparkling2Line,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import { resolveServiceDefinition } from "@/config/clientServices.config";
import { formatServiceCharge } from "@/utils/formatters";

const buildServiceLink = (definition) => {
  if (!definition?.slug) return null;
  return `/servicios/${definition.slug}`;
};

const resolveServiceCode = (definition, empresaServicio) => {
  if (empresaServicio?.abreviatura) return empresaServicio.abreviatura;
  const nombre = String(empresaServicio?.nombre || "").toLowerCase();
  if (definition?.key === "mora") {
    if (nombre.includes("regular")) return "MP-R";
    if (nombre.includes("presunta")) return "MP-P";
    return "MP";
  }
  if (definition?.key === "pagex") return "PX";
  if (definition?.key === "licencias") return "LM";
  return definition?.key ? definition.key.toUpperCase() : "SRV";
};

const ServicesPage = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const { servicesByAssignment, loading: loadingServicios } =
    useEmpresasServicios(empresas);

  const content = useMemo(() => {
    if (loadingEmpresas || loadingServicios) {
      return (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500">
          Cargando servicios asignados...
        </div>
      );
    }

    if (!servicesByAssignment.length) {
      return (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500">
          Aún no tienes servicios contratados. Si crees que esto es un error, por
          favor contacta a tu ejecutivo Previley.
        </div>
      );
    }

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {servicesByAssignment.map((service) => {
          const definition =
            service.definition || resolveServiceDefinition(service.serviceKey);
          const fallbackDefinition = {
            key: service.serviceKey || null,
            slug: null,
            label: service.nombre || "Servicio",
            description: "Servicio contratado por tu empresa.",
            icon: "🧾",
          };
          const activeDefinition = definition || fallbackDefinition;
          const empresasConServicio = service.empresas || [];
          const link = definition ? buildServiceLink(definition) : null;
          return (
            <article
              key={service.servicioId || service.nombre || service.serviceKey}
              className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">
                    Servicio
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {activeDefinition.icon} {activeDefinition.label}
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {empresasConServicio.length} {" "}
                  {empresasConServicio.length === 1 ? "empresa" : "empresas"}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {activeDefinition.description}
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/60 bg-white/80 text-xs text-slate-500">
                <div className="flex items-center gap-2 border-b border-white/60 px-4 py-3 text-xs font-semibold text-slate-700">
                  <RiBuildingLine className="h-4 w-4" />
                  Empresas con este servicio
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/70 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Empresa</th>
                        <th className="px-4 py-2">RUT</th>
                        <th className="px-4 py-2 text-center">Sigla</th>
                        <th className="px-4 py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/60 text-slate-600">
                      {empresasConServicio.map((empresa) => (
                        <tr key={empresa.empresaRut} className="hover:bg-blue-50/40">
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {empresa.empresaNombre}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-400">
                            {empresa.empresaRut}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              {resolveServiceCode(activeDefinition, empresa.servicio)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-600">
                            {formatServiceCharge(empresa.servicio)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {link ? (
                <Link
                  href={link}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"
                >
                  Ver dashboard y documentos
                  <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}

              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />
            </article>
          );
        })}
      </div>
    );
  }, [loadingEmpresas, loadingServicios, servicesByAssignment]);

  return (
    <section className="pb-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 pt-10 sm:px-6 lg:px-8">
        <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-12">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                <RiSparkling2Line className="h-3 w-3" />
                Servicios
              </span>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Tus soluciones Previley
              </h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                Revisa cada servicio activo, accede a indicadores y comparte la
                información necesaria para avanzar con la facturación.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs font-semibold text-slate-500">
              <RiBriefcaseLine className="h-4 w-4" />
              Total de servicios: {servicesByAssignment.length}
            </div>
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        </header>

        {content}
      </div>
    </section>
  );
};

export default ServicesPage;
