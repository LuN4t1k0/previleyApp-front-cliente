"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, BarList } from "@tremor/react";
import {
  RiBuildingLine,
  RiCalendarCheckLine,
  RiGroupLine,
  RiStackLine,
  RiTimeLine,
} from "@remixicon/react";
import { getLicenciasGlobalDashboard } from "@/services/api/globalDashboards";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";
import {
  buildLicenciasSectionHref,
  normalizeLicenciasAnalytics,
} from "@/services/licenciasWorkspace.mjs";
import LicenciasFinancialPanel from "./LicenciasFinancialPanel";

const number = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
const formatNumber = (value) => number.format(Number(value || 0));

const MetricCard = ({ label, value, detail, icon: Icon, tone = "bg-blue-700" }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5 text-white" />
      </span>
    </div>
  </article>
);

const Panel = ({ title, description, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
    {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    {children}
  </section>
);

const LicenciasGlobalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(normalizeLicenciasAnalytics(await getLicenciasGlobalDashboard()));
    } catch (requestError) {
      setData(null);
      setError(requestError?.message || "No fue posible cargar el dashboard analítico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardMoraAnaliticoSkeleton />;

  if (error) {
    return (
      <div className="mx-auto my-8 max-w-7xl rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
        <p>{error}</p>
        <button type="button" onClick={load} className="mt-3 text-sm font-semibold underline">
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;
  const summary = data.summary;
  const financial = {
    totalAnticipos: summary.totalAnticipos,
    totalSubsidios: summary.totalSubsidios,
    saldoBruto: summary.saldoBruto,
    acuerdos: null,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Dashboard Analítico
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
              Licencias médicas consolidadas
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Evolución, ausentismo, estados y balance financiero de las empresas autorizadas.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <RiBuildingLine className="h-4 w-4 text-slate-500" />
              Empresas asignadas
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <RiStackLine className="h-4 w-4 text-slate-500" />
              {formatNumber(data.totalEmpresasConInformacion)} con información
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Licencias totales" value={formatNumber(summary.totalLicencias)} detail="Registros visibles" icon={RiCalendarCheckLine} />
            <MetricCard label="Licencias vigentes" value={formatNumber(summary.licenciasVigentes)} detail="Autorizadas o en trámite" icon={RiTimeLine} tone="bg-emerald-600" />
            <MetricCard label="Trabajadores con licencia" value={formatNumber(summary.trabajadoresConLicencia)} detail="Personas distintas" icon={RiGroupLine} tone="bg-indigo-600" />
            <MetricCard label="Días de ausentismo" value={formatNumber(summary.totalDias)} detail="Acumulado visible" icon={RiTimeLine} tone="bg-amber-600" />
          </section>

          <LicenciasFinancialPanel financial={financial} />

          <section className="grid gap-6 lg:grid-cols-2">
            <Panel title="Distribución por estado" description="Situación actual de las licencias visibles.">
              <BarList className="mt-6" data={data.states.map((item) => ({ name: item.label, value: item.cantidad }))} valueFormatter={formatNumber} />
            </Panel>
            <Panel title="Distribución por entidad" description="Cantidad de licencias informadas por entidad.">
              <BarList className="mt-6" data={data.entities.map((item) => ({ name: item.entidad, value: item.cantidad }))} valueFormatter={formatNumber} />
            </Panel>
          </section>

          <Panel title="Empresas con mayor actividad" description="Licencias y días acumulados; abre el operativo de la empresa seleccionada.">
            <BarList className="mt-6" data={data.ranking.map((item) => ({ name: item.label, value: item.totalLicencias }))} valueFormatter={formatNumber} />
            <div className="mt-5 flex flex-wrap gap-2">
              {data.ranking.map((item) => (
                <button
                  key={item.empresaRut}
                  type="button"
                  onClick={() => router.push(buildLicenciasSectionHref("dashboard-operativo", { empresa: item.empresaRut }))}
                  className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  {item.empresaNombre} · {item.empresaRut}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Tendencia mensual" description="Cantidad de licencias y días de ausentismo por mes.">
            <AreaChart
              className="mt-6 h-72"
              data={data.timeline.map((item) => ({ periodo: item.periodo, Licencias: item.licencias, Días: item.dias }))}
              index="periodo"
              categories={["Licencias", "Días"]}
              colors={["blue", "amber"]}
              valueFormatter={formatNumber}
            />
          </Panel>
        </div>
      </div>
    </main>
  );
};

export default LicenciasGlobalDashboard;
