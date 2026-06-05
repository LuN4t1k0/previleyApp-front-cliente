"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Flex, Metric, Text, Grid, BadgeDelta } from "@tremor/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const formatoCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const IndicadoresOperativos = ({ empresaRut, entidadId, dateRange }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchIndicadores = async () => {
      if (!empresaRut) return;

      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/indicadores`, {
          params,
        });
        setMetrics(res.data.data);
      } catch (error) {
        console.error("❌ Error cargando indicadores operativos:", error);
        setMetrics(null);
      }
    };

    fetchIndicadores();
  }, [empresaRut, entidadId, dateRange]);

  const resumen = useMemo(() => {
    if (!metrics) return null;
    const { totalDeuda = 0, totalRegularizado = 0, totalPagado = 0 } = metrics;

    return {
      totalDeuda,
      totalRegularizado,
      totalPagado,
    };
  }, [metrics]);

  if (!resumen) {
    return null;
  }

  const cards = [
    {
      label: "Deuda total",
      value: formatoCLP(resumen.totalDeuda),
      description: "Monto detectado en el periodo seleccionado.",
    },
    {
      label: "Regularizado",
      value: formatoCLP(resumen.totalRegularizado),
      description: "Casos cerrados vía regularización.",
      delta: resumen.totalDeuda > 0 ? (resumen.totalRegularizado / resumen.totalDeuda) * 100 : 0,
    },
    {
      label: "Pagado",
      value: formatoCLP(resumen.totalPagado),
      description: "Pagos confirmados por la entidad.",
      delta: resumen.totalDeuda > 0 ? (resumen.totalPagado / resumen.totalDeuda) * 100 : 0,
    },
  ];

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
      {cards.map(({ label, value, description, delta }) => (
        <Card key={label}>
          <Flex justifyContent="between" alignItems="start">
            <Text className="text-sm text-gray-500">{label}</Text>
            {typeof delta === "number" && !Number.isNaN(delta) ? (
              <BadgeDelta deltaType={delta >= 0 ? "increase" : "decrease"} size="xs" className="rounded">
                {`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
              </BadgeDelta>
            ) : null}
          </Flex>
          <Metric className="mt-2">{value}</Metric>
          <Text className="text-xs text-gray-500 mt-2">{description}</Text>
        </Card>
      ))}
    </Grid>
  );
};

export default IndicadoresOperativos;
