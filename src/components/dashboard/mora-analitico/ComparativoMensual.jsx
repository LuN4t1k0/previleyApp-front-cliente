"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
import apiService from "@/app/api/apiService";

const ComparativoMensual = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchEvolucion = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/evolucion-temporal`
        );

        // El backend devuelve { "MM/YYYY": { regularizado, pagado }, ... }
        const raw = res.data.data;

        const resultado = Object.entries(raw).map(([periodo, valores]) => ({
          periodo,
          deuda: (valores.regularizado || 0) + (valores.pagado || 0) + (valores.pendiente || 0) || 0,
          regularizado: valores.regularizado || 0,
          pagado: valores.pagado || 0,
        }));

        // Ordenar por fecha real
        resultado.sort((a, b) => {
          const [ma, ya] = a.periodo.split("/").map(Number);
          const [mb, yb] = b.periodo.split("/").map(Number);
          return ya !== yb ? ya - yb : ma - mb;
        });

        setData(resultado);
      } catch (error) {
        console.error("❌ Error cargando comparativo mensual:", error);
      }
    };

    if (empresaRut) fetchEvolucion();
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
      <Title>📅 Comparativo Mensual de Gestión</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Evolución de la deuda detectada, regularizada y pagada mes a mes.
      </Text>
      <BarChart
        data={data}
        index="periodo"
        categories={["deuda", "regularizado", "pagado"]}
        colors={["slate", "indigo", "emerald"]}
        valueFormatter={formatter}
        showXAxis
        showYAxis
        showLegend
        yAxisWidth={80}
        className="mt-4"
      />
    </Card>
  );
};

export default ComparativoMensual;