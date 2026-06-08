"use client";

import { useEffect, useMemo, useState } from "react";
import { AreaChart } from "@tremor/react";
import { RiLineChartLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

const formatter = (number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(number || 0);

const HistoricoOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const fetchHistorico = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/historico`, {
          params,
        });
        setHistorico(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando evolución histórica:", error);
        setHistorico([]);
      }
    };

    fetchHistorico();
  }, [empresaRut, entidadId, dateRange]);

  const dataChart = useMemo(() => {
    if (!Array.isArray(historico) || historico.length === 0) return [];
    return historico.map((fila) => ({
      periodo: fila.periodo,
      "Deuda inicial acumulada": Number(fila.deudaInicialAcumulada || 0),
      "Regularizado acumulado": Number(fila.recuperadoAcumulado || 0),
      "Deuda actual": Number(fila.deudaActual || 0),
    }));
  }, [historico]);

  if (!dataChart.length) {
    return null;
  }

  const ultimoRegistro = historico[historico.length - 1];

  return (
    <SectionCard>
      <SectionHeader
        title="Evolución histórica de la deuda"
        description="Historial comparado entre deuda inicial acumulada, montos regularizados y saldo actual."
        badge={`${dataChart.length} periodos`}
        icon={RiLineChartLine}
      />

      <div className="border-t border-indigo-100 px-5 py-5">
        <AreaChart
          data={dataChart}
          index="periodo"
          categories={["Deuda inicial acumulada", "Regularizado acumulado", "Deuda actual"]}
          colors={["rose", "emerald", "orange"]}
          valueFormatter={formatter}
          showLegend
          yAxisWidth={80}
        />
      </div>

      {ultimoRegistro ? (
        <div className="grid gap-3 border-t border-indigo-100 bg-indigo-50 px-5 py-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-stone-600">Avance acumulado</p>
            <p className="mt-1 text-lg font-bold text-slate-950">
              {Number(ultimoRegistro.avancePorcentaje || 0).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-stone-600">Regularizado</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {formatter(ultimoRegistro.recuperadoAcumulado)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-stone-600">Saldo</p>
            <p className="mt-1 text-lg font-bold text-indigo-800">
              {formatter(ultimoRegistro.deudaActual)}
            </p>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
};

export default HistoricoOperativo;
