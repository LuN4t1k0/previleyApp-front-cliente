"use client";

import { useEffect, useState } from "react";
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
import { DashboardHeader, DashboardContext, DashboardBody, DashboardFilters, DashboardStatus } from "@/components/dashboard/ServiceDashboardLayout";
import DashboardYearSelect from "@/components/dashboard/DashboardYearSelect";
import { getDashboardYearParams } from "@/services/dashboardYear.mjs";
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
  const [year, setYear] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    getLicenciasGlobalDashboard(getDashboardYearParams(year), { signal: controller.signal })
      .then((payload) => {
        if (!ignore) setData(normalizeLicenciasAnalytics(payload));
      })
      .catch((requestError) => {
        if (!ignore) {
          setData(null);
          setError(requestError?.message || "No fue posible cargar el dashboard analítico.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [year, retry]);

  const changeYear = (value) => {
    if (value === year) return;
    setLoading(true);
    setError("");
    setYear(value);
  };
  const summary = data?.summary || {};
  const financial = {
    totalAnticipos: summary.totalAnticipos,
    totalSubsidios: summary.totalSubsidios,
    saldoBruto: summary.saldoBruto,
    acuerdos: null,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <DashboardHeader kind="Dashboard analítico" title="Licencias médicas consolidadas" description="Evolución, ausentismo, estados y balance financiero de las empresas autorizadas.">
        <DashboardContext><RiBuildingLine className="h-4 w-4" />{formatNumber(data?.scope?.empresas?.length)} empresas asignadas</DashboardContext>
        <DashboardContext><RiStackLine className="h-4 w-4" />{formatNumber(data?.totalEmpresasConInformacion)} con información</DashboardContext>
      </DashboardHeader>
      <DashboardBody>
        <DashboardFilters><DashboardYearSelect serviceKey="licencias" value={year} onChange={changeYear} /></DashboardFilters>
      {loading ? (
        <DashboardMoraAnaliticoSkeleton />
      ) : error ? (
        <DashboardStatus error>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              setRetry((value) => value + 1);
            }}
            className="mt-3 text-sm font-semibold underline"
          >
            Reintentar
          </button>
        </DashboardStatus>
      ) : data ? (
        <>
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
              <BarList className="mt-6" data={data.ranking.map((item) => ({ name: `${item.label} · ${formatNumber(item.totalDias)} días`, value: item.totalLicencias }))} valueFormatter={(value) => `${formatNumber(value)} licencias`} />
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
        </>
      ) : null}
      </DashboardBody>
    </main>
  );
};

export default LicenciasGlobalDashboard;
