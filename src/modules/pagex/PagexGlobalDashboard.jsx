"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarList, LineChart } from "@tremor/react";
import {
  RiArrowRightLine,
  RiBuildingLine,
  RiFundsLine,
  RiShieldCheckLine,
  RiStackLine,
  RiTimeLine,
} from "@remixicon/react";
import { DashboardHeader, DashboardContext, DashboardBody, DashboardFilters, DashboardStatus } from "@/components/dashboard/ServiceDashboardLayout";
import DashboardYearSelect from "@/components/dashboard/DashboardYearSelect";
import { getDashboardYearParams } from "@/services/dashboardYear.mjs";
import { getPagexGlobalDashboard } from "@/services/api/globalDashboards";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 1,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));
const formatNumber = (value) => numberFormatter.format(Number(value || 0));
const formatPercent = (value) => `${percentFormatter.format(Number(value || 0))}%`;

const Panel = ({ children, className = "" }) => (
  <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

const MetricCard = ({ label, value, helper, icon: Icon }) => (
  <Panel className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
      </div>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </Panel>
);

const PagexGlobalDashboard = () => {
  const [year, setYear] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    getPagexGlobalDashboard(getDashboardYearParams(year), { signal: controller.signal })
      .then((response) => {
        if (!ignore) setData(response);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "No fue posible cargar los datos.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [year]);

  const changeYear = (value) => {
    if (value === year) return;
    setLoading(true);
    setError("");
    setYear(value);
  };
  const estadoData = useMemo(
    () => [
      { name: "Pendiente", value: data?.casosPorEstado?.pendientes || 0 },
      { name: "Recuperado", value: data?.casosPorEstado?.resueltos || 0 },
      { name: "Rechazado", value: data?.casosPorEstado?.rechazados || 0 },
    ],
    [data]
  );

  const avance = Number(data?.casosPorEstado?.porcentajeAvance || 0);

  const handleIrEmpresa = (empresaRut) => {
    if (!empresaRut) return;
    router.push(`/servicios/pagos-en-exceso?tab=dashboard-operativo&empresa=${empresaRut}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <DashboardHeader kind="Dashboard analítico" title="Pagos en Exceso multiempresa" description="Resumen de los pagos en exceso, lo recuperado y lo pendiente por empresa.">
        <DashboardContext><RiBuildingLine className="h-4 w-4" aria-hidden="true" />{data?.scope?.isGlobal ? "Administrador" : "Empresas asignadas"}</DashboardContext>
        <DashboardContext><RiStackLine className="h-4 w-4" aria-hidden="true" />{Array.isArray(data?.scope?.empresas) ? `${data.scope.empresas.length} empresas` : "Todas las empresas"}</DashboardContext>
      </DashboardHeader>
      <DashboardBody>
        <DashboardFilters>
          <DashboardYearSelect serviceKey="pagex" value={year} onChange={changeYear} />
        </DashboardFilters>
        {loading ? (
          <DashboardMoraAnaliticoSkeleton />
        ) : error ? (
          <DashboardStatus error>{error}</DashboardStatus>
        ) : data ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total solicitado"
                value={formatCurrency(data.resumen?.totalSolicitado)}
                helper={`${formatNumber(data.casosPorEstado?.total)} casos analizados`}
                icon={RiFundsLine}
              />
              <MetricCard
                label="Monto recuperado confirmado"
                value={formatCurrency(data.resumen?.totalRecuperado)}
                helper={`Pagos confirmados · avance ${formatPercent(avance)}`}
                icon={RiShieldCheckLine}
              />
              <MetricCard
                label="Monto pendiente"
                value={formatCurrency(data.resumen?.totalPendiente)}
                helper={`${formatNumber(data.casosPorEstado?.pendientes)} casos pendientes`}
                icon={RiTimeLine}
              />
              <MetricCard
                label="Empresas ranking"
                value={formatNumber(data.rankingEmpresas?.length || 0)}
                helper="Concentración de montos"
                icon={RiBuildingLine}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <Panel className="p-5">
                <h2 className="text-base font-semibold text-slate-950">Ranking de empresas</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Empresas ordenadas por monto total detectado. Selecciona una empresa para ver su detalle.
                </p>
                <BarList
                  className="mt-6"
                  data={(data.rankingEmpresas || []).map((item) => ({
                    name: item.empresaRut,
                    value: item.totalMonto,
                  }))}
                  valueFormatter={formatCurrency}
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {(data.rankingEmpresas || []).map((item) => (
                    <button
                      key={item.empresaRut}
                      type="button"
                      onClick={() => handleIrEmpresa(item.empresaRut)}
                      className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50"
                    >
                      {item.empresaRut}
                      <RiArrowRightLine className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel className="p-5">
                <h2 className="text-base font-semibold text-slate-950">Casos por estado</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cada caso corresponde a un registro de pago en exceso.
                </p>
                <BarList className="mt-6" data={estadoData} valueFormatter={formatNumber} />
              </Panel>
            </section>

            <Panel className="p-5">
              <h2 className="text-base font-semibold text-slate-950">Tendencia mensual</h2>
              <p className="mt-1 text-sm text-slate-500">
                Evolución de montos registrados por periodo.
              </p>
              <LineChart
                className="mt-6 h-72"
                data={(data.tendencia || []).filter((item) => item.periodo)}
                index="periodo"
                categories={["monto"]}
                colors={["indigo"]}
                valueFormatter={formatCurrency}
              />
            </Panel>
          </>
        ) : null}
      </DashboardBody>
    </main>
  );
};

export default PagexGlobalDashboard;
