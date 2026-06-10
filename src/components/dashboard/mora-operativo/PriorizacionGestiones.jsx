"use client";

import { useEffect, useMemo, useState } from "react";
import { RiFileList3Line } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { ActionButton, RiskPill, SectionCard, SectionHeader } from "./MoraOperativoUI";

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const riesgoOrden = {
  alto: 0,
  medio: 1,
  bajo: 2,
};

const PriorizacionGestiones = ({ empresaRut, entidadId, dateRange, onSelectGestion }) => {
  const [gestiones, setGestiones] = useState([]);

  useEffect(() => {
    const fetchGestiones = async () => {
      if (!empresaRut) return;
      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const res = await apiService.get(`/mora-dashboard/operativo/priorizacion-gestiones`, {
          params,
        });
        setGestiones(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando priorización de gestiones:", error);
        setGestiones([]);
      }
    };

    fetchGestiones();
  }, [empresaRut, entidadId, dateRange]);

  const filas = useMemo(() => {
    if (!Array.isArray(gestiones)) return [];
    return [...gestiones].sort((a, b) => {
      const riesgoA = riesgoOrden[a?.nivelRiesgo] ?? 3;
      const riesgoB = riesgoOrden[b?.nivelRiesgo] ?? 3;
      if (riesgoA !== riesgoB) return riesgoA - riesgoB;

      if (riesgoA === riesgoOrden.medio) {
        const deudaA = Number(a?.deudaPendiente || 0);
        const deudaB = Number(b?.deudaPendiente || 0);
        if (deudaA !== deudaB) return deudaB - deudaA;
      }

      const rankingA = Number(a?.prioridadRanking || 0);
      const rankingB = Number(b?.prioridadRanking || 0);
      return rankingA - rankingB;
    });
  }, [gestiones]);

  if (!filas.length) {
    return null;
  }

  return (
    <SectionCard>
      <SectionHeader
        title="Gestiones priorizadas"
        description="Ranking dinámico según deuda pendiente, riesgo judicial, pre judicial y casos críticos."
        badge={`${filas.length} gestiones`}
        icon={RiFileList3Line}
      />

      <div className="overflow-x-auto border-t border-indigo-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 font-semibold text-stone-700">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Gestión</th>
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4 text-right">Deuda pendiente</th>
              <th className="px-6 py-4 text-right">Judicial</th>
              <th className="px-6 py-4 text-right">Pre judicial</th>
              <th className="px-6 py-4 text-right">No judicial</th>
              <th className="px-6 py-4 text-right">Prioridad</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100">
            {filas.map((fila) => (
              <tr key={fila.gestionMoraId} className="bg-white hover:bg-slate-50">
                <td className="px-6 py-5 font-semibold text-slate-950">{fila.prioridadRanking}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-950">
                      {fila.folio || `Gestión #${fila.gestionMoraId}`}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-400">
                      {fila.estadoGestion}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 font-semibold text-slate-800">{fila.entidadNombre}</td>
                <td className="px-6 py-5 text-right font-semibold text-indigo-800">
                  {formatCLP(fila.deudaPendiente)}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-red-950">{fila.casosJudiciales}</span>
                    <span className="text-xs text-red-700">{formatCLP(fila.montoJudicial)}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-orange-950">{fila.casosPreJudiciales || 0}</span>
                    <span className="text-xs text-orange-700">{formatCLP(fila.montoPreJudicial)}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-slate-950">{fila.casosNoJudiciales}</span>
                    <span className="text-xs text-slate-500">{formatCLP(fila.montoNoJudicial)}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <RiskPill level={fila.nivelRiesgo} />
                </td>
                <td className="px-6 py-5 text-right">
                  {typeof onSelectGestion === "function" ? (
                    <ActionButton onClick={() => onSelectGestion(fila)}>Ver gestión</ActionButton>
                  ) : (
                    <span className="text-xs text-slate-400">Prioridad {fila.prioridadRanking}</span>
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

export default PriorizacionGestiones;
