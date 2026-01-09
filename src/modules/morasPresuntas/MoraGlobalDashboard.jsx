"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Grid, Title, Text, BarList, LineChart, Badge } from "@tremor/react";
import {
  RiBuildingLine,
  RiArrowRightLine,
  RiStackLine,
  RiBarChartGroupedLine,
} from "@remixicon/react";
import { getMoraGlobalDashboard } from "@/services/api/globalDashboards";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatNumber = (value) =>
  new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalEmpresas = Array.isArray(data.scope?.empresas) ? data.scope.empresas.length : "∞";

  const ranking = (data.rankingEmpresas || []).map((empresa) => ({
    name: empresa.empresaRut,
    value: empresa.totalDeuda,
    data: empresa,
  }));

  const distribuccionDatos = (data.distribucionEstado || []).map((item) => ({
    name: item.estado,
    monto: Number(item.monto || 0),
    casos: Number(item.casos || 0),
  }));

  const usaMontos = distribuccionDatos.some((item) => item.monto > 0);
  const distribucionEstado = distribuccionDatos.map((item) => ({
    name: item.name,
    value: usaMontos ? item.monto : item.casos,
  }));

  return (
    <div className="theme-mora">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="glass-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                  Dashboard Global
                </span>
                <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                  Consolidado multi-empresa
                </h1>
                <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                  Agrega las métricas de todas tus empresas permitidas y navega rapidamente al detalle
                  individual.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm">
                <RiBuildingLine className="h-4 w-4 text-[color:var(--theme-primary)]" />
                <span>
                  Alcance: {data.scope?.isGlobal ? "Administrador" : "Empresas asignadas"} ·{" "}
                  {totalEmpresas} empresas
                </span>
              </div>
            </div>
          </section>

          <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
            <Card>
              <Text>Deuda total</Text>
              <Title className="mt-2">{formatCurrency(data.kpis?.totalDeuda)}</Title>
              <Text className="text-xs text-gray-500 mt-1">Incluye todo el detalle cargado</Text>
            </Card>
            <Card>
              <Text>Regularizado</Text>
              <Title className="mt-2">{formatCurrency(data.kpis?.totalRegularizado)}</Title>
              <Text className="text-xs text-gray-500 mt-1">
                {formatCurrency(data.kpis?.totalPagado)} pagado confirmado
              </Text>
            </Card>
            <Card>
              <Text>Pendiente</Text>
              <Title className="mt-2">{formatCurrency(data.kpis?.totalPendiente)}</Title>
              <Text className="text-xs text-gray-500 mt-1">
                {data.kpis?.totalCasos?.toLocaleString("es-CL")} casos
              </Text>
            </Card>
            <Card>
              <Text>Estado Previred</Text>
              <div className="mt-2 flex flex-col gap-2">
                <Badge color="rose" icon={RiStackLine}>
                  Judicial: {formatCurrency(data.kpis?.estadoPrevired?.judicial?.monto || 0)}
                </Badge>
                <Badge color="emerald" icon={RiStackLine}>
                  No judicial: {formatCurrency(data.kpis?.estadoPrevired?.noJudicial?.monto || 0)}
                </Badge>
              </div>
            </Card>
          </Grid>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <Title>Ranking de empresas por deuda</Title>
                  <Text className="text-sm text-gray-500">
                    Total de deuda acumulada y accesos rápidos al detalle.
                  </Text>
                </div>
              </div>
              <BarList
                className="mt-6"
                data={ranking.map((item) => ({
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
                    onClick={() => handleIrEmpresa(item.data?.empresaRut)}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] transition hover:bg-[color:var(--theme-primary)] hover:text-white"
                  >
                    {item.data?.empresaRut}
                    <RiArrowRightLine className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <Title>Distribución por estado</Title>
              <Text className="text-sm text-gray-500">
                Acumulado considerando todos los registros del alcance.
              </Text>
              <BarList
                className="mt-6"
                data={distribucionEstado}
                valueFormatter={(value) =>
                  usaMontos ? formatCurrency(value) : `${formatNumber(value)} casos`
                }
              />
            </Card>
          </section>

          <Card>
            <Title>Entidades con mayor deuda</Title>
            <Text className="text-sm text-gray-500">
              Ranking de entidades según el total adeudado en todas las empresas del alcance.
            </Text>
            <BarList
              className="mt-6"
              data={(data.entidadesMayorDeuda || []).map((entidad) => ({
                name: entidad.entidadNombre,
                value: entidad.totalDeuda,
              }))}
              valueFormatter={(value) => formatCurrency(value)}
            />
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <RiBarChartGroupedLine className="h-5 w-5 text-[color:var(--theme-primary)]" />
              <div>
                <Title>Tendencia global</Title>
                <Text className="text-sm text-gray-500">
                  Evolución de deuda inicial, recuperado y saldo en el tiempo.
                </Text>
              </div>
            </div>
            <LineChart
              className="mt-6 h-72"
              data={data.tendencia || []}
              index="periodo"
              categories={["deudaInicialMes", "recuperadoMes", "deudaActual"]}
              colors={["rose", "emerald", "amber"]}
              valueFormatter={(value) => formatCurrency(value)}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MoraGlobalDashboard;
