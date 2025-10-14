"use client";
import { useEffect, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
import apiService from "@/app/api/apiService";
import {
  ESTADOS_ORDENADOS,
  COLOR_MAP_ESTADO_PREVIRED,
  normalizarEstadoPrevired,
} from "@/utils/estadoPrevired.utils";

const EstadoPreviredPorEntidadChart = ({ empresaRut }) => {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/estado-previred-por-entidad`);
        const raw = res.data.data;

        const agrupado = {};

        raw.forEach(({ entidad, estado, monto }) => {
          const estadoNormalizado = normalizarEstadoPrevired(estado);

          if (!agrupado[entidad]) {
            agrupado[entidad] = { entidad };
            ESTADOS_ORDENADOS.forEach((nombreEstado) => {
              agrupado[entidad][nombreEstado] = 0;
            });
          }

          agrupado[entidad][estadoNormalizado] = monto;
        });

        setCategorias(ESTADOS_ORDENADOS);
        setData(Object.values(agrupado));
      } catch (error) {
        console.error("Error cargando estado previred por entidad:", error);
      }
    };

    if (empresaRut) fetchData();
  }, [empresaRut]);

  if (!data.length) return null;

  return (
    <Card>
      <Title>🏛️ Deuda por Institución y Estado Judicial</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Distribución del monto de deuda pendiente según estado Judicial, Pre Judicial o No Judicial.
      </Text>
      <BarChart
        data={data}
        index="entidad"
        categories={categorias}
        colors={categorias.map((estado) => COLOR_MAP_ESTADO_PREVIRED[estado] || "slate")}
        valueFormatter={(n) =>
          new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0,
          }).format(n)
        }
        stack={true}
        yAxisWidth={70}
        className="mt-6 h-80"
      />
    </Card>
  );
};

export default EstadoPreviredPorEntidadChart;
