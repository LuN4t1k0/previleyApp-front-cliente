"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DonutChart,
} from "@tremor/react";
import { RiPieChartLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  return estado
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const DistribucionEstadoOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchDistribucion = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/distribucion-estado`, {
          params,
        });
        setEstados(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando distribución por estado:", error);
        setEstados([]);
      }
    };

    fetchDistribucion();
  }, [empresaRut, entidadId, dateRange]);

  const { chartData, totalMonto, totalCasos } = useMemo(() => {
    if (!Array.isArray(estados) || estados.length === 0) {
      return { chartData: [], totalMonto: 0, totalCasos: 0 };
    }

    const ordenados = [...estados].sort((a, b) => (b.monto || 0) - (a.monto || 0));
    const totalMontoCalc = ordenados.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalCasosCalc = ordenados.reduce((acc, item) => acc + Number(item.casos || item.cantidad || 0), 0);

    const data = ordenados.map((item) => ({
      name: formatEstado(item.estado),
      value: Number(item.monto || 0),
    }));

    return {
      chartData: data,
      totalMonto: totalMontoCalc,
      totalCasos: totalCasosCalc,
    };
  }, [estados]);

  if (!chartData.length) {
    return null;
  }

  return (
    <SectionCard>
      <SectionHeader
        title="Distribución de deuda por estado operativo"
        description={`Casos totales: ${totalCasos.toLocaleString("es-CL")}. Monto pendiente: ${formatCLP(totalMonto)}.`}
        badge={`${chartData.length} estados`}
        icon={RiPieChartLine}
      />

      <div className="grid gap-6 border-t border-indigo-100 px-5 py-5 lg:grid-cols-2">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            valueFormatter={(valor) => formatCLP(valor)}
            colors={["emerald", "amber", "violet", "slate", "indigo", "cyan", "emerald"]}
            showLegend
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 font-semibold text-stone-700">
              <tr>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Casos</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100">
            {estados.map((item) => {
              const casos = Number(item.casos || item.cantidad || 0);
              const monto = Number(item.monto || 0);
              const porcentaje = totalMonto > 0 ? (monto / totalMonto) * 100 : 0;

              return (
                <tr key={item.estado}>
                  <td className="px-4 py-4 font-semibold text-slate-950">{formatEstado(item.estado)}</td>
                  <td className="px-4 py-4 text-right">{casos.toLocaleString("es-CL")}</td>
                  <td className="px-4 py-4 text-right font-semibold text-indigo-800">{formatCLP(monto)}</td>
                  <td className="px-4 py-4 text-right">{porcentaje.toFixed(1)}%</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
};

export default DistribucionEstadoOperativo;
