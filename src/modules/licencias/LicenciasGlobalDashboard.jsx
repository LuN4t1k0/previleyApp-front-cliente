"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Grid, Title, Text, BarList, LineChart } from "@tremor/react";
import { RiBuildingLine, RiArrowRightLine } from "@remixicon/react";
import { getLicenciasGlobalDashboard } from "@/services/api/globalDashboards";
import TrabajadorSkeleton from "@/components/skeleton/TrabajadorSkeleton";

const formatNumber = (value) =>
  new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(Number(value || 0));

const LicenciasGlobalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getLicenciasGlobalDashboard();
        setData(response);
      } catch (err) {
        console.error("Error al cargar dashboard global de licencias:", err);
        setError(err.message || "No fue posible cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleIrEmpresa = (empresaRut) => {
    if (!empresaRut) return;
    router.push(`/servicios/licencias-medicas?tab=dashboard-operativo&empresa=${empresaRut}`);
  };

  if (loading) {
    return <TrabajadorSkeleton />;
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
    <div className="theme-licencias">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="glass-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                Licencias medicas
              </span>
              <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                Dashboard global
              </h1>
              <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                Vision consolidada de licencias, anticipos y subsidios en todas tus empresas.
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

          <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
            <Card>
              <Text>Licencias totales</Text>
              <Title className="mt-2">{formatNumber(data.resumen?.totalLicencias)}</Title>
            </Card>
            <Card>
              <Text>Licencias vigentes</Text>
              <Title className="mt-2">{formatNumber(data.resumen?.licenciasVigentes)}</Title>
            </Card>
            <Card>
              <Text>Trabajadores c/licencia</Text>
              <Title className="mt-2">
                {formatNumber(data.resumen?.trabajadoresConLicencia)}
              </Title>
            </Card>
            <Card>
              <Text>Saldo financiero</Text>
              <Title className="mt-2">
                Anticipos: {formatNumber(data.resumen?.totalAnticipos)} · Subsidios:{" "}
                {formatNumber(data.resumen?.totalSubsidios)}
              </Title>
            </Card>
          </Grid>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <Title>Ranking de empresas</Title>
              <Text className="text-sm text-gray-500">
                Licencias y días acumulados por empresa.
              </Text>
              <BarList
                className="mt-6"
                data={(data.rankingEmpresas || []).map((empresa) => ({
                  name: empresa.empresaRut,
                  value: empresa.totalLicencias,
                }))}
                valueFormatter={(value) => formatNumber(value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {(data.rankingEmpresas || []).map((empresa) => (
                  <button
                    key={empresa.empresaRut}
                    type="button"
                    onClick={() => handleIrEmpresa(empresa.empresaRut)}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] transition hover:bg-[color:var(--theme-primary)] hover:text-white"
                  >
                    {empresa.empresaRut}
                    <RiArrowRightLine className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <Title>Distribución por entidad</Title>
              <Text className="text-sm text-gray-500">
                Cantidad de licencias emitidas por cada entidad.
              </Text>
              <BarList
                className="mt-6"
                data={(data.distribucionEntidad || []).map((item) => ({
                  name: item.entidad,
                  value: item.cantidad,
                }))}
                valueFormatter={(value) => formatNumber(value)}
              />
            </Card>
          </section>

          <Card>
            <Title>Tendencia mensual</Title>
            <Text className="text-sm text-gray-500">Número de licencias ingresadas cada mes.</Text>
            <LineChart
              className="mt-6 h-72"
              data={(data.tendencia || []).filter((item) => item.periodo)}
              index="periodo"
              categories={["cantidad"]}
              colors={["purple"]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LicenciasGlobalDashboard;
