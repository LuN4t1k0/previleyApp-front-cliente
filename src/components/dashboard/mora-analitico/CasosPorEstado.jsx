"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, DonutChart } from "@tremor/react";
import apiService from "@/app/api/apiService";

const CasosPorEstado = ({ empresaRut }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchCasos = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/casos-por-estado`
        );
        setData(res.data.data);
      } catch (error) {
        console.error("❌ Error cargando casos por estado:", error);
      }
    };

    if (empresaRut) fetchCasos();
  }, [empresaRut]);

  if (!data) return null;

  const total = data.total || 0;

  return (
    <Card>
      <Title>📌 Casos por Estado</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Progreso total de gestiones realizadas.
      </Text>

      <DonutChart
        data={[
          { name: "Pendientes", value: data.pendientes },
          { name: "Completados", value: data.completados },
          { name: "Rechazados", value: data.rechazados },
        ]}
        category="value"
        index="name"
        colors={["amber", "emerald", "rose"]}
        showLegend
        valueFormatter={(v) => `${v} casos`}
      />

      <Text className="mt-4 text-sm font-medium text-slate-600">
        Avance general: {data.porcentajeAvance?.toFixed(1)}%
      </Text>
    </Card>
  );
};

export default CasosPorEstado;