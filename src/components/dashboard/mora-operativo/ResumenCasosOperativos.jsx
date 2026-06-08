"use client";

import { useEffect, useMemo, useState } from "react";
import { RiListCheck3 } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { SectionCard, SectionHeader } from "./MoraOperativoUI";

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
    <SectionCard>
      <SectionHeader
        title="Casos por estado"
        description={`Total de casos: ${totalCasos.toLocaleString("es-CL")}.`}
        badge={`${resumen.length} estados`}
        icon={RiListCheck3}
      />

      <div className="grid gap-4 border-t border-indigo-100 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <article
            key={item.estado}
            className="rounded-lg border border-indigo-100 bg-indigo-50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase text-stone-600">{item.estado}</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                {totalCasos > 0 ? ((item.casos / totalCasos) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {item.casos.toLocaleString("es-CL")}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
};

export default ResumenCasosOperativos;
