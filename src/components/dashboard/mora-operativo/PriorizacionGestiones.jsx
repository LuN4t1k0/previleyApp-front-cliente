"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  BadgeDelta,
} from "@tremor/react";
import { RiArrowRightSLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const riesgoBadge = {
  alto: <BadgeDelta deltaType="decrease">Alto</BadgeDelta>,
  medio: <BadgeDelta deltaType="unchanged">Medio</BadgeDelta>,
  bajo: <BadgeDelta deltaType="increase">Bajo</BadgeDelta>,
};

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
    <Card>
      <Title>📋 Gestiones priorizadas</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Ranking dinámico según deuda pendiente, riesgo judicial y casos críticos.
      </Text>

      <Table className="text-xs sm:text-sm">
        <TableHead>
          <TableRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>Gestión</TableHeaderCell>
            <TableHeaderCell>Entidad</TableHeaderCell>
            <TableHeaderCell className="text-right">Deuda pendiente</TableHeaderCell>
            <TableHeaderCell className="text-right">Casos judiciales</TableHeaderCell>
            <TableHeaderCell className="text-right">Casos no judiciales</TableHeaderCell>
            <TableHeaderCell className="text-right">Prioridad</TableHeaderCell>
            <TableHeaderCell className="text-right">Acción</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.map((fila) => (
            <TableRow key={fila.gestionMoraId}>
              <TableCell className="font-semibold">{fila.prioridadRanking}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{fila.folio || `Gestión #${fila.gestionMoraId}`}</span>
                  <span className="text-xs text-gray-500">{fila.estadoGestion?.toUpperCase()}</span>
                </div>
              </TableCell>
              <TableCell>{fila.entidadNombre}</TableCell>
              <TableCell className="text-right">{formatCLP(fila.deudaPendiente)}</TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span>{fila.casosJudiciales}</span>
                  <span className="text-[11px] text-gray-400">{formatCLP(fila.montoJudicial)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span>{fila.casosNoJudiciales}</span>
                  <span className="text-[11px] text-gray-400">{formatCLP(fila.montoNoJudicial)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {riesgoBadge[fila.nivelRiesgo] || <BadgeDelta deltaType="unchanged">-</BadgeDelta>}
              </TableCell>
              <TableCell className="text-right">
                {typeof onSelectGestion === "function" ? (
                  <button
                    type="button"
                    onClick={() => onSelectGestion(fila)}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500"
                  >
                    Ver gestión
                    <RiArrowRightSLine className="size-4" />
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Prioridad {fila.prioridadRanking}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default PriorizacionGestiones;
