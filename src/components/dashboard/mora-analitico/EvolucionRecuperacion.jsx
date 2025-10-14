"use client";

import { useEffect, useState } from "react";
import { LineChart, Card, Title, Text } from "@tremor/react";
import apiService from "@/app/api/apiService";

const EvolucionRecuperacion = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/evolucion-temporal`);
        const raw = res.data.data;

        // Asegurar presencia de campos clave
        const formatted = raw.map((r) => ({
          periodo: r.periodo,
          regularizado: r.regularizado || 0,
          pago: r.pago || 0,
        }));

        setData(formatted);
      } catch (error) {
        console.error("Error cargando evolución temporal:", error);
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
      <Title>Evolución Mensual de la Recuperación</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Observa cómo evoluciona el monto recuperado mes a mes, diferenciando regularizaciones y pagos.
      </Text>
      <LineChart
        data={data}
        index="periodo"
        categories={["regularizado", "pago"]}
        colors={["indigo", "emerald"]}
        showLegend
        valueFormatter={formatter}
        yAxisWidth={60}
        className="mt-4"
      />
    </Card>
  );
};

export default EvolucionRecuperacion;
