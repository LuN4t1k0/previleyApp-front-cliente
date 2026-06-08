"use client";

import { useEffect, useState } from "react";
import { BarChart } from "@tremor/react";
import { RiFundsLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import { SectionCard, SectionHeader } from "../mora-operativo/MoraOperativoUI";

const DistribucionRecuperadoTipo = ({ empresaRut }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await apiService.get(
          `/mora-dashboard/${empresaRut}/resumen-financiero`
        );

        const resumen = res.data.data;

        setData({
          Regularizado: resumen.totalRegularizado || 0,
          Pagado: resumen.totalPagado ?? resumen.totalPago ?? 0,
        });
      } catch (error) {
        console.error("❌ Error cargando distribución tipo recuperación:", error);
      }
    };

    if (empresaRut) fetchResumen();
  }, [empresaRut]);

  if (!data) return null;

  const chartData = [
    {
      tipo: "Regularizado vs Pagado",
      Regularizado: data.Regularizado,
      Pagado: data.Pagado,
    },
  ];
  const total = data.Regularizado + data.Pagado;

  const formatter = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <SectionCard>
      <SectionHeader
        title="Regularizado por tipo"
        description="Visualiza si la regularización proviene de regularizaciones o pagos."
        badge={formatter(total)}
        icon={RiFundsLine}
      />

      <div className="border-t border-indigo-100 px-5 py-5">
        <BarChart
          data={chartData}
          index="tipo"
          categories={["Regularizado", "Pagado"]}
          colors={["indigo", "emerald"]}
          valueFormatter={formatter}
          showLegend
        />
      </div>
    </SectionCard>
  );
};

export default DistribucionRecuperadoTipo;
