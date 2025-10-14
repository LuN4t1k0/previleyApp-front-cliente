"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { normalizarEstadoPrevired } from "@/utils/estadoPrevired.utils";
import { RiAlertLine } from "@remixicon/react";

const EntidadesMasRiesgosas = ({ empresaRut }) => {
  const [data, setData] = useState([]);
  const [riesgosAltos, setRiesgosAltos] = useState([]);

  const UMBRAL_ALERTA = 10_000_000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/estado-previred-por-entidad`
        );
        const raw = res.data.data;

        const judicialData = raw
          .filter((item) => normalizarEstadoPrevired(item.estado) === "Judicial")
          .map((item) => ({
            entidad: item.entidad,
            deudaJudicial: item.monto,
          }))
          .sort((a, b) => b.deudaJudicial - a.deudaJudicial)
          .slice(0, 10);

        setData(judicialData);

        const entidadesAlerta = judicialData
          .filter((e) => e.deudaJudicial >= UMBRAL_ALERTA)
          .map((e) => e.entidad);
        setRiesgosAltos(entidadesAlerta);
      } catch (error) {
        console.error("❌ Error cargando entidades judiciales:", error);
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

  const renderBadge = (valor) => {
    if (valor < UMBRAL_ALERTA) return null;

    return (
      <span className="inline-flex items-center gap-x-1 rounded-tremor-small px-2 py-1 text-tremor-label font-semibold bg-red-100 dark:bg-red-400/20 text-red-800 dark:text-red-500">
        <RiAlertLine className="-ml-0.5 size-4" aria-hidden />
        {'>'} $10M
      </span>
    );
  };

  if (!data.length) return null;

  return (
    <Card>
      <Title>🏦 Entidades con Mayor Deuda Judicial</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Instituciones con alto riesgo judicial.{" "}
        {riesgosAltos.length > 0 && (
          <span className="font-semibold text-red-600">
            {riesgosAltos.length} en alerta.
          </span>
        )}
      </Text>

      <BarChart
        data={data}
        index="entidad"
        categories={["deudaJudicial"]}
        colors={["rose"]}
        valueFormatter={formatter}
        showXAxis
        showYAxis
        yAxisWidth={80}
        className="mt-4"
      />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {data.map((item) => (
          <div
            key={item.entidad}
            className="flex items-center justify-between p-2 border rounded"
          >
            <Text className="font-medium">{item.entidad}</Text>
            {renderBadge(item.deudaJudicial)}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EntidadesMasRiesgosas;