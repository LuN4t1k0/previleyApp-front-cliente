"use client";

import { useEffect, useState } from "react";
import { BarChart, Card, Title, Text } from "@tremor/react";
import apiService from "@/app/api/apiService";
import {
  ESTADOS_ORDENADOS,
  COLOR_MAP_ESTADO_PREVIRED,
  normalizarEstadoPrevired,
} from "@/utils/estadoPrevired.utils";

const StackedPorEstadoPrevired = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/estado-previred-por-entidad`
        );
        const raw = res.data.data;

        const agrupado = {};

        raw.forEach(({ entidad, estado, monto }) => {
          const estadoNormalizado = normalizarEstadoPrevired(estado);

          if (!agrupado[entidad]) {
            agrupado[entidad] = { entidad };
            ESTADOS_ORDENADOS.forEach(
              (estado) => (agrupado[entidad][estado] = 0)
            );
          }

          agrupado[entidad][estadoNormalizado] = monto;
        });

        const dataFinal = Object.values(agrupado);
        setData(dataFinal);
      } catch (error) {
        console.error("❌ Error cargando estado previred por entidad:", error);
      }
    };

    if (empresaRut) fetchData();
  }, [empresaRut]);

  const formatter = (number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(number);

  if (!data.length) return null;

  return (
    <Card>
      <Title>Estado de la Deuda por Institución (Stacked)</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Visualiza cómo se distribuye la deuda pendiente según su gravedad: Judicial, Pre Judicial y No Judicial.
      </Text>
      <BarChart
        data={data}
        index="entidad"
        categories={ESTADOS_ORDENADOS}
        colors={ESTADOS_ORDENADOS.map(
          (estado) => COLOR_MAP_ESTADO_PREVIRED[estado]
        )}
        stack={true}
        showLegend
        showYAxis
        showXAxis
        valueFormatter={formatter}
        yAxisWidth={80}
        className="mt-6"
      />
    </Card>
  );
};

export default StackedPorEstadoPrevired;
