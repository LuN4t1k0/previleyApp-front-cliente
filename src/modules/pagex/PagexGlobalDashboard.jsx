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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPagexGlobalDashboard();
        if (isActive) setData(response);
      } catch (err) {
        if (isActive) setError(err.message || "No fue posible cargar los datos.");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, []);

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

  if (loading) return <DashboardMoraAnaliticoSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-[#f6f6ff] text-slate-950">
      <header className="border-b border-indigo-100 bg-[#f6f6ff]">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5 px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase text-indigo-700">
                  Dashboard Analítico
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
                PAGEX multi-empresa
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Consolidado ejecutivo de pagos en exceso, recuperación, saldos pendientes y
                concentración por empresa.
              </p>
            </div>

            <div className="grid gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 shadow-sm">
                <RiBuildingLine className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>
                  {data.scope?.isGlobal ? "Administrador" : "Empresas asignadas"}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 shadow-sm">
                <RiStackLine className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>
                  {Array.isArray(data.scope?.empresas)
                    ? `${data.scope.empresas.length} empresas`
                    : "Todas las empresas"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total solicitado"
              value={formatCurrency(data.resumen?.totalSolicitado)}
              helper={`${formatNumber(data.casosPorEstado?.total)} casos analizados`}
              icon={RiFundsLine}
            />
            <MetricCard
              label="Total recuperado"
              value={formatCurrency(data.resumen?.totalRecuperado)}
              helper={`Avance ${formatPercent(avance)}`}
              icon={RiShieldCheckLine}
            />
            <MetricCard
              label="Total pendiente"
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
                Empresas ordenadas por monto PAGEX registrado.
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
                Distribución operativa de los registros PAGEX.
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
        </div>
      </div>
    </main>
  );
};

export default PagexGlobalDashboard;
