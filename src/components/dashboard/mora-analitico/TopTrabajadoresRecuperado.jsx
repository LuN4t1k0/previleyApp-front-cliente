"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { RiCheckLine } from "@remixicon/react";

const TopTrabajadoresRecuperado = ({ empresaRut }) => {
  const [data, setData] = useState([]);
  const [topConBadge, setTopConBadge] = useState([]);

  const UMBRAL_EXCELENTE = 10_000_000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/informe-resueltos-por-trabajador`
        );

        const raw = res.data;

        const top = raw
          .map((t) => ({
            trabajador: t.nombreCompleto,
            montoRecuperado: t.totalRecuperado,
            periodos: t.periodosResueltos,
          }))
          .sort((a, b) => b.montoRecuperado - a.montoRecuperado)
          .slice(0, 10);

        setData(top);

        const conDistincion = top.filter((t) => t.montoRecuperado >= UMBRAL_EXCELENTE);
        setTopConBadge(conDistincion.map((t) => t.trabajador));
      } catch (error) {
        console.error("❌ Error cargando ranking de trabajadores recuperados:", error);
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

  const renderBadge = (trabajador) => {
    if (!topConBadge.includes(trabajador)) return null;
    return (
      <span className="inline-flex items-center gap-x-1 rounded-tremor-small px-2 py-1 text-tremor-label font-semibold bg-emerald-100 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-500">
        <RiCheckLine className="-ml-0.5 size-4" aria-hidden />
        Top
      </span>
    );
  };

  if (!data.length) return null;

  return (
    <Card>
      <Title>💼 Top Trabajadores por Monto Recuperado</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Destacando quienes han recuperado más deuda.
      </Text>

      <BarChart
        data={data}
        index="trabajador"
        categories={["montoRecuperado"]}
        colors={["emerald"]}
        valueFormatter={formatter}
        showXAxis
        showYAxis
        yAxisWidth={100}
        className="mt-4"
      />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {data.map((item) => (
          <div
            key={item.trabajador}
            className="flex items-center justify-between p-2 border rounded"
          >
            <Text className="font-medium">{item.trabajador}</Text>
            {renderBadge(item.trabajador)}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopTrabajadoresRecuperado;