"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, DonutChart } from "@tremor/react";
import apiService from "@/app/api/apiService";
import {
  ESTADOS_ORDENADOS,
  COLOR_MAP_ESTADO_PREVIRED,
  normalizarEstadoPrevired,
} from "@/utils/estadoPrevired.utils";

const DistribucionEstadoPrevired = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/estado-previred`
        );

        const raw = res.data.data;

        const agrupado = {};

        raw.forEach(({ estado, monto }) => {
          const estadoNormalizado = normalizarEstadoPrevired(estado);
          agrupado[estadoNormalizado] = monto;
        });

        const ordenado = ESTADOS_ORDENADOS.map((estado) => ({
          name: estado,
          value: agrupado[estado] || 0,
        }));

        setData(ordenado);
      } catch (error) {
        console.error("❌ Error cargando distribución estado previred:", error);
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
      <Title>📊 Distribución por Estado de Deuda</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Visualiza la proporción de deuda pendiente según su clasificación Judicial, Pre Judicial o No Judicial.
      </Text>
      <DonutChart
        data={data}
        category="value"
        index="name"
        colors={ESTADOS_ORDENADOS.map((estado) => COLOR_MAP_ESTADO_PREVIRED[estado])}
        valueFormatter={formatter}
        showLabel
      />
    </Card>
  );
};

export default DistribucionEstadoPrevired;
