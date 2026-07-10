"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DonutChart,
} from "@tremor/react";
import { RiPieChartLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { formatMoraEstadoLabel } from "@/utils/moraEstado";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

const formatEstado = (estado) => {
  return formatMoraEstadoLabel(estado);
};

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

const formatCLP = (valor) => currencyFormatter.format(valor || 0);

const formatNumber = (valor) => numberFormatter.format(valor || 0);

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

  const {
    chartData,
    rows,
    totalObservado,
    totalPendiente,
    totalRegularizado,
    totalCasos,
    casosPendientes,
    totalJudicial,
    totalPreJudicial,
    totalNoJudicial,
    focoOperativo,
  } = useMemo(() => {
    if (!Array.isArray(estados) || estados.length === 0) {
      return {
        chartData: [],
        rows: [],
        totalObservado: 0,
        totalPendiente: 0,
        totalRegularizado: 0,
        totalCasos: 0,
        casosPendientes: 0,
        totalJudicial: 0,
        totalPreJudicial: 0,
        totalNoJudicial: 0,
        focoOperativo: null,
      };
    }

    const ordenados = [...estados].sort((a, b) => (b.monto || 0) - (a.monto || 0));
    const totalObservadoCalc = ordenados.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalCasosCalc = ordenados.reduce((acc, item) => acc + Number(item.casos || item.cantidad || 0), 0);
    const totalJudicialCalc = ordenados.reduce(
      (acc, item) => acc + Number(item.montoJudicial || 0),
      0
    );
    const totalPreJudicialCalc = ordenados.reduce(
      (acc, item) => acc + Number(item.montoPreJudicial || 0),
      0
    );
    const totalNoJudicialCalc = ordenados.reduce(
      (acc, item) => acc + Number(item.montoNoJudicial || 0),
      0
    );
    const totalPendienteCalc = totalJudicialCalc + totalPreJudicialCalc + totalNoJudicialCalc;
    const regularizadoExplicito = ordenados.reduce((acc, item) => {
      const label = formatEstado(item.estado).toLowerCase();
      if (label.includes("regularizado") || label.includes("cerrada")) {
        return acc + Number(item.monto || 0);
      }
      return acc;
    }, 0);
    const totalRegularizadoCalc = regularizadoExplicito || Math.max(totalObservadoCalc - totalPendienteCalc, 0);
    const casosPendientesCalc = ordenados.reduce((acc, item) => {
      const label = formatEstado(item.estado).toLowerCase();
      const tieneRiesgo =
        Number(item.montoJudicial || 0) + Number(item.montoPreJudicial || 0) + Number(item.montoNoJudicial || 0) > 0;
      return tieneRiesgo || label.includes("pendiente") ? acc + Number(item.casos || item.cantidad || 0) : acc;
    }, 0);

    const riskRows = [
      {
        key: "judicial",
        label: "Judicial",
        monto: totalJudicialCalc,
        casos: ordenados.reduce((acc, item) => acc + Number(item.casosJudiciales || 0), 0),
        textClass: "text-red-700",
      },
      {
        key: "preJudicial",
        label: "Pre judicial",
        monto: totalPreJudicialCalc,
        casos: ordenados.reduce((acc, item) => acc + Number(item.casosPreJudiciales || 0), 0),
        textClass: "text-orange-700",
      },
      {
        key: "noJudicial",
        label: "No judicial",
        monto: totalNoJudicialCalc,
        casos: ordenados.reduce((acc, item) => acc + Number(item.casosNoJudiciales || 0), 0),
        textClass: "text-blue-700",
      },
    ].filter((item) => item.monto > 0);

    const data = riskRows.map((item) => ({
      name: item.label,
      value: item.monto,
    }));

    const rowsWithPercent = riskRows.map((item) => ({
      ...item,
      porcentaje: totalPendienteCalc > 0 ? (item.monto / totalPendienteCalc) * 100 : 0,
    }));
    const foco = rowsWithPercent.reduce(
      (mayor, item) => (!mayor || item.monto > mayor.monto ? item : mayor),
      null
    );

    return {
      chartData: data,
      rows: rowsWithPercent,
      totalObservado: totalObservadoCalc,
      totalPendiente: totalPendienteCalc,
      totalRegularizado: totalRegularizadoCalc,
      totalCasos: totalCasosCalc,
      casosPendientes: casosPendientesCalc,
      totalJudicial: totalJudicialCalc,
      totalPreJudicial: totalPreJudicialCalc,
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
        title="Distribución del pendiente operativo"
        description={`Pendiente: ${formatCLP(totalPendiente)} en ${formatNumber(casosPendientes)} casos. Total observado: ${formatCLP(totalObservado)}.`}
        badge={`${chartData.length} riesgos`}
        icon={RiPieChartLine}
      />

      <div className="grid gap-4 border-t border-indigo-100 px-5 pt-5 md:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase text-amber-700">Pendiente</p>
          <p className="mt-1 text-sm font-semibold text-amber-950">{formatCLP(totalPendiente)}</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-semibold uppercase text-red-700">Judicial</p>
          <p className="mt-1 text-sm font-semibold text-red-950">{formatCLP(totalJudicial)}</p>
        </div>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
          <p className="text-xs font-semibold uppercase text-orange-700">Pre judicial</p>
          <p className="mt-1 text-sm font-semibold text-orange-950">{formatCLP(totalPreJudicial)}</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-semibold uppercase text-blue-700">No judicial</p>
          <p className="mt-1 text-sm font-semibold text-blue-950">{formatCLP(totalNoJudicial)}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase text-emerald-700">Regularizado</p>
          <p className="mt-1 text-sm font-semibold text-emerald-950">{formatCLP(totalRegularizado)}</p>
        </div>
      </div>

      {focoOperativo ? (
        <div className="px-5 pt-4">
          <div className="flex flex-col gap-3 rounded-lg border border-orange-200 bg-orange-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-orange-800">
                Mayor foco pendiente
              </p>
              <p className="mt-1 text-lg font-semibold text-orange-950">
                {focoOperativo.label} · {formatCLP(focoOperativo.monto)}
              </p>
            </div>
            <div className="rounded-md bg-white/70 px-3 py-2 text-sm font-semibold text-orange-900">
              {focoOperativo.porcentaje.toFixed(1)}% del pendiente
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 px-5 py-5 lg:grid-cols-[0.68fr_1.32fr]">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 lg:max-w-[420px]">
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            valueFormatter={(valor) => formatCLP(valor)}
            colors={["red", "orange", "blue"]}
            showLegend
          />
        </div>

        <div className="min-w-0 overflow-x-auto">
          <table className="min-w-[780px] text-left text-sm xl:min-w-full">
            <thead className="bg-slate-50 font-semibold text-stone-700">
              <tr>
                <th className="px-4 py-3">Riesgo pendiente</th>
                <th className="px-4 py-3 text-right">Casos</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Participación del pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100">
            {rows.map((item) => {
              return (
                <tr key={item.key}>
                  <td className={`px-4 py-4 font-semibold ${item.textClass}`}>{item.label}</td>
                  <td className="px-4 py-4 text-right">{formatNumber(item.casos)}</td>
                  <td className={`px-4 py-4 text-right font-semibold ${item.textClass}`}>{formatCLP(item.monto)}</td>
                  <td className="px-4 py-4 text-right">{item.porcentaje.toFixed(1)}%</td>
                </tr>
              );
            })}
            </tbody>
          </table>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Total observado: <span className="font-semibold text-slate-950">{formatCLP(totalObservado)}</span>{" "}
            = pendiente <span className="font-semibold text-amber-800">{formatCLP(totalPendiente)}</span>{" "}
            + regularizado <span className="font-semibold text-emerald-700">{formatCLP(totalRegularizado)}</span>.
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default DistribucionEstadoOperativo;
