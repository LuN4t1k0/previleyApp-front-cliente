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
import { getOperationalDashboardDefinition } from "@/config/operationalServiceDashboards.mjs";
import { humanizeStatus } from "@/services/operationalServiceDashboard.mjs";

const numberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("es-CL");
};

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

const statusStyles = {
  procesada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cerrada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  completada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  analisis: "bg-amber-50 text-amber-800 ring-amber-600/20",
  en_analisis: "bg-amber-50 text-amber-800 ring-amber-600/20",
  rechazada: "bg-rose-50 text-rose-700 ring-rose-600/20",
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
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const { data, loading, error, refetch } = useServiceDashboard(
    serviceKey,
    selectedEmpresaRut || undefined
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

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-5">
          <div className="h-44 rounded-xl bg-white" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-xl bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-semibold">No pudimos cargar este dashboard.</p>
          <p className="mt-1 text-sm">{error.message}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const hasRows = Number(summary.totalGestiones || 0) > 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className={`h-2 w-2 rounded-sm ${accent.dot}`} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Dashboard analítico
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
              {definition.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Vista consolidada de avances, volumen informado y actividad por
              empresa.
            </p>
          </div>

          <label className="flex min-w-[280px] flex-col gap-2 text-xs font-semibold text-slate-600">
            Empresa en vista
            <select
              value={selectedEmpresaRut}
              onChange={(event) => setSelectedEmpresaRut(event.target.value)}
              disabled={loadingEmpresas || loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-slate-500 disabled:opacity-60"
            >
              <option value="">Todas las empresas</option>
              {empresaOptions.map((empresa) => (
                <option key={empresa.empresaRut} value={empresa.empresaRut}>
                  {empresa.nombre || empresa.empresaRut}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          <span className={`rounded-full border px-3 py-1.5 ${accent.badge}`}>
            {selectedEmpresaRut ? "Vista por empresa" : "Vista multiempresa"}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
            Datos visibles según tus permisos
          </span>
          {loading ? <span>Actualizando…</span> : null}
        </div>

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

            <Panel className="overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold">Gestiones recientes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Últimos procesos registrados para la vista seleccionada.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Folio</th>
                      <th className="px-5 py-3">Empresa</th>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3 text-right">Volumen</th>
                      <th className="px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(data.latest || []).map((row) => {
                      const statusKey = String(row.estado || "sin_estado")
                        .toLowerCase()
                        .replace(/[\s-]+/g, "_");
                      return (
                        <tr key={row.id || row.folio}>
                          <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">
                            {row.folio || "—"}
                          </td>
                          <td className="min-w-[220px] px-5 py-3 text-slate-600">
                            {row.empresaNombre || row.empresa?.nombre || row.empresaRut}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                            {formatDate(row.fechaGestion || row.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-slate-900">
                            {formatNumber(row[definition.volumeField])}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                                statusStyles[statusKey] ||
                                "bg-slate-100 text-slate-700 ring-slate-500/20"
                              }`}
                            >
                              {humanizeStatus(row.estado)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </main>
  );
};

export default OperationalServiceDashboard;

