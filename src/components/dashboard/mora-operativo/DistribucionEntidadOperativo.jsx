"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart } from "@tremor/react";
import { RiBuilding2Line } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

const palette = ["indigo", "cyan", "emerald", "amber", "rose", "violet", "slate"];

const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  return estado
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatter = (number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(number || 0);

const DistribucionEntidadOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    const fetchDistribucionPorEntidad = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/distribucion-estado-por-entidad`, {
          params,
        });
        setDataset(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando distribución por entidad:", error);
        setDataset([]);
      }
    };

    fetchDistribucionPorEntidad();
  }, [empresaRut, entidadId, dateRange]);

  const { chartData, categorias, totalMonto } = useMemo(() => {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      return { chartData: [], categorias: [], totalMonto: 0 };
    }

    const agrupado = new Map();
    const totalesPorEstado = new Map();
    let total = 0;

    dataset.forEach((registro) => {
      const entidadNombre = registro.entidadNombre || registro.entidad || "Sin entidad";
      const estado = formatEstado(registro.estado);
      const monto = Number(registro.monto || 0);
      total += monto;

      if (!agrupado.has(entidadNombre)) {
        agrupado.set(entidadNombre, { entidad: entidadNombre });
      }

      const actual = agrupado.get(entidadNombre);
      actual[estado] = (actual[estado] || 0) + monto;

      totalesPorEstado.set(estado, (totalesPorEstado.get(estado) || 0) + monto);
    });

    const categoriasOrdenadas = Array.from(totalesPorEstado.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([estado]) => estado);

    const data = Array.from(agrupado.values());

    return { chartData: data, categorias: categoriasOrdenadas, totalMonto: total };
  }, [dataset]);

  if (!chartData.length || !categorias.length) {
    return null;
  }

  const chartMinWidth = Math.max(640, chartData.length * 80);

  return (
    <SectionCard>
      <SectionHeader
        title="Deuda por estado y entidad"
        description="Identifica qué entidades concentran los montos más altos por estado operativo."
        badge={`${chartData.length} entidades`}
        icon={RiBuilding2Line}
      />

      <div className="border-t border-indigo-100 px-5 py-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase text-stone-600">Monto observado</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatter(totalMonto)}</p>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase text-stone-600">Estados</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{categorias.length}</p>
          </div>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase text-stone-600">Entidades</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{chartData.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="pr-4" style={{ minWidth: chartMinWidth }}>
            <BarChart
              data={chartData}
              index="entidad"
              categories={categorias}
              valueFormatter={formatter}
              colors={categorias.map((_, idx) => palette[idx % palette.length])}
              stack
              showLegend
              showXAxis
              showYAxis
              tickGap={0}
              rotateLabelX={{ angle: 0, verticalShift: 12, xAxisHeight: 80 }}
              yAxisWidth={90}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default DistribucionEntidadOperativo;
