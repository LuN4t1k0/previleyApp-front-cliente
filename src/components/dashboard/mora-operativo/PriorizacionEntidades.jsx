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

const nivelRiesgoConfig = {
  alto: {
    label: "Alto",
    badge: <BadgeDelta deltaType="moderateDecrease">Alto</BadgeDelta>,
  },
  medio: {
    label: "Medio",
    badge: <BadgeDelta deltaType="unchanged">Medio</BadgeDelta>,
  },
  bajo: {
    label: "Bajo",
    badge: <BadgeDelta deltaType="increase">Bajo</BadgeDelta>,
  },
};

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
    return [...priorizacion].sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));
  }, [priorizacion]);

  if (!filas.length) {
    return null;
  }

  return (
    <Card>
      <Title>🎯 Priorización de entidades</Title>
      <Text className="text-sm text-gray-500 mb-4">
        Ordena la gestión iniciando por las entidades con mayor riesgo y deuda pendiente.
      </Text>

      <Table className="text-sm">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Entidad</TableHeaderCell>
            <TableHeaderCell className="text-right">Deuda total</TableHeaderCell>
            <TableHeaderCell className="text-right">Pendiente</TableHeaderCell>
            <TableHeaderCell className="text-right">Recuperado</TableHeaderCell>
            <TableHeaderCell className="text-right">Riesgo</TableHeaderCell>
            <TableHeaderCell className="text-right">Casos riesgo</TableHeaderCell>
            <TableHeaderCell className="text-right">Acción</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.map((item) => {
            const riesgo = nivelRiesgoConfig[item.nivelRiesgo] || nivelRiesgoConfig.bajo;
            return (
              <TableRow key={`${item.empresaRut}-${item.entidadId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <TableCell className="font-medium">{item.entidadNombre}</TableCell>
                <TableCell className="text-right">{formatCLP(item.totalDeuda)}</TableCell>
                <TableCell className="text-right">{formatCLP(item.deudaPendiente)}</TableCell>
                <TableCell className="text-right">{formatCLP(item.deudaResuelta)}</TableCell>
                <TableCell className="text-right">{riesgo.badge}</TableCell>
                <TableCell className="text-right">{item.casosRiesgo?.toLocaleString("es-CL")}</TableCell>
                <TableCell className="text-right">
                  {typeof onSelectEntidad === "function" ? (
                    <button
                      type="button"
                      onClick={() => onSelectEntidad(item.entidadId)}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500"
                    >
                      Focalizar
                      <RiArrowRightSLine className="size-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Prioridad {item.prioridad}</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default PriorizacionEntidades;
