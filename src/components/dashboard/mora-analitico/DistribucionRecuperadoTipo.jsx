"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, DonutChart } from "@tremor/react";
import apiService from "@/app/api/apiService";

const DistribucionRecuperadoTipo = ({ empresaRut }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/resumen-financiero`
        );

        const resumen = res.data.data;

        setData([
          {
            name: "Regularizado",
            value: resumen.totalRegularizado || 0,
          },
          {
            name: "Pagado",
            value: resumen.totalPago || 0,
          },
        ]);
      } catch (error) {
        console.error("❌ Error cargando distribución tipo recuperación:", error);
      }
    };

    if (empresaRut) fetchResumen();
  }, [empresaRut]);

  if (!data || !data.length) return null;

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const formatter = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <Title>🏷️ Distribución del Recuperado por Tipo</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Visualiza si la recuperación proviene de regularizaciones o pagos.
      </Text>
      <DonutChart
        data={data}
        category="value"
        index="name"
        colors={["indigo", "emerald"]}
        valueFormatter={formatter}
        showLabel
        showLegend
      />
      <Text className="mt-2 text-xs text-gray-500">
        Total recuperado: {formatter(total)}
      </Text>
    </Card>
  );
};

export default DistribucionRecuperadoTipo;