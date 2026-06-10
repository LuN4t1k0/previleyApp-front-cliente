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
  if (String(estado).trim().toLowerCase() === "espera entidad") {
    return "En espera de respuesta de entidad";
  }
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

const formatNumber = (valor) =>
  new Intl.NumberFormat("es-CL", {
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

  const { chartData, rows, totalMonto, totalCasos, totalJudicial, totalNoJudicial, focoOperativo } = useMemo(() => {
    if (!Array.isArray(estados) || estados.length === 0) {
      return {
        chartData: [],
        rows: [],
        totalMonto: 0,
        totalCasos: 0,
        totalJudicial: 0,
        totalNoJudicial: 0,
        focoOperativo: null,
      };
    }

    const ordenados = [...estados].sort((a, b) => (b.monto || 0) - (a.monto || 0));
    const totalMontoCalc = ordenados.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalCasosCalc = ordenados.reduce((acc, item) => acc + Number(item.casos || item.cantidad || 0), 0);
    const totalJudicialCalc = ordenados.reduce(
      (acc, item) => acc + Number(item.montoJudicial || 0),
      0
    );
    const totalNoJudicialCalc = ordenados.reduce(
      (acc, item) => acc + Number(item.montoNoJudicial || 0),
      0
    );

    const rowData = ordenados.map((item) => {
      const casos = Number(item.casos || item.cantidad || 0);
      const monto = Number(item.monto || 0);
      const montoJudicial = Number(item.montoJudicial || 0);
      const montoNoJudicial = Number(item.montoNoJudicial || 0);

      return {
        estado: item.estado,
        label: formatEstado(item.estado),
        casos,
        monto,
        montoJudicial,
        montoNoJudicial,
        porcentaje: totalMontoCalc > 0 ? (monto / totalMontoCalc) * 100 : 0,
        porcentajeJudicial: monto > 0 ? (montoJudicial / monto) * 100 : 0,
        porcentajeNoJudicial: monto > 0 ? (montoNoJudicial / monto) * 100 : 0,
      };
    });

    const data = ordenados.map((item) => ({
      name: formatEstado(item.estado),
      value: Number(item.monto || 0),
    }));

    const foco = [...rowData].sort((a, b) => {
      const prioridadA = a.montoJudicial || a.monto;
      const prioridadB = b.montoJudicial || b.monto;
      return prioridadB - prioridadA;
    })[0] || null;

    return {
      chartData: data,
      rows: rowData,
      totalMonto: totalMontoCalc,
      totalCasos: totalCasosCalc,
      totalJudicial: totalJudicialCalc,
      totalNoJudicial: totalNoJudicialCalc,
      focoOperativo: foco,
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

      <div className="grid gap-4 border-t border-indigo-100 px-5 pt-5 md:grid-cols-3">
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
          <p className="text-xs font-semibold uppercase text-rose-700">Judicial</p>
          <p className="mt-1 text-sm font-semibold text-rose-950">{formatCLP(totalJudicial)}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase text-emerald-700">No judicial</p>
          <p className="mt-1 text-sm font-semibold text-emerald-950">{formatCLP(totalNoJudicial)}</p>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <p className="text-xs font-semibold uppercase text-indigo-700">Mayor foco</p>
          <p className="mt-1 text-sm font-semibold text-indigo-950">
            {focoOperativo ? `${focoOperativo.label} · ${formatCLP(focoOperativo.montoJudicial || focoOperativo.monto)}` : "Sin foco"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr]">
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
                <th className="px-4 py-3 text-right">Judicial</th>
                <th className="px-4 py-3 text-right">No judicial</th>
                <th className="px-4 py-3 text-right">Porcentaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100">
            {rows.map((item) => {
              return (
                <tr key={item.estado}>
                  <td className="px-4 py-4 font-semibold text-slate-950">{item.label}</td>
                  <td className="px-4 py-4 text-right">{formatNumber(item.casos)}</td>
                  <td className="px-4 py-4 text-right font-semibold text-indigo-800">{formatCLP(item.monto)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-semibold text-rose-700">{formatCLP(item.montoJudicial)}</div>
                    <div className="text-xs text-slate-500">{item.porcentajeJudicial.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-semibold text-emerald-700">{formatCLP(item.montoNoJudicial)}</div>
                    <div className="text-xs text-slate-500">{item.porcentajeNoJudicial.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-4 text-right">{item.porcentaje.toFixed(1)}%</td>
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
