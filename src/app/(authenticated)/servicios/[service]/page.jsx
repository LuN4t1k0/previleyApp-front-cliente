"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { DateRangePicker, Divider } from "@tremor/react";
import { toast } from "react-hot-toast";
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiDashboardLine,
  RiFileList3Line,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import useEmpresaCompleta from "@/hooks/useEmpresaCompleta";
import useServiceDashboard from "@/hooks/useServiceDashboard";
import {
  resolveServiceDefinition,
  resolveServiceKeyFromName,
} from "@/config/clientServices.config";
import MetricCard from "@/components/dashboard/MetricCard";
import apiService from "@/app/api/apiService";
import { formatCurrency, formatDate } from "@/utils/formatters";
import PageShell from "@/components/PageShell/PageShell";
import moraTabsConfig from "@/config/module/mora/moraTabs.config";
import licenciasClientTabs from "@/config/module/licencias/licenciasClientTabs.config";
import pagexTabsConfig from "@/config/module/pagex/pagexTabs";

const toISODate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

const formatTimelineRow = (row) => ({
  periodo: row.periodo,
  regularizado: formatCurrency(row.regularizado || 0),
  pago: formatCurrency(row.pago || 0),
});

const formatDebtRow = (row) => ({
  entidad: row.entidad,
  solicitado: formatCurrency(row.solicitado || 0),
  recuperado: formatCurrency(row.recuperado || 0),
  porcentaje: `${Number(row.porcentajeRecuperado || 0).toFixed(2)}%`,
});

const formatEvolutionRow = (row) => ({
  mes: row.mes,
  licencias: row.cantidadLicencias,
  dias: row.totalDias,
});

const buildRangeParams = (range) => {
  if (!range?.from || !range?.to) return undefined;
  return {
    from: toISODate(range.from),
    to: toISODate(range.to),
  };
};

const preferedEmpresaRut = (empresas = [], initialRut) => {
  if (initialRut && empresas.some((item) => item.empresaRut === initialRut)) {
    return initialRut;
  }
  return empresas[0]?.empresaRut || "";
};

const getServiceEntry = (servicesByType, definition, slug) => {
  if (!definition) return null;
  return (
    servicesByType.find(
      (entry) =>
        entry.definition?.key === definition.key ||
        entry.definition?.slug === slug ||
        entry.serviceKey === definition.key
    ) || null
  );
};

const moraHubCards = [
  {
    title: "Dashboard",
    description:
      "Indicadores ejecutivos, evolución y estado general de mora presunta.",
    href: "/servicios/mora-presunta?tab=dashboard-global",
    icon: RiDashboardLine,
    tone: "from-rose-500 to-amber-500",
  },
  {
    title: "Gestiones",
    description:
      "Seguimiento operativo de casos, avances y estados de regularización.",
    href: "/servicios/mora-presunta?tab=gestiones",
    icon: RiFileList3Line,
    tone: "from-blue-500 to-cyan-500",
  },
  {
    title: "Planificación",
    description:
      "Organización de prioridades y próximos pasos del servicio.",
    href: null,
    icon: RiCalendarLine,
    tone: "from-slate-700 to-indigo-500",
    status: "Próximamente",
  },
];

const MoraServiceHub = () => (
  <section className="pb-16">
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-10 sm:px-6 lg:px-8">
      <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-12">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">
            Servicio contratado
          </span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Mora Presunta
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500 sm:text-base">
            Accede a las áreas principales del servicio desde un solo lugar.
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {moraHubCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <article className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]">
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.tone}`} />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-700">
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-950">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {card.description}
              </p>
              {card.href ? (
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
                  Ingresar
                  <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              ) : (
                <span className="mt-auto inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {card.status}
                </span>
              )}
            </article>
          );

          return card.href ? (
            <Link key={card.title} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.title} aria-disabled="true">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const ServiceDetailPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.service;
  const tabFromUrl = searchParams?.get("tab");
  const definition = resolveServiceDefinition(slug);
  const inferredKey = definition?.key || resolveServiceKeyFromName(slug);

  if (inferredKey === "mora") {
    if (!tabFromUrl) {
      return <MoraServiceHub />;
    }

    return <PageShell moduleTitle="Mora Presunta" tabsConfig={moraTabsConfig} />;
  }

  if (inferredKey === "licencias") {
    return <PageShell moduleTitle="Licencias Médicas" tabsConfig={licenciasClientTabs} />;
  }

  if (inferredKey === "pagex") {
    return <PageShell moduleTitle="Pagos en Exceso" tabsConfig={pagexTabsConfig} />;
  }

  return <GenericServiceContent definition={definition} slug={slug} />;
};

const GenericServiceContent = ({ definition, slug }) => {
  const searchParams = useSearchParams();
  const initialEmpresaFromQuery = searchParams?.get("empresa") || undefined;

  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const {
    servicesByType,
    loading: loadingServicios,
  } = useEmpresasServicios(empresas);

  const serviceEntry = useMemo(
    () => getServiceEntry(servicesByType, definition, slug),
    [servicesByType, definition, slug]
  );

  const empresasDisponibles = useMemo(
    () => serviceEntry?.empresas || [],
    [serviceEntry]
  );
  const serviceKey =
    definition?.key ||
    resolveServiceKeyFromName(serviceEntry?.definition?.label || slug);

  const defaultEmpresaRut = useMemo(
    () => preferedEmpresaRut(empresasDisponibles, initialEmpresaFromQuery),
    [empresasDisponibles, initialEmpresaFromQuery]
  );

  const [selectedEmpresaRut, setSelectedEmpresaRut] = useState(defaultEmpresaRut);
  const [range, setRange] = useState({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    setSelectedEmpresaRut(defaultEmpresaRut);
  }, [defaultEmpresaRut]);

  const normalizedRange = useMemo(() => buildRangeParams(range), [range]);

  const {
    data: dashboardData,
    loading: loadingDashboard,
    error: dashboardError,
    refetch,
  } = useServiceDashboard(serviceKey, selectedEmpresaRut, normalizedRange);

  const {
    data: empresaData,
    loading: loadingEmpresa,
    error: empresaError,
    refetch: refetchEmpresa,
  } = useEmpresaCompleta(selectedEmpresaRut);

  useEffect(() => {
    if (!selectedEmpresaRut) return;
    refetch();
    refetchEmpresa();
  }, [selectedEmpresaRut, normalizedRange, refetch, refetchEmpresa]);

  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await apiService.get(`/empresa-documentos/${documentId}`);
      const url = response?.data?.data?.url;
      if (!url) {
        toast.error("No fue posible obtener el documento.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error al descargar documento", error);
      toast.error("Error al descargar el documento.");
    }
  };

  if (!definition) {
    return (
      <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-10">
          <div className="glass-panel rounded-[2rem] p-8 text-sm text-[color:var(--text-secondary)] ">
            El servicio solicitado no existe. {" "}
            <Link
              href="/servicios"
              className="font-semibold text-[color:var(--theme-primary)]"
            >
              Volver al listado de servicios
            </Link>
            .
          </div>
        </div>
      </section>
    );
  }

  const isLoading =
    loadingEmpresas ||
    loadingServicios ||
    loadingDashboard ||
    loadingEmpresa;

  return (
    <section className="pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 md:px-6">
        <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">
                Servicio
              </span>
              <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
                {definition.icon} {definition.label}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)] sm:text-base">
                {definition.description}
              </p>
            </div>
            {empresasDisponibles.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-[color:var(--text-secondary)] shadow-sm">
                <label
                  htmlFor="empresa-selector"
                  className="font-semibold text-[color:var(--text-primary)]"
                >
                  Empresa
                </label>
                <select
                  id="empresa-selector"
                  value={selectedEmpresaRut || ""}
                  onChange={(event) => setSelectedEmpresaRut(event.target.value)}
                  className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--theme-primary)] focus:outline-none"
                >
                  {empresasDisponibles.map((empresa) => (
                    <option key={empresa.empresaRut} value={empresa.empresaRut}>
                      {empresa.empresaNombre}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[color:var(--text-secondary)]">
              Selecciona un rango de fechas para refrescar los indicadores (opcional).
            </div>
            <DateRangePicker
              value={range}
              onValueChange={setRange}
              enableSelect={false}
              enableClear
            />
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        </header>

        {isLoading ? (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-[color:var(--text-secondary)] ">
            Cargando datos del servicio...
          </div>
        ) : dashboardError ? (
          <div className="glass-panel rounded-[2rem] p-6 text-sm text-rose-500 ">
            No pudimos cargar la información del servicio. Intenta nuevamente más tarde.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                Indicadores principales
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {serviceKey === "mora" && (
                  <>
                    <MetricCard
                      label="Deuda total"
                      value={formatCurrency(dashboardData?.summary?.totalDeuda || 0)}
                      helperText="Monto total en seguimiento"
                      tone="warning"
                      icon="💼"
                    />
                    <MetricCard
                      label="Regularizado"
                      value={formatCurrency(dashboardData?.summary?.totalRegularizado || 0)}
                      helperText="Casos regularizados"
                      tone="success"
                      icon="🧾"
                    />
                    <MetricCard
                      label="Pagado"
                      value={formatCurrency(dashboardData?.summary?.totalPagado || 0)}
                      helperText="Pagos confirmados"
                      tone="success"
                      icon="✅"
                    />
                    <MetricCard
                      label="Pendiente"
                      value={formatCurrency(dashboardData?.summary?.totalPendiente || 0)}
                      helperText="Saldo por recuperar"
                      tone="warning"
                      icon="⏳"
                    />
                  </>
                )}

                {serviceKey === "pagex" && (
                  <>
                    <MetricCard
                      label="Solicitado"
                      value={formatCurrency(dashboardData?.summary?.totalSolicitado || 0)}
                      helperText="Monto total presentado"
                      tone="info"
                      icon="📥"
                    />
                    <MetricCard
                      label="Recuperado"
                      value={formatCurrency(dashboardData?.summary?.totalRecuperado || 0)}
                      helperText="Pagos ya recuperados"
                      tone="success"
                      icon="💵"
                    />
                    <MetricCard
                      label="Pendiente"
                      value={formatCurrency(dashboardData?.summary?.totalPendiente || 0)}
                      helperText="Operaciones en curso"
                      tone="warning"
                      icon="⚙️"
                    />
                    <MetricCard
                      label="Porcentaje de avance"
                      value={`${dashboardData?.cases?.porcentajeAvance || 0}%`}
                      helperText="Respecto al total de casos"
                      tone="primary"
                      icon="📈"
                    />
                  </>
                )}

                {serviceKey === "licencias" && (
                  <>
                    <MetricCard
                      label="Licencias registradas"
                      value={dashboardData?.summary?.totalLicencias || 0}
                      helperText="Total histórico"
                      tone="primary"
                      icon="📄"
                    />
                    <MetricCard
                      label="Licencias vigentes"
                      value={dashboardData?.summary?.licenciasVigentes || 0}
                      helperText="Autorizadas o en trámite"
                      tone="info"
                      icon="🕒"
                    />
                    <MetricCard
                      label="Trabajadores activos"
                      value={dashboardData?.summary?.trabajadoresConLicencia || 0}
                      helperText="Con licencias vigentes"
                      tone="success"
                      icon="👥"
                    />
                    <MetricCard
                      label="Tasa rechazo"
                      value={`${Number(dashboardData?.rates?.tasaRechazo || 0).toFixed(2)}%`}
                      helperText="Sobre el total de licencias"
                      tone="warning"
                      icon="🚫"
                    />
                  </>
                )}
              </div>
            </section>

            {serviceKey === "mora" && (
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Casos y tendencias
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="glass-panel rounded-[2rem] p-5 ">
                    <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Estado de los casos
                    </h3>
                    <Divider className="my-3" />
                    <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
                      <li>Total: {dashboardData?.cases?.total || 0}</li>
                      <li>Pendientes: {dashboardData?.cases?.pendientes || 0}</li>
                      <li>Completados: {dashboardData?.cases?.completados || 0}</li>
                      <li>Rechazados: {dashboardData?.cases?.rechazados || 0}</li>
                    </ul>
                  </div>
                  <div className="glass-panel rounded-[2rem] p-5 ">
                    <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Top pendientes
                    </h3>
                    <Divider className="my-3" />
                    <div className="space-y-2 text-xs text-[color:var(--text-secondary)]">
                      {dashboardData?.topPendientes?.length ? (
                        dashboardData.topPendientes.map((item) => (
                          <div
                            key={item.trabajadorRut}
                            className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2"
                          >
                            <span className="font-semibold text-[color:var(--text-primary)]">
                              {item.nombreCompleto}
                            </span>
                            <span className="text-[color:var(--theme-primary)]">
                              {formatCurrency(item.totalDeudaPendiente || 0)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span>No hay registros pendientes.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-[2rem] p-5 ">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Recuperación mensual
                  </h3>
                  <Divider className="my-3" />
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/60 text-xs">
                      <thead className="bg-white/70 text-left font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                        <tr>
                          <th className="px-3 py-2">Periodo</th>
                          <th className="px-3 py-2 text-right">Regularizado</th>
                          <th className="px-3 py-2 text-right">Pagado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/50">
                        {dashboardData?.timeline?.length ? (
                          dashboardData.timeline.map((row) => {
                            const formatted = formatTimelineRow(row);
                            return (
                              <tr key={row.periodo}>
                                <td className="px-3 py-2">{formatted.periodo}</td>
                                <td className="px-3 py-2 text-right">{formatted.regularizado}</td>
                                <td className="px-3 py-2 text-right">{formatted.pago}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-[color:var(--text-secondary)]"
                              colSpan={3}
                            >
                              Sin movimientos registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {serviceKey === "pagex" && (
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Distribución y pendientes
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="glass-panel rounded-[2rem] p-5 ">
                    <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Estado de los casos
                    </h3>
                    <Divider className="my-3" />
                    <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
                      <li>Total: {dashboardData?.cases?.total || 0}</li>
                      <li>Pendientes: {dashboardData?.cases?.pendientes || 0}</li>
                      <li>Resueltos: {dashboardData?.cases?.resueltos || 0}</li>
                      <li>Rechazados: {dashboardData?.cases?.rechazados || 0}</li>
                    </ul>
                  </div>
                  <div className="glass-panel rounded-[2rem] p-5 ">
                    <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Top deudas pendientes
                    </h3>
                    <Divider className="my-3" />
                    <div className="space-y-2 text-xs text-[color:var(--text-secondary)]">
                      {dashboardData?.topPendientes?.length ? (
                        dashboardData.topPendientes.map((item) => (
                          <div
                            key={item.rutTrabajador}
                            className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2"
                          >
                            <span className="font-semibold text-[color:var(--text-primary)]">
                              {item.nombreTrabajador}
                            </span>
                            <span className="text-[color:var(--theme-primary)]">
                              {formatCurrency(item.totalDeudaPendiente || 0)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span>No hay registros pendientes.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-[2rem] p-5 ">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Deuda por institución
                  </h3>
                  <Divider className="my-3" />
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/60 text-xs">
                      <thead className="bg-white/70 text-left font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                        <tr>
                          <th className="px-3 py-2">Institución</th>
                          <th className="px-3 py-2 text-right">Solicitado</th>
                          <th className="px-3 py-2 text-right">Recuperado</th>
                          <th className="px-3 py-2 text-right">Avance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/50">
                        {dashboardData?.debtByInstitution?.length ? (
                          dashboardData.debtByInstitution.map((row) => {
                            const formatted = formatDebtRow(row);
                            return (
                              <tr key={row.entidad}>
                                <td className="px-3 py-2">{formatted.entidad}</td>
                                <td className="px-3 py-2 text-right">{formatted.solicitado}</td>
                                <td className="px-3 py-2 text-right">{formatted.recuperado}</td>
                                <td className="px-3 py-2 text-right">{formatted.porcentaje}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-[color:var(--text-secondary)]"
                              colSpan={4}
                            >
                              Sin información disponible.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {serviceKey === "licencias" && (
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Distribución y evolución
                </h2>
                <div className="glass-panel rounded-[2rem] p-5 ">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Evolución mensual
                  </h3>
                  <Divider className="my-3" />
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/60 text-xs">
                      <thead className="bg-white/70 text-left font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                        <tr>
                          <th className="px-3 py-2">Mes</th>
                          <th className="px-3 py-2 text-right">Licencias</th>
                          <th className="px-3 py-2 text-right">Total días</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/50">
                        {dashboardData?.evolution?.length ? (
                          dashboardData.evolution.map((row) => {
                            const formatted = formatEvolutionRow(row);
                            return (
                              <tr key={row.mes}>
                                <td className="px-3 py-2">{formatted.mes}</td>
                                <td className="px-3 py-2 text-right">{formatted.licencias}</td>
                                <td className="px-3 py-2 text-right">{formatted.dias}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-[color:var(--text-secondary)]"
                              colSpan={3}
                            >
                              Sin información disponible.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="glass-panel rounded-[2rem] p-5 ">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Comparativo anticipos vs subsidios
                  </h3>
                  <Divider className="my-3" />
                  <div className="grid gap-3 text-sm text-[color:var(--text-secondary)] sm:grid-cols-2">
                    <div className="flex flex-col gap-1 rounded-2xl border border-white/60 bg-white/70 p-4">
                      <span className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                        Anticipos
                      </span>
                      <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                        {formatCurrency(dashboardData?.comparativo?.totalAnticipos || 0)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-2xl border border-white/60 bg-white/70 p-4">
                      <span className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                        Subsidios
                      </span>
                      <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                        {formatCurrency(dashboardData?.comparativo?.totalSubsidios || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Documentos de la empresa
                </h2>
                <Link
                  href="mailto:soporte@previley.com?subject=Actualización%20de%20documentos%20Previley"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--theme-primary-dark)]"
                >
                  Solicitar actualización
                </Link>
              </div>
              <div className="glass-panel rounded-[2rem] p-5 ">
                {empresaError ? (
                  <p className="text-sm text-rose-500">
                    Ocurrió un error al cargar los documentos.
                  </p>
                ) : (empresaData?.documentos || []).length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/60 text-xs">
                      <thead className="bg-white/70 text-left font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                        <tr>
                          <th className="px-3 py-2">Tipo</th>
                          <th className="px-3 py-2">Vencimiento</th>
                          <th className="px-3 py-2 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/50">
                        {empresaData.documentos.map((documento) => (
                          <tr key={documento.id}>
                            <td className="px-3 py-2">{documento.tipo}</td>
                            <td className="px-3 py-2">
                              {documento.fechaVencimiento
                                ? formatDate(documento.fechaVencimiento)
                                : "Sin información"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleDownloadDocument(documento.id)}
                                className="rounded-full border border-[color:var(--theme-primary)] px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-primary)]/10"
                              >
                                Descargar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-[color:var(--text-secondary)]">
                    Aún no hay documentos registrados para esta empresa.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceDetailPage;
