"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { RiCheckboxCircleLine } from "@remixicon/react";

const RendimientoPorInstitucion = ({ empresaRut }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/deuda-por-institucion`
        );
        const raw = res.data.data;

        const enriquecido = raw
          .map((inst) => {
            const porcentaje = inst.deuda > 0
              ? (inst.recuperado / inst.deuda) * 100
              : 0;

            return {
              entidad: inst.entidad,
              deuda: inst.deuda,
              recuperado: inst.recuperado,
              porcentajeRecuperado: parseFloat(porcentaje.toFixed(2)),
            };
          })
          .sort((a, b) => a.entidad.localeCompare(b.entidad));

        setData(enriquecido);
      } catch (error) {
        console.error("❌ Error cargando rendimiento por institución:", error);
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

  const getBadgeColor = (porcentaje) => {
    if (porcentaje >= 70) return "emerald";
    if (porcentaje >= 40) return "amber";
    return "red";
  };

  const renderBadge = (porcentaje) => {
    const color = getBadgeColor(porcentaje);

    const bg = {
      emerald: "bg-emerald-100 dark:bg-emerald-400/20",
      amber: "bg-amber-100 dark:bg-amber-400/20",
      red: "bg-red-100 dark:bg-red-400/20",
    }[color];

    const text = {
      emerald: "text-emerald-800 dark:text-emerald-500",
      amber: "text-amber-800 dark:text-amber-500",
      red: "text-red-800 dark:text-red-500",
    }[color];

    return (
      <span
        className={`inline-flex items-center gap-x-1 rounded-tremor-small px-2 py-1 text-tremor-label font-semibold ${bg} ${text}`}
      >
        <RiCheckboxCircleLine className="-ml-0.5 size-4" />
        {porcentaje.toFixed(1)}%
      </span>
    );
  };

  if (!data.length) return null;

  return (
    <Card>
      <Title>🏦 Rendimiento por Institución</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Comparativo de recuperación por entidad.
      </Text>

      <BarChart
        data={data}
        index="entidad"
        categories={["deuda", "recuperado"]}
        colors={["gray", "emerald"]}
        showLegend
        valueFormatter={formatter}
        yAxisWidth={80}
        className="mt-4"
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {data.map((item) => (
          <div
            key={item.entidad}
            className="flex items-center justify-between p-2 border rounded"
          >
            <Text className="font-medium">{item.entidad}</Text>
            {renderBadge(item.porcentajeRecuperado)}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RendimientoPorInstitucion;