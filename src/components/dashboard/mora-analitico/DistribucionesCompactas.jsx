"use client";

import { useEffect, useState } from "react";
import { Card, Title, Text, DonutChart, Grid } from "@tremor/react";
import apiService from "@/app/api/apiService";
import {
  normalizarEstadoPrevired,
  COLOR_MAP_ESTADO_PREVIRED,
} from "@/utils/estadoPrevired.utils";

const coloresRecuperado = {
  Regularizado: "indigo",
  Pagado: "emerald",
};

const DistribucionesCompactas = ({ empresaRut }) => {
  const [estadoDeuda, setEstadoDeuda] = useState([]);
  const [recuperadoTipo, setRecuperadoTipo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPrevired, resResumen] = await Promise.all([
          apiService.get(`/mora-dashboard/${empresaRut}/estado-previred`),
          apiService.get(`/mora-dashboard/${empresaRut}/resumen-financiero`)
        ]);

        setEstadoDeuda(resPrevired.data.data || []);

        const resumen = resResumen.data.data;
        setRecuperadoTipo([
          { name: "Regularizado", value: resumen.totalRegularizado || 0 },
          { name: "Pagado", value: resumen.totalPago || 0 },
        ]);
      } catch (err) {
        console.error("❌ Error cargando distribuciones:", err);
      }
    };

    if (empresaRut) fetchData();
  }, [empresaRut]);

  const totalDeuda = estadoDeuda.reduce((sum, d) => sum + d.monto, 0);
  const totalRecuperado = recuperadoTipo?.reduce((sum, d) => sum + d.value, 0) || 0;

  const formatter = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  if (!estadoDeuda.length && !recuperadoTipo) return null;

  const estadoDeudaNormalizada = estadoDeuda.map((e) => ({
    name: normalizarEstadoPrevired(e.estado),
    value: e.monto,
  }));

  return (
    <Card>
      <Title>🎯 Distribuciones Clave</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Compara cómo se distribuye la deuda por gravedad y cómo se ha recuperado.
      </Text>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <div>
          <Text className="text-sm font-medium text-slate-600 mb-2">Distribución por Estado de Deuda</Text>
          <DonutChart
            data={estadoDeudaNormalizada}
            category="value"
            index="name"
            colors={estadoDeudaNormalizada.map(
              (d) => COLOR_MAP_ESTADO_PREVIRED[d.name] || "slate"
            )}
            valueFormatter={formatter}
            showLegend
          />
          <Text className="mt-2 text-xs text-gray-500">
            Total deuda: {formatter(totalDeuda)}
          </Text>
        </div>

        <div>
          <Text className="text-sm font-medium text-slate-600 mb-2">Distribución del Recuperado por Tipo</Text>
          <DonutChart
            data={recuperadoTipo}
            category="value"
            index="name"
            colors={recuperadoTipo.map((e) => coloresRecuperado[e.name] || "slate")}
            valueFormatter={formatter}
            showLegend
          />
          <Text className="mt-2 text-xs text-gray-500">
            Total recuperado: {formatter(totalRecuperado)}
          </Text>
        </div>
      </Grid>
    </Card>
  );
};

export default DistribucionesCompactas;
