"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Title, Text, Flex, Metric, Grid } from "@tremor/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const palabras = (estado) => {
  if (!estado) return "Sin estado";
  return estado
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ResumenCasosOperativos = ({ empresaRut, entidadId, dateRange }) => {
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchDistribucion = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/distribucion-estado`, {
          params,
        });
        setEstados(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando casos por estado:", error);
        setEstados([]);
      }
    };

    fetchDistribucion();
  }, [empresaRut, entidadId, dateRange]);

  const { totalCasos, resumen } = useMemo(() => {
    const total = estados.reduce((acc, item) => acc + Number(item.casos || item.cantidad || 0), 0);
    const data = estados.map((item) => ({
      estado: palabras(item.estado),
      casos: Number(item.casos || item.cantidad || 0),
    }));

    return { totalCasos: total, resumen: data };
  }, [estados]);

  if (!resumen.length) {
    return null;
  }

  return (
    <Card>
      <Title>📍 Casos por estado</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Total de casos: {totalCasos.toLocaleString("es-CL")}
      </Text>
      <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
        {resumen.map((item) => (
          <Flex
            key={item.estado}
            justifyContent="between"
            alignItems="start"
            className="rounded border border-slate-100 dark:border-slate-700 p-3"
          >
            <div>
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                {item.estado}
              </Text>
              <Metric className="mt-1">{item.casos.toLocaleString("es-CL")}</Metric>
            </div>
            <Text className="text-xs text-gray-400">
              {totalCasos > 0 ? ((item.casos / totalCasos) * 100).toFixed(1) : 0}%
            </Text>
          </Flex>
        ))}
      </Grid>
    </Card>
  );
};

export default ResumenCasosOperativos;
