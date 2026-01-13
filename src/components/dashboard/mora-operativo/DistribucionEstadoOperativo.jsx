"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Title,
  Text,
  DonutChart,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  return estado
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const DistribucionEstadoOperativo = ({ empresaRut, entidadId, dateRange }) => {
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
        console.error("❌ Error cargando distribución por estado:", error);
        setEstados([]);
      }
    };

    fetchDistribucion();
  }, [empresaRut, entidadId, dateRange]);

  const { chartData, totalMonto, totalCasos } = useMemo(() => {
    if (!Array.isArray(estados) || estados.length === 0) {
      return { chartData: [], totalMonto: 0, totalCasos: 0 };
    }

    const ordenados = [...estados].sort((a, b) => (b.monto || 0) - (a.monto || 0));
    const totalMontoCalc = ordenados.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const totalCasosCalc = ordenados.reduce((acc, item) => acc + Number(item.casos || item.cantidad || 0), 0);

    const data = ordenados.map((item) => ({
      name: formatEstado(item.estado),
      value: Number(item.monto || 0),
    }));

    return {
      chartData: data,
      totalMonto: totalMontoCalc,
      totalCasos: totalCasosCalc,
    };
  }, [estados]);

  if (!chartData.length) {
    return null;
  }

  return (
    <Card>
      <Title>📌 Distribución de deuda por estado operativo</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Casos totales: {totalCasos.toLocaleString("es-CL")}. Monto pendiente: {formatCLP(totalMonto)}.
      </Text>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          valueFormatter={(valor) => formatCLP(valor)}
          colors={["emerald", "amber", "violet", "slate", "indigo", "cyan", "emerald"]}
          showLegend
        />

        <Table className="text-sm">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell className="text-right">Casos</TableHeaderCell>
              <TableHeaderCell className="text-right">Monto</TableHeaderCell>
              <TableHeaderCell className="text-right">Porcentaje</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estados.map((item) => {
              const casos = Number(item.casos || item.cantidad || 0);
              const monto = Number(item.monto || 0);
              const porcentaje = totalMonto > 0 ? (monto / totalMonto) * 100 : 0;

              return (
                <TableRow key={item.estado}>
                  <TableCell className="font-medium">{formatEstado(item.estado)}</TableCell>
                  <TableCell className="text-right">{casos.toLocaleString("es-CL")}</TableCell>
                  <TableCell className="text-right">{formatCLP(monto)}</TableCell>
                  <TableCell className="text-right">{porcentaje.toFixed(1)}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Grid>
    </Card>
  );
};

export default DistribucionEstadoOperativo;
