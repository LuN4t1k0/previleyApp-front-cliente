"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, BarList, DonutChart, Grid, LineChart, Text, Title } from "@tremor/react";
import {
  RiArrowRightLine,
  RiBarChartGroupedLine,
  RiBuildingLine,
  RiFundsLine,
  RiShieldCheckLine,
  RiStackLine,
  RiTimeLine,
} from "@remixicon/react";
import { getMoraGlobalDashboard } from "@/services/api/globalDashboards";
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

const formatCurrency = (value) =>
  currencyFormatter.format(Number(value || 0));

const formatNumber = (value) =>
  numberFormatter.format(Number(value || 0));

const formatPercent = (value) => `${percentFormatter.format(Number(value || 0))}%`;

const getRate = (part, total) => {
  const base = Number(total || 0);
  if (!base) return 0;
  return (Number(part || 0) / base) * 100;
};

const normalizeLabel = (value) =>
  String(value || "Sin estado")
    .replaceAll("_", " ")
    .toLowerCase();

const Panel = ({ children, className = "" }) => (
  <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

const DashboardHeader = ({ scope, totalEmpresas }) => (
  <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
      <div className="max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-2 w-2 rounded-sm bg-red-500" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase text-slate-500">
            Dashboard Analítico
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
          Mora presunta consolidada
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
          Reorganización ejecutiva del riesgo, la recuperación y las empresas que requieren
          atención prioritaria.
        </p>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <RiBuildingLine className="h-4 w-4 text-slate-500" />
          <span>{scope?.isGlobal ? "Administrador" : "Empresas asignadas"}</span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <RiStackLine className="h-4 w-4 text-slate-500" />
          <span>{totalEmpresas} empresas</span>
        </div>
      </div>
    </div>
  </header>
);

const MetricTile = ({ label, value, detail, icon: Icon, accent = "bg-slate-900" }) => (
  <Panel className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <Text className="text-slate-500">{label}</Text>
        <Title className="mt-2 text-slate-950">{value}</Title>
      </div>
      {Icon ? (
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      ) : null}
    </div>
    <Text className="mt-3 text-xs text-slate-500">{detail}</Text>
  </Panel>
);

const KpiGrid = ({ totalDeuda, totalRegularizado, totalPagado, totalPendiente, totalCasos }) => {
  const tasaRegularizacion = getRate(totalRegularizado, totalDeuda);
  const tasaPendiente = getRate(totalPendiente, totalDeuda);

  return (
    <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
      <MetricTile
        label="Deuda total"
        value={formatCurrency(totalDeuda)}
        detail={`${formatNumber(totalCasos)} casos consolidados`}
        icon={RiFundsLine}
        accent="bg-slate-900"
      />
      <MetricTile
        label="Regularizado"
        value={formatCurrency(totalRegularizado)}
        detail={`${formatPercent(tasaRegularizacion)} de avance sobre deuda`}
        icon={RiShieldCheckLine}
        accent="bg-emerald-600"
      />
      <MetricTile
        label="Pendiente"
        value={formatCurrency(totalPendiente)}
        detail={`${formatPercent(tasaPendiente)} aun en cartera`}
        icon={RiTimeLine}
        accent="bg-red-600"
      />
      <MetricTile
        label="Pagado confirmado"
        value={formatCurrency(totalPagado)}
        detail="Base validada dentro del total regularizado"
        icon={RiBarChartGroupedLine}
        accent="bg-blue-600"
      />
    </Grid>
  );
};

const PriorityAndRisk = ({
  topEmpresas,
  ranking,
  onCompanyClick,
  estadoPrevired,
  judicial,
  noJudicial,
}) => (
  <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
    <Panel className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Title className="text-slate-950">Prioridad por empresa</Title>
          <Text className="text-sm text-slate-500">
            Mayor concentración de deuda y acceso directo al operativo por empresa.
          </Text>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <RiTimeLine className="h-4 w-4" />
          {topEmpresas.length} críticas
        </span>
      </div>
      <BarList
        className="mt-6"
        data={topEmpresas.map((item) => ({
          name: item.name,
          value: item.value,
        }))}
        valueFormatter={(value) => formatCurrency(value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {ranking.map((item) => (
          <button
            key={item.data?.empresaRut}
            type="button"
            onClick={() => onCompanyClick(item.data?.empresaRut)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
          >
            {item.data?.empresaRut}
            <RiArrowRightLine className="h-3 w-3" />
          </button>
        ))}
      </div>
    </Panel>

    <Panel className="p-5">
      <Title className="text-slate-950">Lectura de riesgo</Title>
      <Text className="text-sm text-slate-500">Separación judicial y no judicial del saldo.</Text>
      {estadoPrevired.length ? (
        <DonutChart
          className="mt-6 h-56"
          data={estadoPrevired}
          category="value"
          index="name"
          colors={["rose", "emerald"]}
          valueFormatter={(value) => formatCurrency(value)}
        />
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Sin distribución Previred para mostrar.
        </div>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-semibold uppercase text-red-700">Judicial</p>
          <p className="mt-1 text-sm font-semibold text-red-950">{formatCurrency(judicial)}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase text-emerald-700">No judicial</p>
          <p className="mt-1 text-sm font-semibold text-emerald-950">{formatCurrency(noJudicial)}</p>
        </div>
      </div>
    </Panel>
  </section>
);

const DistributionAndEntities = ({ distribucionEstado, usaMontos, topEntidades }) => (
  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Panel className="p-5">
      <Title className="text-slate-950">Distribución por estado</Title>
      <Text className="text-sm text-slate-500">Lectura acumulada por estado del registro.</Text>
      <BarList
        className="mt-6"
        data={distribucionEstado}
        valueFormatter={(value) =>
          usaMontos ? formatCurrency(value) : `${formatNumber(value)} casos`
        }
      />
    </Panel>

    <Panel className="p-5">
      <Title className="text-slate-950">Entidades con mayor deuda</Title>
      <Text className="text-sm text-slate-500">
        Instituciones que explican la mayor parte del saldo observado.
      </Text>
      <BarList
        className="mt-6"
        data={topEntidades.map((entidad) => ({
          name: entidad.entidadNombre,
          value: entidad.totalDeuda,
        }))}
        valueFormatter={(value) => formatCurrency(value)}
      />
    </Panel>
  </section>
);

const SummaryAndTrend = ({ totalDeuda, totalRegularizado, totalPagado, totalPendiente, tendencia }) => (
  <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
    <Panel className="p-5">
      <Title className="text-slate-950">Resumen de cartera</Title>
      <Text className="text-sm text-slate-500">Balance financiero consolidado.</Text>
      <div className="mt-6 space-y-4">
        {[
          ["Deuda total", totalDeuda],
          ["Regularizado", totalRegularizado],
          ["Pagado", totalPagado],
          ["Pendiente", totalPendiente],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <span className="text-sm font-semibold text-slate-950">{formatCurrency(value)}</span>
          </div>
        ))}
      </div>
    </Panel>

    <Panel className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
          <RiBarChartGroupedLine className="h-5 w-5 text-white" />
        </span>
        <div>
          <Title className="text-slate-950">Tendencia global</Title>
          <Text className="text-sm text-slate-500">
            Evolución de deuda inicial, recuperado y saldo en el tiempo.
          </Text>
        </div>
      </div>
      <AreaChart
        className="mt-6 h-72"
        data={tendencia}
        index="periodo"
        categories={["deudaInicialMes", "deudaActual"]}
        colors={["rose", "amber"]}
        valueFormatter={(value) => formatCurrency(value)}
      />
      <LineChart
        className="mt-6 h-56"
        data={tendencia}
        index="periodo"
        categories={["recuperadoMes"]}
        colors={["emerald"]}
        valueFormatter={(value) => formatCurrency(value)}
      />
    </Panel>
  </section>
);

const MoraGlobalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getMoraGlobalDashboard();
        setData(response);
      } catch (err) {
        console.error("Error al cargar dashboard global de mora:", err);
        setError(err.message || "No fue posible cargar el dashboard global.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIrEmpresa = (empresaRut) => {
    if (!empresaRut) return;
    router.push(`/servicios/mora-presunta?tab=dashboard-operativo&empresa=${empresaRut}`);
  };

  if (loading) {
    return <DashboardMoraAnaliticoSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalEmpresas = Array.isArray(data.scope?.empresas) ? data.scope.empresas.length : "∞";
  const totalDeuda = Number(data.kpis?.totalDeuda || 0);
  const totalRegularizado = Number(data.kpis?.totalRegularizado || 0);
  const totalPagado = Number(data.kpis?.totalPagado || 0);
  const totalPendiente = Number(data.kpis?.totalPendiente || 0);
  const totalCasos = Number(data.kpis?.totalCasos || 0);
  const judicial = Number(data.kpis?.estadoPrevired?.judicial?.monto || 0);
  const noJudicial = Number(data.kpis?.estadoPrevired?.noJudicial?.monto || 0);

  const ranking = (data.rankingEmpresas || []).map((empresa) => ({
    name: empresa.empresaRut,
    value: empresa.totalDeuda,
    data: empresa,
  }));

  const distribuccionDatos = (data.distribucionEstado || []).map((item) => ({
    name: normalizeLabel(item.estado),
    monto: Number(item.monto || 0),
    casos: Number(item.casos || 0),
  }));

  const usaMontos = distribuccionDatos.some((item) => item.monto > 0);
  const distribucionEstado = distribuccionDatos.map((item) => ({
    name: item.name,
    value: usaMontos ? item.monto : item.casos,
  }));

  const estadoPrevired = [
    { name: "Judicial", value: judicial },
    { name: "No judicial", value: noJudicial },
  ].filter((item) => item.value > 0);

  const tendencia = (data.tendencia || []).map((item) => ({
    ...item,
    deudaInicialMes: Number(item.deudaInicialMes || 0),
    recuperadoMes: Number(item.recuperadoMes || 0),
    deudaActual: Number(item.deudaActual || 0),
  }));

  const topEmpresas = ranking.slice(0, 6);
  const topEntidades = (data.entidadesMayorDeuda || []).slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <DashboardHeader scope={data.scope} totalEmpresas={totalEmpresas} />
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <KpiGrid
            totalDeuda={totalDeuda}
            totalRegularizado={totalRegularizado}
            totalPagado={totalPagado}
            totalPendiente={totalPendiente}
            totalCasos={totalCasos}
          />
          <PriorityAndRisk
            topEmpresas={topEmpresas}
            ranking={ranking}
            onCompanyClick={handleIrEmpresa}
            estadoPrevired={estadoPrevired}
            judicial={judicial}
            noJudicial={noJudicial}
          />
          <DistributionAndEntities
            distribucionEstado={distribucionEstado}
            usaMontos={usaMontos}
            topEntidades={topEntidades}
          />
          <SummaryAndTrend
            totalDeuda={totalDeuda}
            totalRegularizado={totalRegularizado}
            totalPagado={totalPagado}
            totalPendiente={totalPendiente}
            tendencia={tendencia}
          />
        </div>
      </div>
    </main>
  );
};

export default MoraGlobalDashboard;
