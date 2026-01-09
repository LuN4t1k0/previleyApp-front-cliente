"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Grid, Title, Text, BarList, LineChart } from "@tremor/react";
import { RiBuildingLine, RiArrowRightLine } from "@remixicon/react";
import { getPagexGlobalDashboard } from "@/services/api/globalDashboards";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const PagexGlobalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getPagexGlobalDashboard();
        setData(response);
      } catch (err) {
        console.error("Error al cargar dashboard global Pagex:", err);
        setError(err.message || "No fue posible cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIrEmpresa = (empresaRut) => {
    if (!empresaRut) return;
    router.push(`/servicios/pagos-en-exceso?tab=dashboard-operativo&empresa=${empresaRut}`);
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

  if (!data) return null;

  return (
    <div className="theme-pagex">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="glass-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                Pagos en Exceso
              </span>
              <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                Dashboard global multi-empresa
              </h1>
              <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                Consolidado financiero de solicitudes, recuperaciones y pendientes.
              </p>
              <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm">
                <RiBuildingLine className="h-4 w-4 text-[color:var(--theme-primary)]" />
                <span>
                  Alcance: {data.scope?.isGlobal ? "Administrador" : "Empresas asignadas"} ·{" "}
                  {Array.isArray(data.scope?.empresas) ? data.scope.empresas.length : "∞"} empresas
                </span>
              </div>
            </div>
          </section>

          <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
            <Card>
              <Text>Total solicitado</Text>
              <Title className="mt-2">{formatCurrency(data.resumen?.totalSolicitado)}</Title>
            </Card>
            <Card>
              <Text>Total recuperado</Text>
              <Title className="mt-2">{formatCurrency(data.resumen?.totalRecuperado)}</Title>
            </Card>
            <Card>
              <Text>Total pendiente</Text>
              <Title className="mt-2">{formatCurrency(data.resumen?.totalPendiente)}</Title>
            </Card>
          </Grid>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <Title>Ranking de empresas</Title>
              <Text className="text-sm text-gray-500">
                Deuda agregada por empresa, ordenada de mayor a menor.
              </Text>
              <BarList
                className="mt-6"
                data={(data.rankingEmpresas || []).map((item) => ({
                  name: item.empresaRut,
                  value: item.totalMonto,
                }))}
                valueFormatter={(value) => formatCurrency(value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {(data.rankingEmpresas || []).map((item) => (
                  <button
                    key={item.empresaRut}
                    type="button"
                    onClick={() => handleIrEmpresa(item.empresaRut)}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] transition hover:bg-[color:var(--theme-primary)] hover:text-white"
                  >
                    {item.empresaRut}
                    <RiArrowRightLine className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <Title>Casos por estado</Title>
              <Text className="text-sm text-gray-500">
                Cantidad y porcentaje acumulado de cada estado operativo.
              </Text>
              <BarList
                className="mt-6"
                data={[
                  { name: "Pendiente", value: data.casosPorEstado?.pendientes || 0 },
                  { name: "Resuelto", value: data.casosPorEstado?.resueltos || 0 },
                  { name: "Rechazado", value: data.casosPorEstado?.rechazados || 0 },
                ]}
                valueFormatter={(value) =>
                  new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(value || 0)
                }
              />
            </Card>
          </section>

          <Card>
            <Title>Tendencia mensual</Title>
            <Text className="text-sm text-gray-500">
              Evolución de los montos registrados en cada periodo.
            </Text>
            <LineChart
              className="mt-6 h-72"
              data={(data.tendencia || []).filter((item) => item.periodo)}
              index="periodo"
              categories={["monto"]}
              colors={["indigo"]}
              valueFormatter={(value) => formatCurrency(value)}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PagexGlobalDashboard;
