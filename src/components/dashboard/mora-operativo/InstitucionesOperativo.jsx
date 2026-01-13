"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Title, Text, BarChart } from "@tremor/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const formatter = (number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(number || 0);

const InstitucionesOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [priorizacion, setPriorizacion] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/priorizacion`, {
          params,
        });
        setPriorizacion(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando deuda por institución:", error);
        setPriorizacion([]);
      }
    };

    fetchData();
  }, [empresaRut, entidadId, dateRange]);

  const dataChart = useMemo(() => {
    if (!Array.isArray(priorizacion) || priorizacion.length === 0) return [];
    return priorizacion
      .map((item) => ({
        entidad: item.entidadNombre,
        "Deuda total": Number(item.totalDeuda || 0),
        "Pendiente": Number(item.deudaPendiente || 0),
        "Regularizado": Number(item.deudaResuelta || 0),
      }))
      .sort((a, b) => b["Deuda total"] - a["Deuda total"])
      .slice(0, 15);
  }, [priorizacion]);

  if (!dataChart.length) {
    return null;
  }

  const chartMinWidth = Math.max(640, dataChart.length * 80);

  return (
    <Card>
      <Title>🏦 Consolidado por entidad</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Compara la deuda total identificada, lo recuperado y el saldo pendiente por entidad.
      </Text>
      <div className="mt-4 overflow-x-auto">
        <div className="pr-4" style={{ minWidth: chartMinWidth }}>
          <BarChart
            data={dataChart}
            index="entidad"
            categories={["Deuda total", "Pendiente", "Regularizado"]}
            colors={["rose", "amber", "emerald"]}
            showLegend
            tickGap={0}
            rotateLabelX={{ angle: 0, verticalShift: 12, xAxisHeight: 80 }}
            valueFormatter={formatter}
            yAxisWidth={90}
          />
        </div>
      </div>
    </Card>
  );
};

export default InstitucionesOperativo;
