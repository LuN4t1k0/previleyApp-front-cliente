"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  RiArrowRightLine,
  RiBriefcaseLine,
  RiBuilding4Line,
  RiCheckboxCircleLine,
  RiSparkling2Line,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import { resolveServiceDefinition } from "@/config/clientServices.config";

const buildServiceLink = (definition) => {
  if (!definition?.slug) return null;
  return `/servicios/${definition.slug}`;
};

const serviceOrder = [
  "mora",
  "licencias",
  "pagex",
  "cargas-familiares",
  "notificaciones-previsionales",
  "depositos-convenidos",
];

const serviceGroups = {
  "mp-p": "mora",
  "mp-r": "mora",
  adml: "licencias",
  rsil: "licencias",
  dc: "depositos-convenidos",
  cf: "cargas-familiares",
};

const serviceTones = {
  mora: {
    accent: "from-rose-500 to-amber-500",
    soft: "bg-rose-50 text-rose-700 border-rose-100",
    button: "border-rose-100 bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white",
  },
  licencias: {
    accent: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    button: "border-emerald-100 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
  },
  pagex: {
    accent: "from-blue-500 to-cyan-500",
    soft: "bg-blue-50 text-blue-700 border-blue-100",
    button: "border-blue-100 bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white",
  },
  default: {
    accent: "from-slate-700 to-indigo-500",
    soft: "bg-slate-50 text-slate-700 border-slate-200",
    button: "border-slate-200 bg-slate-50 text-slate-700 group-hover:bg-slate-900 group-hover:text-white",
  },
};

const getCanonicalServiceKey = (service) => {
  const definition =
    service.definition || resolveServiceDefinition(service.serviceKey);
  const key = definition?.key || service.serviceKey;
  return serviceGroups[key] || key;
};

const groupContractedServices = (servicesByType = []) => {
  const grouped = new Map();

  servicesByType.forEach((service) => {
    const canonicalKey = getCanonicalServiceKey(service);
    if (!canonicalKey) return;

    const definition = resolveServiceDefinition(canonicalKey);
    if (!definition) return;

    const empresas = service.empresas || [];
    const existing = grouped.get(canonicalKey);

    if (existing) {
      empresas.forEach((empresa) => {
        if (!existing.empresasByRut.has(empresa.empresaRut)) {
          existing.empresasByRut.set(empresa.empresaRut, empresa);
        }
      });
      return;
    }

    grouped.set(canonicalKey, {
      serviceKey: canonicalKey,
      definition,
      empresasByRut: new Map(
        empresas.map((empresa) => [empresa.empresaRut, empresa])
      ),
    });
  });

  return Array.from(grouped.values()).map((service) => ({
    ...service,
    empresas: Array.from(service.empresasByRut.values()),
  }));
};

const ServicesPage = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const { servicesByType, loading: loadingServicios } =
    useEmpresasServicios(empresas);
  const groupedServices = useMemo(
    () => groupContractedServices(servicesByType),
    [servicesByType]
  );

  const content = useMemo(() => {
    if (loadingEmpresas || loadingServicios) {
      return (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500">
          Cargando servicios asignados...
        </div>
      );
    }

    if (!groupedServices.length) {
      return (
        <div className="glass-panel rounded-[2rem] p-6 text-sm text-slate-500">
          Aún no tienes servicios contratados. Si crees que esto es un error, por
          favor contacta a tu ejecutivo Previley.
        </div>
      );
    }

    const orderedServices = [...groupedServices].sort((a, b) => {
      const aIndex = serviceOrder.indexOf(a.serviceKey);
      const bIndex = serviceOrder.indexOf(b.serviceKey);
      const safeA = aIndex === -1 ? serviceOrder.length + 1 : aIndex;
      const safeB = bIndex === -1 ? serviceOrder.length + 1 : bIndex;
      return safeA - safeB;
    });

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {orderedServices.map((service) => {
          const definition =
            service.definition || resolveServiceDefinition(service.serviceKey);
          if (!definition) return null;
          const empresasConServicio = service.empresas || [];
          const link = buildServiceLink(definition);
          const tone = serviceTones[service.serviceKey] || serviceTones.default;

          return (
            <article
              key={service.serviceKey}
              className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone.accent}`} />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl ${tone.soft}`}>
                    {definition.icon}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                      <RiCheckboxCircleLine className="h-3.5 w-3.5" />
                      Contratado
                    </span>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      {definition.label}
                    </h2>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tone.soft}`}>
                  <RiBuilding4Line className="h-3.5 w-3.5" />
                  {empresasConServicio.length}{" "}
                  {empresasConServicio.length === 1 ? "empresa" : "empresas"}
                </span>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-500">
                {definition.description}
              </p>

              {link ? (
                <Link
                  href={link}
                  className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${tone.button}`}
                >
                  Ver servicio
                  <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    );
  }, [groupedServices, loadingEmpresas, loadingServicios]);

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
                Servicios contratados
              </h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500 sm:text-base">
                Revisa los servicios activos para tus empresas, accede a sus
                indicadores y gestiones disponibles desde un solo lugar.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs font-semibold text-slate-500">
              <RiBriefcaseLine className="h-4 w-4" />
              Total de servicios: {groupedServices.length}
            </div>
          </div>
        </header>

        {content}
      </div>
    </section>
  );
};

export default ServicesPage;
