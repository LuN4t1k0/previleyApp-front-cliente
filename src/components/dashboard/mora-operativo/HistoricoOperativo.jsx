"use client";

import { useEffect, useMemo, useState } from "react";
import { AreaChart, Card, Title, Text } from "@tremor/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

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
    <Card>
      <Title>📉 Evolución histórica de la deuda</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Historial comparado entre deuda inicial acumulada, montos regularizados y saldo actual.
      </Text>
      <AreaChart
        data={dataChart}
        index="periodo"
        categories={["Deuda inicial acumulada", "Regularizado acumulado", "Deuda actual"]}
        colors={["rose", "emerald", "orange"]}
        valueFormatter={formatter}
        showLegend
        yAxisWidth={80}
        className="mt-4"
      />
      {ultimoRegistro ? (
        <Text className="text-xs text-gray-500 mt-4">
          Avance acumulado: {Number(ultimoRegistro.avancePorcentaje || 0).toFixed(1)}% | Recuperado: {formatter(ultimoRegistro.recuperadoAcumulado)} | Saldo: {formatter(ultimoRegistro.deudaActual)}
        </Text>
      ) : null}
    </Card>
  );
};

export default HistoricoOperativo;
