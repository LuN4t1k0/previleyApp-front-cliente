"use client";

import { useMemo, useState } from "react";
import { AreaChart, BarList } from "@tremor/react";
import {
  RiBarChartBoxLine,
  RiBuilding4Line,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiStackLine,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import useServiceDashboard from "@/hooks/useServiceDashboard";
import { DashboardHeader, DashboardContext, DashboardBody, DashboardFilters, DashboardStatus, dashboardFieldClass, dashboardControlClass } from "@/components/dashboard/ServiceDashboardLayout";
import DashboardYearSelect from "@/components/dashboard/DashboardYearSelect";
import { getDashboardYearRange } from "@/services/dashboardYear.mjs";
import { getOperationalDashboardDefinition } from "@/config/operationalServiceDashboards.mjs";
import GestionHistoryTable from "./GestionHistoryTable";

const numberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const accentStyles = {
  rose: {
    dot: "bg-rose-500",
    icon: "bg-rose-50 text-rose-600",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  indigo: {
    dot: "bg-indigo-500",
    icon: "bg-indigo-50 text-indigo-600",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  amber: {
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

const Panel = ({ children, className = "" }) => (
  <section
    className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </section>
);

const Metric = ({ label, value, helper, icon: Icon, accent }) => (
  <Panel className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
      </div>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent.icon}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  </Panel>
);

const EmptyDashboard = ({ title }) => (
  <Panel className="border-dashed p-10 text-center">
    <RiFileList3Line className="mx-auto h-10 w-10 text-slate-300" />
    <h2 className="mt-4 text-lg font-semibold text-slate-900">
      Aún no hay gestiones de {title}
    </h2>
    <p className="mt-2 text-sm text-slate-500">
      Cuando existan registros para las empresas seleccionadas, aparecerán en
      este dashboard.
    </p>
  </Panel>
);

const OperationalServiceDashboard = ({ serviceKey }) => {
  const definition = getOperationalDashboardDefinition(serviceKey);
  const accent = accentStyles[definition?.accent] || accentStyles.indigo;
  const [selectedEmpresaRut, setSelectedEmpresaRut] = useState("");
  const [year, setYear] = useState("");
  const range = useMemo(() => getDashboardYearRange(year), [year]);
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const { data, loading, error, refetch } = useServiceDashboard(
    serviceKey,
    selectedEmpresaRut || undefined,
    range
  );

  const empresaOptions = useMemo(
    () =>
      [...(empresas || [])].sort((a, b) =>
        String(a.nombre || a.empresaRut).localeCompare(
          String(b.nombre || b.empresaRut),
          "es"
        )
      ),
    [empresas]
  );

  if (!definition) {
    return (
      <div className="p-6 text-sm text-rose-700">
        El dashboard solicitado no está configurado.
      </div>
    );
  }

  const summary = data?.summary || {};
  const hasRows = Number(summary.totalGestiones || 0) > 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <DashboardHeader kind="Dashboard analítico" title={definition.title} description="Vista consolidada de avances, volumen informado y actividad por empresa.">
        <DashboardContext>{selectedEmpresaRut ? "Vista por empresa" : "Vista multiempresa"}</DashboardContext>
        <DashboardContext>Datos visibles según tus permisos</DashboardContext>
      </DashboardHeader>
      <DashboardBody>
        <DashboardFilters>
          <label className={dashboardFieldClass}>
            Empresa en vista
            <select value={selectedEmpresaRut} onChange={(event) => setSelectedEmpresaRut(event.target.value)} disabled={loadingEmpresas} className={dashboardControlClass}>
              <option value="">Todas las empresas</option>
              {empresaOptions.map((empresa) => <option key={empresa.empresaRut} value={empresa.empresaRut}>{empresa.nombre || empresa.empresaRut}</option>)}
            </select>
          </label>
          <DashboardYearSelect serviceKey={serviceKey} empresaRut={selectedEmpresaRut} value={year} onChange={setYear} />
        </DashboardFilters>
      {loading ? (
        <DashboardStatus>Cargando indicadores…</DashboardStatus>
      ) : error ? (
        <DashboardStatus error>
          <p className="font-semibold">No pudimos cargar este dashboard.</p>
          <p className="mt-1 text-sm">{error.message}</p>
          <button type="button" onClick={refetch} className="mt-4 font-semibold underline">
            Reintentar
          </button>
        </DashboardStatus>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Gestiones"
              value={formatNumber(summary.totalGestiones)}
              helper="Procesos registrados"
              icon={RiFileList3Line}
              accent={accent}
            />
            <Metric
              label={definition.volumeLabel}
              value={formatNumber(summary.totalVolumen)}
              helper={`Total de ${definition.shortLabel}`}
              icon={RiStackLine}
              accent={accent}
            />
            <Metric
              label="Empresas con actividad"
              value={formatNumber(summary.totalEmpresas)}
              helper="Dentro del alcance visible"
              icon={RiBuilding4Line}
              accent={accent}
            />
            <Metric
              label="Avance cerrado"
              value={`${Number(summary.porcentajeCierre || 0).toFixed(1)}%`}
              helper={`${formatNumber(summary.cerradas)} gestiones finalizadas`}
              icon={RiCheckboxCircleLine}
              accent={accent}
            />
          </section>

          {!hasRows ? (
            <EmptyDashboard title={definition.title} />
          ) : (
            <>
              <section className="grid gap-6 lg:grid-cols-2">
                <Panel className="p-5">
                  <h2 className="text-base font-semibold">Gestiones por estado</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Distribución del avance actual de los procesos.
                  </p>
                  <BarList
                    className="mt-6"
                    data={(data.states || []).map((item) => ({
                      name: item.label,
                      value: item.value,
                    }))}
                    valueFormatter={formatNumber}
                  />
                </Panel>

                <Panel className="p-5">
                  <h2 className="text-base font-semibold">Volumen por empresa</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Empresas con mayor cantidad de {definition.shortLabel}.
                  </p>
                  <BarList
                    className="mt-6"
                    data={(data.companies || []).slice(0, 10).map((item) => ({
                      name: item.empresaNombre,
                      value: item.volumen,
                    }))}
                    valueFormatter={formatNumber}
                  />
                </Panel>
              </section>

              <Panel className="p-5">
                <div className="flex items-start gap-3">
                  <span className={`rounded-lg p-2 ${accent.icon}`}>
                    <RiBarChartBoxLine className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Evolución mensual</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Volumen informado en cada periodo de gestión.
                    </p>
                  </div>
                </div>
                <AreaChart
                  className="mt-6 h-72"
                  data={data.timeline || []}
                  index="periodo"
                  categories={["volumen"]}
                  colors={[definition.accent]}
                  valueFormatter={formatNumber}
                  showLegend={false}
                />
              </Panel>
            </>
          )}
          <GestionHistoryTable
            key={JSON.stringify([serviceKey, selectedEmpresaRut, year])}
            serviceKey={serviceKey}
            empresaRut={selectedEmpresaRut}
            from={range?.from}
            to={range?.to}
            volumeField={definition.volumeField}
          />
        </>
      )}
      </DashboardBody>
    </main>
  );
};

export default OperationalServiceDashboard;

