"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Divider } from "@tremor/react";
import { toast } from "react-hot-toast";
import {
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
import ServiceHub from "@/components/dashboard/ServiceHub";
import MetricCard from "@/components/dashboard/MetricCard";
import apiService from "@/app/api/apiService";
import { formatCurrency, formatDate } from "@/utils/formatters";
import PageShell from "@/components/PageShell/PageShell";
import moraTabsConfig from "@/config/module/mora/moraTabs.config";
import pagexTabsConfig from "@/config/module/pagex/pagexTabs";
import OperationalServiceDashboard from "@/modules/operational-services/OperationalServiceDashboard";
import GestionHistoryTable from "@/modules/operational-services/GestionHistoryTable";
import DashboardYearSelect from "@/components/dashboard/DashboardYearSelect";
import {
  DashboardBody,
  DashboardFilters,
  DashboardHeader,
  DashboardPeriodFilter,
  DashboardStatus,
  dashboardControlClass,
  dashboardFieldClass,
} from "@/components/dashboard/ServiceDashboardLayout";
import { getDashboardYearRange } from "@/services/dashboardYear.mjs";
import { getCanonicalOperationalServiceKey } from "@/config/operationalServiceDashboards.mjs";
import LicenciasWorkspaceHub from "@/modules/licencias/LicenciasWorkspaceHub";
import LicenciasWorkspaceSection from "@/modules/licencias/LicenciasWorkspaceSection";

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

const useClientQueryParam = (key) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const readValue = () =>
      new URLSearchParams(window.location.search).get(key) || "";
    setValue(readValue());

    window.addEventListener("popstate", readValue);
    return () => window.removeEventListener("popstate", readValue);
  }, [key]);

  return value;
};

const preferedEmpresaRut = (empresas = [], initialRut) => {
  if (initialRut && empresas.some((item) => item.empresaRut === initialRut)) {
    return initialRut;
  }
  return empresas[0]?.empresaRut || "";
};

const getServiceEntry = (servicesByType, definition, slug) => {
  if (!definition) return null;
  const requestedKey =
    getCanonicalOperationalServiceKey(definition.key) || definition.key;
  return (
    servicesByType.find(
      (entry) => {
        const entryKey =
          getCanonicalOperationalServiceKey(entry.serviceKey) || entry.serviceKey;
        return (
          entryKey === requestedKey ||
          entry.definition?.slug === slug
        );
      }
    ) || null
  );
};

const moraHubCards = [
  {
    title: "Dashboard Analítico",
    description:
      "Indicadores ejecutivos, evolución y prioridad de cartera multi-empresa.",
    href: "/servicios/mora-presunta/dashboard-analitico",
    icon: RiDashboardLine,
    tone: "border-t-red-500",
  },
  {
    title: "Dashboard Operativo",
    description:
      "Seguimiento por empresa, filtros por entidad y tablero de gestión diaria.",
    href: "/servicios/mora-presunta/dashboard-operativo",
    icon: RiDashboardLine,
    tone: "border-t-emerald-500",
  },
  {
    title: "Gestiones",
    description:
      "Seguimiento operativo de casos, avances y estados de regularización.",
    href: "/servicios/mora-presunta/gestiones",
    icon: RiFileList3Line,
    tone: "border-t-blue-500",
  },
  {
    title: "Plan de trabajo",
    description:
      "Orden vigente de focos pendientes priorizados por periodo.",
    href: "/servicios/mora-presunta/priorizacion",
    icon: RiCalendarLine,
    tone: "border-t-amber-500",
  },
];

const MoraServiceHub = () => <ServiceHub title="Mora Presunta" cards={moraHubCards} />;

const ServiceDetailContentWithParams = () => {
  const params = useParams();
  const slug = params?.service;
  const tabFromUrl = useClientQueryParam("tab");
  const definition = resolveServiceDefinition(slug);
  const inferredKey = definition?.key || resolveServiceKeyFromName(slug);
  const operationalServiceKey = getCanonicalOperationalServiceKey(inferredKey);

  if (operationalServiceKey) {
    return <OperationalServiceDashboard serviceKey={operationalServiceKey} />;
  }

  if (inferredKey === "mora") {
    if (!tabFromUrl) {
      return <MoraServiceHub />;
    }

    return <PageShell moduleTitle="Mora Presunta" tabsConfig={moraTabsConfig} />;
  }

  if (inferredKey === "licencias") {
    if (!tabFromUrl) {
      return <LicenciasWorkspaceHub />;
    }
    return <LicenciasWorkspaceSection section={tabFromUrl} />;
  }

  if (inferredKey === "pagex") {
    return <PageShell moduleTitle="Pagos en Exceso" tabsConfig={pagexTabsConfig} />;
  }

  return <GenericServiceContent definition={definition} slug={slug} />;
};

const ServiceDetailContent = () => (
  <Suspense fallback={<div className="p-6 text-gray-500 animate-pulse">Cargando servicio...</div>}>
    <ServiceDetailContentWithParams />
  </Suspense>
);

const GenericServiceContentWithParams = ({ definition, slug }) => {
  const initialEmpresaFromQuery = useClientQueryParam("empresa") || undefined;

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
  const [year, setYear] = useState("");
  const [range, setRange] = useState({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    setSelectedEmpresaRut(defaultEmpresaRut);
  }, [defaultEmpresaRut]);

  const normalizedRange = useMemo(
    () => getDashboardYearRange(year) || buildRangeParams(range),
    [year, range]
  );

  const {
    data: dashboardData,
    loading: loadingDashboard,
    error: dashboardError,
  } = useServiceDashboard(serviceKey, selectedEmpresaRut, normalizedRange);

  const {
    data: empresaData,
    loading: loadingEmpresa,
    error: empresaError,
  } = useEmpresaCompleta(selectedEmpresaRut);

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
    <section className="min-h-screen bg-slate-50 text-slate-950">
      <DashboardHeader
        kind={serviceKey === "zonas-extremas" ? "Dashboard Operativo" : "Servicio"}
        title={definition.label}
        description={definition.description}
      >
        {serviceKey === "zonas-extremas" && (
          <Link
            href="/servicios/zonas-extremas/gestiones"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-700"
          >
            <RiFileList3Line className="h-4 w-4" aria-hidden="true" />
            Ver gestiones
          </Link>
        )}
      </DashboardHeader>

      <DashboardBody>
        {(empresasDisponibles.length > 0 || serviceKey === "zonas-extremas") && (
          <DashboardFilters>
            {empresasDisponibles.length > 0 && (
              <label className={dashboardFieldClass}>
                Empresa
                <select
                  value={selectedEmpresaRut || ""}
                  onChange={(event) => setSelectedEmpresaRut(event.target.value)}
                  className={dashboardControlClass}
                >
                  {empresasDisponibles.map((empresa) => (
                    <option key={empresa.empresaRut} value={empresa.empresaRut}>
                      {empresa.empresaNombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {serviceKey === "zonas-extremas" && (
              <>
                <DashboardYearSelect
                  serviceKey="zonas-extremas"
                  empresaRut={selectedEmpresaRut}
                  enabled={Boolean(selectedEmpresaRut)}
                  value={year}
                  customRange={!year && Boolean(range?.from && range?.to)}
                  onChange={(value) => {
                    setYear(value);
                    setRange({});
                  }}
                />
                <DashboardPeriodFilter
                  value={range}
                  onChange={(value) => {
                    setYear("");
                    setRange(value || {});
                  }}
                />
              </>
            )}
          </DashboardFilters>
        )}
        {isLoading ? (
          <DashboardStatus>Cargando datos del servicio…</DashboardStatus>
        ) : dashboardError ? (
          <DashboardStatus error={dashboardError.code !== "DASHBOARD_NOT_CONFIGURED"}>
            {dashboardError.code === "DASHBOARD_NOT_CONFIGURED"
              ? "El dashboard de este servicio estará disponible cuando se incorporen sus indicadores."
              : "No pudimos cargar la información del servicio."}
          </DashboardStatus>
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
                      tone="neutral"
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

                {serviceKey === "zonas-extremas" && (
                  <>
                    <MetricCard
                      label="Gestiones"
                      value={dashboardData?.summary?.totalGestiones || 0}
                      helperText="Procesos registrados"
                      tone="primary"
                      icon="🧭"
                    />
                    <MetricCard
                      label="Registros"
                      value={dashboardData?.summary?.totalRegistros || 0}
                      helperText="Trabajadores incluidos"
                      tone="info"
                      icon="📋"
                    />
                    <MetricCard
                      label="Trabajadores informados"
                      value={dashboardData?.summary?.trabajadores || 0}
                      helperText="Según detalle disponible o registros de gestión"
                      tone="success"
                      icon="👥"
                    />
                    <MetricCard
                      label="Total recuperado"
                      value={formatCurrency(
                        dashboardData?.summary?.totalRecuperado ||
                          dashboardData?.summary?.totalBonificado ||
                          0
                      )}
                      helperText="Monto cerrado o bonificado"
                      tone="warning"
                      icon="💰"
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

            {serviceKey === "zonas-extremas" && (
              <section className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Seguimiento de zonas extremas
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="glass-panel rounded-[2rem] p-5 ">
                    <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Estado de gestiones
                    </h3>
                    <Divider className="my-3" />
                    <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
                      {Object.entries(dashboardData?.states || {}).length ? (
                        Object.entries(dashboardData.states).map(([estado, total]) => (
                          <li
                            key={estado}
                            className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2"
                          >
                            <span className="capitalize">{estado}</span>
                            <span className="font-semibold text-[color:var(--theme-primary)]">
                              {total}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>Sin gestiones registradas.</li>
                      )}
                    </ul>
                  </div>
                  <div className="glass-panel rounded-[2rem] p-5 ">
                    <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Distribución por zona
                    </h3>
                    <Divider className="my-3" />
                    <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
                      {Object.entries(dashboardData?.zones || {}).length ? (
                        Object.entries(dashboardData.zones).map(([zona, total]) => (
                          <li
                            key={zona}
                            className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2"
                          >
                            <span>{zona}</span>
                            <span className="font-semibold text-[color:var(--theme-primary)]">
                              {total}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>Sin zonas informadas.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {selectedEmpresaRut && (
                  <GestionHistoryTable
                    key={JSON.stringify([selectedEmpresaRut, normalizedRange?.from, normalizedRange?.to])}
                    serviceKey="zonas-extremas"
                    empresaRut={selectedEmpresaRut}
                    from={normalizedRange?.from}
                    to={normalizedRange?.to}
                  />
                )}

                <div className="glass-panel rounded-[2rem] p-5 ">
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">
                    Últimos trabajadores informados
                  </h3>
                  <Divider className="my-3" />
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/60 text-xs">
                      <thead className="bg-white/70 text-left font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                        <tr>
                          <th className="px-3 py-2">Trabajador</th>
                          <th className="px-3 py-2">Periodo</th>
                          <th className="px-3 py-2">Zona</th>
                          <th className="px-3 py-2 text-right">Bonificación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/50">
                        {dashboardData?.latestDetalles?.length ? (
                          dashboardData.latestDetalles.map((detalle) => (
                            <tr key={detalle.id}>
                              <td className="px-3 py-2">
                                <div className="font-semibold text-[color:var(--text-primary)]">
                                  {detalle.nombreCompleto || "Sin nombre"}
                                </div>
                                <div className="text-[color:var(--text-secondary)]">
                                  {detalle.trabajadorRut || "—"}
                                </div>
                              </td>
                              <td className="px-3 py-2">{detalle.periodo || "—"}</td>
                              <td className="px-3 py-2">{detalle.zonaExtrema || "—"}</td>
                              <td className="px-3 py-2 text-right">
                                {formatCurrency(detalle.montoBonificado || 0)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="px-3 py-4 text-center text-[color:var(--text-secondary)]"
                              colSpan={4}
                            >
                              Sin detalle disponible.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Documentos de la empresa
                </h2>
                <p className="text-xs text-[color:var(--text-secondary)]">
                  {empresasDisponibles.find((empresa) => empresa.empresaRut === selectedEmpresaRut)?.empresaNombre || selectedEmpresaRut || "Empresa seleccionada"}
                </p>
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
      </DashboardBody>
    </section>
  );
};

const GenericServiceContent = ({ definition, slug }) => (
  <Suspense fallback={<div className="p-6 text-gray-500 animate-pulse">Cargando servicio...</div>}>
    <GenericServiceContentWithParams definition={definition} slug={slug} />
  </Suspense>
);

const ServiceDetailPage = () => (
  <Suspense fallback={<div className="p-6 text-gray-500 animate-pulse">Cargando servicio...</div>}>
    <ServiceDetailContent />
  </Suspense>
);

export default ServiceDetailPage;
