"use client";

import { useEffect, useMemo, useState } from "react";
import { RiFocus3Line } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { ActionButton, RiskPill, SectionCard, SectionHeader } from "./MoraOperativoUI";

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const PriorizacionEntidades = ({ empresaRut, entidadId, dateRange, onSelectEntidad }) => {
  const [priorizacion, setPriorizacion] = useState([]);

  useEffect(() => {
    const fetchPriorizacion = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/priorizacion`, {
          params,
        });
        setPriorizacion(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando priorización de entidades:", error);
        setPriorizacion([]);
      }
    };

    fetchPriorizacion();
  }, [empresaRut, entidadId, dateRange]);

  const filas = useMemo(() => {
    if (!Array.isArray(priorizacion)) return [];
    return [...priorizacion].sort((a, b) => {
      const casosA = Number(a?.casosJudiciales || 0);
      const casosB = Number(b?.casosJudiciales || 0);
      const tieneJudicialA = casosA > 0 ? 1 : 0;
      const tieneJudicialB = casosB > 0 ? 1 : 0;

      if (tieneJudicialA !== tieneJudicialB) {
        return tieneJudicialB - tieneJudicialA;
      }
      if (casosA !== casosB) {
        return casosB - casosA;
      }

      const pendienteA = Number(a?.deudaPendiente || 0);
      const pendienteB = Number(b?.deudaPendiente || 0);
      return pendienteB - pendienteA;
    });
  }, [priorizacion]);

  if (!filas.length) {
    return null;
  }

  return (
    <SectionCard>
      <SectionHeader
        title="Priorización de entidades"
        description="Ordena la gestión iniciando por las entidades con casos judiciales y deuda pendiente."
        badge={`${filas.length} entidades`}
        icon={RiFocus3Line}
      />

      <div className="overflow-x-auto border-t border-indigo-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 font-bold text-stone-700">
            <tr>
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4 text-right">Deuda total</th>
              <th className="px-6 py-4 text-right">Pendiente</th>
              <th className="px-6 py-4 text-right">Regularizado</th>
              <th className="px-6 py-4 text-right">Riesgo</th>
              <th className="px-6 py-4 text-right">Casos judiciales</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100">
            {filas.map((item) => (
              <tr key={`${item.empresaRut}-${item.entidadId}`} className="bg-white hover:bg-slate-50">
                <td className="px-6 py-5 font-bold text-slate-950">{item.entidadNombre}</td>
                <td className="px-6 py-5 text-right font-semibold text-slate-800">
                  {formatCLP(item.totalDeuda)}
                </td>
                <td className="px-6 py-5 text-right font-bold text-indigo-800">
                  {formatCLP(item.deudaPendiente)}
                </td>
                <td className="px-6 py-5 text-right text-slate-700">
                  {formatCLP(item.deudaResuelta)}
                </td>
                <td className="px-6 py-5 text-right">
                  <RiskPill level={item.nivelRiesgo} />
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-flex min-w-10 justify-center rounded-full bg-red-100 px-3 py-1 font-bold text-red-950">
                    {(item.casosJudiciales || 0).toLocaleString("es-CL")}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  {typeof onSelectEntidad === "function" ? (
                    <ActionButton onClick={() => onSelectEntidad(item.entidadId)} />
                  ) : (
                    <span className="text-xs text-slate-400">Prioridad {item.prioridad}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};

export default PriorizacionEntidades;
