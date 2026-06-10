"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiBankLine,
  RiCheckboxCircleLine,
  RiFundsLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const formatoCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const IndicadoresOperativos = ({ empresaRut, entidadId, dateRange }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchIndicadores = async () => {
      if (!empresaRut) return;

      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/indicadores`, {
          params,
        });
        setMetrics(res.data.data);
      } catch (error) {
        console.error("❌ Error cargando indicadores operativos:", error);
        setMetrics(null);
      }
    };

    fetchIndicadores();
  }, [empresaRut, entidadId, dateRange]);

  const resumen = useMemo(() => {
    if (!metrics) return null;
    const { totalDeuda = 0, totalRegularizado = 0, totalPagado = 0 } = metrics;

    return {
      totalDeuda,
      totalRegularizado,
      totalPagado,
    };
  }, [metrics]);

  if (!resumen) {
    return null;
  }

  const cards = [
    {
      label: "Deuda total",
      value: formatoCLP(resumen.totalDeuda),
      description: "Monto detectado en el periodo seleccionado.",
      icon: RiFundsLine,
      tone: "border-slate-300 bg-slate-100 text-slate-800",
    },
    {
      label: "Regularizado",
      value: formatoCLP(resumen.totalRegularizado),
      description: "Casos cerrados vía regularización.",
      delta: resumen.totalDeuda > 0 ? (resumen.totalRegularizado / resumen.totalDeuda) * 100 : 0,
      icon: RiCheckboxCircleLine,
      tone: "bg-emerald-700 text-white",
    },
    {
      label: "Pagado",
      value: formatoCLP(resumen.totalPagado),
      description: "Pagos confirmados por la entidad.",
      delta: resumen.totalDeuda > 0 ? (resumen.totalPagado / resumen.totalDeuda) * 100 : 0,
      icon: RiBankLine,
      tone: "bg-indigo-800 text-white",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {cards.map(({ label, value, description, delta, icon: Icon, tone }) => (
        <article key={label} className="relative min-h-[160px] overflow-hidden rounded-lg border border-indigo-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-5 text-3xl font-bold text-slate-950">{value}</p>
            </div>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${tone}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm leading-5 text-slate-600">{description}</p>
            {typeof delta === "number" && !Number.isNaN(delta) ? (
              <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
};

export default IndicadoresOperativos;
