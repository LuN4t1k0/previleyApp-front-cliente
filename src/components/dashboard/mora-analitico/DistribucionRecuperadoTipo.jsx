"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
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

        setData({
          Regularizado: resumen.totalRegularizado || 0,
          Pagado: resumen.totalPagado ?? resumen.totalPago ?? 0,
        });
      } catch (error) {
        console.error("❌ Error cargando distribución tipo recuperación:", error);
      }
    };

    if (empresaRut) fetchResumen();
  }, [empresaRut]);

  if (!data) return null;

  const chartData = [
    {
      tipo: "Regularizado vs Pagado",
      Regularizado: data.Regularizado,
      Pagado: data.Pagado,
    },
  ];
  const total = data.Regularizado + data.Pagado;

  const formatter = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card>
      <Title>🏷️ Distribución del Regularizado por Tipo</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Visualiza si la regularización proviene de regularizaciones o pagos.
      </Text>
      <BarChart
        data={chartData}
        index="tipo"
        categories={["Regularizado", "Pagado"]}
        colors={["indigo", "emerald"]}
        valueFormatter={formatter}
        showLegend
        className="mt-6"
      />
      <Text className="mt-2 text-xs text-gray-500">
        Total regularizado: {formatter(total)}
      </Text>
    </Card>
  );
};

export default DistribucionRecuperadoTipo;
