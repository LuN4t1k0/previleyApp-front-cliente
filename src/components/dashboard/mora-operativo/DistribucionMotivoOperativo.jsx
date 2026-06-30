"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
} from "@tremor/react";
import { RiMindMap } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

const MAX_CHART_ITEMS = 8;

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const DistribucionMotivoOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    const fetchMotivos = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get("/mora-dashboard/operativo/distribucion-motivo", {
          params,
        });
        setMotivos(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando distribución por motivo:", error);
        setMotivos([]);
      }
    };

    fetchMotivos();
  }, [empresaRut, entidadId, dateRange]);

  const { chartData, tableData, totalCasos, totalMonto } = useMemo(() => {
    if (!Array.isArray(motivos) || motivos.length === 0) {
      return { chartData: [], tableData: [], totalCasos: 0, totalMonto: 0 };
    }

    const ordenados = [...motivos].sort((a, b) => Number(b.casos || 0) - Number(a.casos || 0));
    const totalCasosCalc = ordenados.reduce((acc, item) => acc + Number(item.casos || 0), 0);
    const totalMontoCalc = ordenados.reduce((acc, item) => acc + Number(item.monto || 0), 0);

    const topItems = ordenados.slice(0, MAX_CHART_ITEMS);
    const rest = ordenados.slice(MAX_CHART_ITEMS);
    const otrosCasos = rest.reduce((acc, item) => acc + Number(item.casos || 0), 0);

    const chartItems = [...topItems];
    if (otrosCasos > 0) {
      chartItems.push({ motivo: "Otros motivos", casos: otrosCasos, monto: 0 });
    }

    const chart = chartItems.map((item) => ({
      motivo: item.motivo || "Sin motivo",
      Casos: Number(item.casos || 0),
    }));

    return {
      chartData: chart,
      tableData: ordenados,
      totalCasos: totalCasosCalc,
      totalMonto: totalMontoCalc,
    };
  }, [motivos]);

  if (!chartData.length) {
    return null;
  }

  return (
    <SectionCard>
      <SectionHeader
        title="Clasificación de casos por motivo"
        description={`Casos totales: ${totalCasos.toLocaleString("es-CL")}. Monto asociado: ${formatCLP(totalMonto)}.`}
        badge={`${tableData.length} motivos`}
        icon={RiMindMap}
      />

      <div className="overflow-x-auto border-t border-indigo-100 px-5 py-5">
        <div className="min-w-[640px]">
          <BarChart
            data={chartData}
            index="motivo"
            categories={["Casos"]}
            colors={["indigo"]}
            valueFormatter={(value) => Number(value || 0).toLocaleString("es-CL")}
            showLegend={false}
            yAxisWidth={64}
            rotateLabelX={{ angle: 0, verticalShift: 12, xAxisHeight: 120 }}
          />
        </div>
      </div>

      <div className="overflow-x-auto border-t border-indigo-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 font-semibold text-stone-700">
            <tr>
              <th className="px-6 py-4">Motivo</th>
              <th className="px-6 py-4 text-right">Casos</th>
              <th className="px-6 py-4 text-right">Monto</th>
              <th className="px-6 py-4 text-right">Porcentaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100">
            {tableData.map((item) => {
              const casos = Number(item.casos || 0);
              const monto = Number(item.monto || 0);
              const porcentaje = totalCasos ? (casos / totalCasos) * 100 : 0;
              return (
                <tr key={item.motivo || "sin-motivo"}>
                  <td className="px-6 py-4 font-semibold text-slate-950">{item.motivo || "Sin motivo"}</td>
                  <td className="px-6 py-4 text-right">{casos.toLocaleString("es-CL")}</td>
                  <td className="px-6 py-4 text-right font-semibold text-indigo-800">{formatCLP(monto)}</td>
                  <td className="px-6 py-4 text-right">{porcentaje.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default DistribucionMotivoOperativo;
