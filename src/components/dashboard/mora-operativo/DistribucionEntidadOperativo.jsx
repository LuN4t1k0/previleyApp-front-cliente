"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart } from "@tremor/react";
import { RiBuilding2Line } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

const RISK_CATEGORIES = ["Judicial", "Pre judicial", "No judicial"];
const RISK_COLORS = ["rose", "orange", "emerald"];

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

  const { chartData, categorias, totalMonto, totalJudicial, totalPreJudicial, totalNoJudicial } = useMemo(() => {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      return {
        chartData: [],
        categorias: [],
        totalMonto: 0,
        totalJudicial: 0,
        totalPreJudicial: 0,
        totalNoJudicial: 0,
      };
    }

    const agrupado = new Map();
    let total = 0;
    let judicialTotal = 0;
    let preJudicialTotal = 0;
    let noJudicialTotal = 0;

    dataset.forEach((registro) => {
      const entidadNombre = registro.entidadNombre || registro.entidad || "Sin entidad";
      const monto = Number(registro.monto || 0);
      const montoJudicial = Number(registro.montoJudicial || 0);
      const montoPreJudicial = Number(registro.montoPreJudicial || 0);
      const montoNoJudicial = Number(registro.montoNoJudicial || 0);
      const pendienteRiesgo = montoJudicial + montoPreJudicial + montoNoJudicial;
      if (pendienteRiesgo <= 0) return;

      total += pendienteRiesgo;
      judicialTotal += montoJudicial;
      preJudicialTotal += montoPreJudicial;
      noJudicialTotal += montoNoJudicial;

      if (!agrupado.has(entidadNombre)) {
        agrupado.set(entidadNombre, {
          entidad: entidadNombre,
          Judicial: 0,
          "Pre judicial": 0,
          "No judicial": 0,
          total: 0,
        });
      }

      const actual = agrupado.get(entidadNombre);
      actual.Judicial += montoJudicial;
      actual["Pre judicial"] += montoPreJudicial;
      actual["No judicial"] += montoNoJudicial;
      actual.total += pendienteRiesgo;
    });

    const data = Array.from(agrupado.values()).sort((a, b) => b.total - a.total);
    const categoriasVisibles = RISK_CATEGORIES.filter((categoria) =>
      data.some((item) => Number(item[categoria] || 0) > 0)
    );

    return {
      chartData: data,
      categorias: categoriasVisibles,
      totalMonto: total,
      totalJudicial: judicialTotal,
      totalPreJudicial: preJudicialTotal,
      totalNoJudicial: noJudicialTotal,
    };
  }, [dataset]);

  if (!chartData.length || !categorias.length) {
    return null;
  }

  const chartMinWidth = Math.max(640, chartData.length * 80);

  return (
    <SectionCard>
      <SectionHeader
        title="Deuda pendiente por entidad y riesgo"
        description="Compara solo deuda pendiente por entidad, separada en judicial, pre judicial y no judicial."
        badge={`${chartData.length} entidades`}
        icon={RiBuilding2Line}
      />

      <div className="border-t border-indigo-100 px-5 py-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase text-stone-600">Monto pendiente</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{formatter(totalMonto)}</p>
          </div>
          <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
            <p className="text-xs font-semibold uppercase text-rose-700">Judicial</p>
            <p className="mt-2 text-xl font-bold text-rose-950">{formatter(totalJudicial)}</p>
          </div>
          <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
            <p className="text-xs font-semibold uppercase text-orange-700">Pre judicial</p>
            <p className="mt-2 text-xl font-bold text-orange-950">{formatter(totalPreJudicial)}</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase text-emerald-700">No judicial</p>
            <p className="mt-2 text-xl font-bold text-emerald-950">{formatter(totalNoJudicial)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="pr-4" style={{ minWidth: chartMinWidth }}>
            <BarChart
              data={chartData}
              index="entidad"
              categories={categorias}
              valueFormatter={formatter}
              colors={categorias.map(
                (categoria) => RISK_COLORS[RISK_CATEGORIES.indexOf(categoria)] || "slate"
              )}
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
