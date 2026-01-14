"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Card,
  Title,
  Text,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const MAX_CHART_ITEMS = 8;

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const DistribucionMotivoOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    const fetchMotivos = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get("/mora-dashboard/operativo/distribucion-motivo", {
          params,
        });
        setMotivos(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando distribución por motivo:", error);
        setMotivos([]);
      }
    };

    fetchMotivos();
  }, [empresaRut, entidadId, dateRange]);

  const { chartData, tableData, totalCasos, totalMonto } = useMemo(() => {
    if (!Array.isArray(motivos) || motivos.length === 0) {
      return { chartData: [], tableData: [], totalCasos: 0, totalMonto: 0 };
    }

    const ordenados = [...motivos].sort((a, b) => Number(b.casos || 0) - Number(a.casos || 0));
    const totalCasosCalc = ordenados.reduce((acc, item) => acc + Number(item.casos || 0), 0);
    const totalMontoCalc = ordenados.reduce((acc, item) => acc + Number(item.monto || 0), 0);

    const topItems = ordenados.slice(0, MAX_CHART_ITEMS);
    const rest = ordenados.slice(MAX_CHART_ITEMS);
    const otrosCasos = rest.reduce((acc, item) => acc + Number(item.casos || 0), 0);

    const chartItems = [...topItems];
    if (otrosCasos > 0) {
      chartItems.push({ motivo: "Otros motivos", casos: otrosCasos, monto: 0 });
    }

    const chart = chartItems.map((item) => ({
      motivo: item.motivo || "Sin motivo",
      Casos: Number(item.casos || 0),
    }));

    return {
      chartData: chart,
      tableData: ordenados,
      totalCasos: totalCasosCalc,
      totalMonto: totalMontoCalc,
    };
  }, [motivos]);

  if (!chartData.length) {
    return null;
  }

  return (
    <Card>
      <Title>🧩 Clasificación de casos por motivo</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Casos totales: {totalCasos.toLocaleString("es-CL")}. Monto asociado:{" "}
        {formatCLP(totalMonto)}.
      </Text>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[640px]">
          <BarChart
            data={chartData}
            index="motivo"
            categories={["Casos"]}
            colors={["indigo"]}
            valueFormatter={(value) => Number(value || 0).toLocaleString("es-CL")}
            showLegend={false}
            yAxisWidth={64}
            rotateLabelX={{ angle: 0, verticalShift: 12, xAxisHeight: 120 }}
          />
        </div>
      </div>

      <Table className="text-sm mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Motivo</TableHeaderCell>
            <TableHeaderCell className="text-right">Casos</TableHeaderCell>
            <TableHeaderCell className="text-right">Monto</TableHeaderCell>
            <TableHeaderCell className="text-right">Porcentaje</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((item) => {
            const casos = Number(item.casos || 0);
            const monto = Number(item.monto || 0);
            const porcentaje = totalCasos ? (casos / totalCasos) * 100 : 0;
            return (
              <TableRow key={item.motivo || "sin-motivo"}>
                <TableCell className="font-medium">
                  {item.motivo || "Sin motivo"}
                </TableCell>
                <TableCell className="text-right">
                  {casos.toLocaleString("es-CL")}
                </TableCell>
                <TableCell className="text-right">{formatCLP(monto)}</TableCell>
                <TableCell className="text-right">{porcentaje.toFixed(1)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default DistribucionMotivoOperativo;
