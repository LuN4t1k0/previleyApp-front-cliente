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
import { formatMoraEstadoLabel } from "@/utils/moraEstado";

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

const getRiskMixLabel = (judicial, preJudicial, noJudicial) => {
  const judicialValue = Number(judicial || 0);
  const preJudicialValue = Number(preJudicial || 0);
  const noJudicialValue = Number(noJudicial || 0);
  const active = [judicialValue, preJudicialValue, noJudicialValue].filter((value) => value > 0).length;
  if (active > 1) return "Mixto";
  if (judicialValue > 0) return "Judicial";
  if (preJudicialValue > 0) return "Pre judicial";
  if (noJudicialValue > 0) return "No judicial";
  return "Sin pendiente";
};

const normalizeLabel = (value) =>
  formatMoraEstadoLabel(value).toLowerCase();

const normalizeEstadoKey = (value) =>
  String(value || "").trim().toLowerCase();

const Panel = ({ children, className = "" }) => (
  <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

const RelativeRiskBar = ({
  value = 0,
  maxValue = 0,
  judicial = 0,
  preJudicial = 0,
  noJudicial = 0,
  residual = 0,
}) => {
  const base = Number(maxValue || 0);
  const totalWidth = base ? Math.min((Number(value || 0) / base) * 100, 100) : 0;
  const judicialWidth = base ? Math.min((Number(judicial || 0) / base) * 100, totalWidth) : 0;
  const preJudicialWidth = base
    ? Math.min((Number(preJudicial || 0) / base) * 100, Math.max(totalWidth - judicialWidth, 0))
    : 0;
  const noJudicialWidth = base
    ? Math.min((Number(noJudicial || 0) / base) * 100, Math.max(totalWidth - judicialWidth - preJudicialWidth, 0))
    : 0;
  const residualWidth = base
    ? Math.min(
        (Number(residual || 0) / base) * 100,
        Math.max(totalWidth - judicialWidth - preJudicialWidth - noJudicialWidth, 0)
      )
    : 0;

  return (
    <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
      {totalWidth > 0 && (
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-slate-300"
          style={{ width: `${totalWidth}%` }}
        />
      )}
      {judicialWidth > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-red-500"
          style={{ width: `${judicialWidth}%` }}
        />
      )}
      {noJudicialWidth > 0 && (
        <div
          className="absolute inset-y-0 bg-blue-500"
          style={{
            left: `${judicialWidth + preJudicialWidth}%`,
            width: `${noJudicialWidth}%`,
          }}
        />
      )}
      {preJudicialWidth > 0 && (
        <div
          className="absolute inset-y-0 bg-orange-500"
          style={{
            left: `${judicialWidth}%`,
            width: `${preJudicialWidth}%`,
          }}
        />
      )}
      {residualWidth > 0 && (
        <div
          className="absolute inset-y-0 bg-slate-300"
          style={{
            left: `${judicialWidth + preJudicialWidth + noJudicialWidth}%`,
            width: `${residualWidth}%`,
          }}
        />
      )}
    </div>
  );
};

const RiskLegend = () => (
  <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      Judicial
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-orange-500" />
      Pre judicial
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-blue-500" />
      No judicial
    </span>
  </div>
);

const BREAKDOWN_METRIC_TONES = {
  red: "border-red-100 bg-red-50 text-red-950",
  orange: "border-orange-100 bg-orange-50 text-orange-950",
  blue: "border-blue-100 bg-blue-50 text-blue-950",
  slate: "border-slate-200 bg-white text-slate-800",
};

const BreakdownMetric = ({ label, value, tone = "slate" }) => {
  return (
    <div className={`rounded-md border px-3 py-2 ${BREAKDOWN_METRIC_TONES[tone] || BREAKDOWN_METRIC_TONES.slate}`}>
      <p className="text-[10px] font-semibold uppercase text-current opacity-70">{label}</p>
      <p className="mt-1 text-xs font-semibold">{formatCurrency(value)}</p>
    </div>
  );
};

const RiskBreakdownList = ({
  items,
  usaMontos,
  valueKey,
  emptyText,
  showResidual = false,
  valueLabel = "Total",
  breakdownLabel = "Clasificado",
}) => {
  const maxValue = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 0);

  if (!items.length) {
    return (
      <div className="mt-6 rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {items.map((item) => {
        const value = Number(item[valueKey] || 0);
        const judicial = Number(item.montoJudicial || 0);
        const preJudicial = Number(item.montoPreJudicial || 0);
        const noJudicial = Number(item.montoNoJudicial || 0);
        const breakdownTotal = judicial + preJudicial + noJudicial;
        const residual = showResidual ? Math.max(value - breakdownTotal, 0) : 0;
        const classifiedRate = getRate(breakdownTotal, value);
        const mixLabel = getRiskMixLabel(judicial, preJudicial, noJudicial);

        return (
          <div key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold capitalize text-slate-800">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatNumber(item.casos || 0)} casos · {mixLabel}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-[10px] font-semibold uppercase text-slate-500">{valueLabel}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {usaMontos ? formatCurrency(value) : `${formatNumber(value)} casos`}
                </p>
                {showResidual ? (
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {breakdownLabel}: {formatCurrency(breakdownTotal)} · {formatPercent(classifiedRate)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-3">
              <RelativeRiskBar
                value={value}
                maxValue={maxValue}
                judicial={judicial}
                preJudicial={preJudicial}
                noJudicial={noJudicial}
                residual={residual}
              />
            </div>
            <div className={`mt-3 grid gap-2 ${showResidual ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-3"}`}>
              <BreakdownMetric label="Judicial" value={judicial} tone="red" />
              <BreakdownMetric label="Pre judicial" value={preJudicial} tone="orange" />
              <BreakdownMetric label="No judicial" value={noJudicial} tone="blue" />
              {showResidual && residual > 0 ? (
                <BreakdownMetric label="Fuera desglose" value={residual} />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
        accent="bg-slate-800"
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
        accent="bg-amber-600"
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
  preJudicial,
  noJudicial,
}) => {
  const montoPendiente = Number(judicial || 0) + Number(preJudicial || 0) + Number(noJudicial || 0);

  return (
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
      <Text className="text-sm text-slate-500">Separación judicial, pre judicial y no judicial del saldo.</Text>
      {estadoPrevired.length ? (
        <div className="relative mt-6 h-56">
          <DonutChart
            className="h-full"
            data={estadoPrevired}
            category="value"
            index="name"
            colors={["red", "orange", "blue"]}
            valueFormatter={(value) => formatCurrency(value)}
            showLabel={false}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">
                {formatCurrency(montoPendiente)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Monto pendiente
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Sin distribución Previred para mostrar.
        </div>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-semibold uppercase text-red-700">Judicial</p>
          <p className="mt-1 text-sm font-semibold text-red-950">{formatCurrency(judicial)}</p>
        </div>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
          <p className="text-xs font-semibold uppercase text-orange-700">Pre judicial</p>
          <p className="mt-1 text-sm font-semibold text-orange-950">{formatCurrency(preJudicial)}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-semibold uppercase text-blue-700">No judicial</p>
          <p className="mt-1 text-sm font-semibold text-blue-950">{formatCurrency(noJudicial)}</p>
        </div>
      </div>
    </Panel>
  </section>
  );
};

const DistributionAndEntities = ({ distribucionEstado, usaMontos, topEntidades }) => (
  <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <Panel className="p-5">
      <Title className="text-slate-950">Distribución por estado</Title>
      <Text className="text-sm text-slate-500">
        Lectura acumulada por estado, separando monto pendiente judicial, pre judicial y no judicial.
      </Text>
      <RiskLegend />
      <RiskBreakdownList
        items={distribucionEstado}
        usaMontos={usaMontos}
        valueKey="value"
        emptyText="Sin distribución por estado para mostrar."
      />
    </Panel>

    <Panel className="p-5">
      <Title className="text-slate-950">Entidades con mayor deuda observada</Title>
      <Text className="text-sm text-slate-500">
        Instituciones que explican la mayor parte del saldo y su desglose judicial, pre judicial y no judicial.
      </Text>
      <RiskLegend />
      <RiskBreakdownList
        items={topEntidades.map((entidad) => ({
          name: entidad.entidadNombre,
          value: Number(entidad.totalDeuda || 0),
          casos: Number(entidad.casos || 0),
          montoJudicial: Number(entidad.montoJudicial || 0),
          montoPreJudicial: Number(entidad.montoPreJudicial || 0),
          montoNoJudicial: Number(entidad.montoNoJudicial || 0),
        }))}
        usaMontos
        valueKey="value"
        showResidual
        valueLabel="Deuda observada"
        breakdownLabel="En desglose"
        emptyText="Sin entidades para mostrar."
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
        colors={["indigo", "amber"]}
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
  const preJudicial = Number(data.kpis?.estadoPrevired?.preJudicial?.monto || 0);
  const noJudicial = Number(data.kpis?.estadoPrevired?.noJudicial?.monto || 0);

  const ranking = (data.rankingEmpresas || []).map((empresa) => ({
    name: empresa.empresaRut,
    value: empresa.totalDeuda,
    data: empresa,
  }));

  const distribuccionDatos = (data.distribucionEstado || []).reduce((acc, item) => {
    if (normalizeEstadoKey(item.estado) === "completado") return acc;

    acc.push({
      name: normalizeLabel(item.estado),
      monto: Number(item.monto || 0),
      casos: Number(item.casos || 0),
      montoJudicial: Number(item.montoJudicial || 0),
      montoPreJudicial: Number(item.montoPreJudicial || 0),
      montoNoJudicial: Number(item.montoNoJudicial || 0),
      casosJudiciales: Number(item.casosJudiciales || 0),
      casosPreJudiciales: Number(item.casosPreJudiciales || 0),
      casosNoJudiciales: Number(item.casosNoJudiciales || 0),
    });

    return acc;
  }, []);

  const usaMontos = distribuccionDatos.some((item) => item.monto > 0);
  const distribucionEstado = distribuccionDatos.map((item) => ({
    name: item.name,
    value: usaMontos ? item.monto : item.casos,
    casos: item.casos,
    montoJudicial: item.montoJudicial,
    montoPreJudicial: item.montoPreJudicial,
    montoNoJudicial: item.montoNoJudicial,
    casosJudiciales: item.casosJudiciales,
    casosPreJudiciales: item.casosPreJudiciales,
    casosNoJudiciales: item.casosNoJudiciales,
  }));

  const estadoPrevired = [
    { name: "Judicial", value: judicial },
    { name: "Pre judicial", value: preJudicial },
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
            preJudicial={preJudicial}
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
