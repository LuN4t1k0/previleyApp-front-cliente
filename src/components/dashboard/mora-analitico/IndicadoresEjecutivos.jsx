import { Card, Flex, Metric, Text, Grid } from "@tremor/react";
import { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowRightLine,
} from "@remixicon/react";

const IndicadoresEjecutivos = ({ empresaRut }) => {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    const fetchComparativo = async () => {
      try {
        const res = await apiService.get(`/mora-dashboard/${empresaRut}/resumen-financiero-comparado`);
        setDatos(res.data.data);
      } catch (error) {
        console.error("❌ Error cargando indicadores:", error);
      }
    };
    if (empresaRut) fetchComparativo();
  }, [empresaRut]);

  if (!datos) return null;

  const { actual, anterior } = datos;

  const calcVariacion = (actual, anterior) => {
    if (anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
  };

  const variacionRecuperado = calcVariacion(actual.totalRecuperado, anterior.totalRecuperado);
  const variacionPendiente = calcVariacion(actual.totalPendiente, anterior.totalPendiente);

  const getTendenciaBadge = (valor) => {
    const isUp = valor > 0;
    const isDown = valor < 0;
    const isNeutral = valor === 0;

    const color = isUp
      ? "emerald"
      : isDown
      ? "red"
      : "gray";

    const bg = {
      emerald: "bg-emerald-100 dark:bg-emerald-400/20",
      red: "bg-red-100 dark:bg-red-400/20",
      gray: "bg-gray-200/50 dark:bg-gray-500/30",
    }[color];

    const text = {
      emerald: "text-emerald-800 dark:text-emerald-500",
      red: "text-red-800 dark:text-red-500",
      gray: "text-gray-700 dark:text-gray-300",
    }[color];

    const Icon = isUp ? RiArrowUpLine : isDown ? RiArrowDownLine : RiArrowRightLine;
    const label = `${Math.abs(valor).toFixed(1)}%`;

    return (
      <span
        className={`inline-flex items-center gap-x-1 rounded-tremor-small px-2 py-1 text-tremor-label font-semibold ${bg} ${text}`}
      >
        <Icon className="-ml-0.5 size-4" aria-hidden />
        {label}
      </span>
    );
  };

  return (
    <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
      <Card>
        <Text className="text-sm text-gray-500">💰 Deuda Total</Text>
        <Metric>${actual.totalDeuda.toLocaleString()}</Metric>
      </Card>

      <Card>
        <Flex justifyContent="between">
          <Text className="text-sm text-gray-500">✅ Recuperado</Text>
          {getTendenciaBadge(variacionRecuperado)}
        </Flex>
        <Metric>${actual.totalRecuperado.toLocaleString()}</Metric>
      </Card>

      <Card>
        <Flex justifyContent="between">
          <Text className="text-sm text-gray-500">🔁 Pendiente</Text>
          {getTendenciaBadge(variacionPendiente)}
        </Flex>
        <Metric>${actual.totalPendiente.toLocaleString()}</Metric>
      </Card>

      <Card>
        <Text className="text-sm text-gray-500">📈 % Recuperación</Text>
        <Metric>
          {actual.totalDeuda > 0
            ? ((actual.totalRecuperado / actual.totalDeuda) * 100).toFixed(2)
            : 0}
          %
        </Metric>
      </Card>
    </Grid>
  );
};

export default IndicadoresEjecutivos;
