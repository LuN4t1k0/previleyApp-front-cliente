"use client";

import { useEffect, useState } from "react";
import { BarChart, Card, Title, Text } from "@tremor/react";
import apiService from "@/app/api/apiService";

const ComparativoInstitucion = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/deuda-por-institucion`);
        const raw = res.data.data;

        const sorted = raw.sort((a, b) => b.deuda - a.deuda);
        setData(sorted);
      } catch (error) {
        console.error("Error cargando comparativo por institución:", error);
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
      <Title>Deuda vs Recuperado por Institución</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Muestra la relación entre la deuda total detectada y lo recuperado en cada institución.
      </Text>
      <BarChart
        data={data}
        index="entidad"
        categories={["deuda", "recuperado"]}
        colors={["rose", "emerald"]}
        showLegend
        valueFormatter={formatter}
        yAxisWidth={60}
        className="mt-4"
      />
    </Card>
  );
};

export default ComparativoInstitucion;
