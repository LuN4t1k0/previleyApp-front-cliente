"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import { RiAlertLine, RiArrowRightSLine, RiScalesLine } from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";

const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0,
});

const formatCLP = (value) => currencyFormatter.format(Number(value || 0));
const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const PendienteOperativoDetalle = ({ empresaRut, entidadId, dateRange, onSelectEntidad }) => {
  const [metrics, setMetrics] = useState(null);
  const [gestiones, setGestiones] = useState([]);

  useEffect(() => {
    const fetchDetalle = async () => {
      if (!empresaRut) return;

      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const [indicadoresRes, gestionesRes] = await Promise.all([
          apiService.get("/mora-dashboard/operativo/indicadores", { params }),
          apiService.get("/mora-dashboard/operativo/priorizacion-gestiones", { params }),
        ]);

        setMetrics(indicadoresRes.data?.data || null);
        setGestiones(gestionesRes.data?.data || []);
      } catch (error) {
        console.error("Error cargando detalle pendiente operativo:", error);
        setMetrics(null);
        setGestiones([]);
      }
    };

    fetchDetalle();
  }, [empresaRut, entidadId, dateRange]);

  const detalle = useMemo(() => {
    const judicialMetric = metrics?.estadoPrevired?.judicial || {};
    const noJudicialMetric = metrics?.estadoPrevired?.noJudicial || {};

    const entidadesMap = new Map();
    let judicialCasosAgregado = 0;
    let judicialMontoAgregado = 0;
    let noJudicialCasosAgregado = 0;
    let noJudicialMontoAgregado = 0;

    gestiones.forEach((gestion) => {
      const casosJudiciales = Number(gestion?.casosJudiciales || 0);
      const montoJudicial = Number(gestion?.montoJudicial || 0);
      const casosNoJudiciales = Number(gestion?.casosNoJudiciales || 0);
      const montoNoJudicial = Number(gestion?.montoNoJudicial || 0);

      judicialCasosAgregado += casosJudiciales;
      judicialMontoAgregado += montoJudicial;
      noJudicialCasosAgregado += casosNoJudiciales;
      noJudicialMontoAgregado += montoNoJudicial;

      if (!casosJudiciales && !montoJudicial) return;

      const key = String(gestion?.entidadId || gestion?.entidadNombre || "sin-entidad");
      const current = entidadesMap.get(key) || {
        entidadId: gestion?.entidadId,
        entidadNombre: gestion?.entidadNombre || "Entidad sin nombre",
        casosJudiciales: 0,
        montoJudicial: 0,
        deudaPendiente: 0,
        gestiones: 0,
      };

      current.casosJudiciales += casosJudiciales;
      current.montoJudicial += montoJudicial;
      current.deudaPendiente += Number(gestion?.deudaPendiente || 0);
      current.gestiones += 1;
      entidadesMap.set(key, current);
    });

    const entidadesJudiciales = Array.from(entidadesMap.values()).sort((a, b) => {
      if (b.casosJudiciales !== a.casosJudiciales) {
        return b.casosJudiciales - a.casosJudiciales;
      }
      return b.montoJudicial - a.montoJudicial;
    });

    return {
      totalPendiente: Number(metrics?.totalPendiente || 0),
      judicial: {
        casos: Number(judicialMetric.casos ?? judicialCasosAgregado),
        monto: Number(judicialMetric.monto ?? judicialMontoAgregado),
      },
      noJudicial: {
        casos: Number(noJudicialMetric.casos ?? noJudicialCasosAgregado),
        monto: Number(noJudicialMetric.monto ?? noJudicialMontoAgregado),
      },
      entidadesJudiciales,
    };
  }, [metrics, gestiones]);

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
              <RiAlertLine className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div>
              <Title className="text-slate-950">Pendiente en gestión</Title>
              <Text className="text-sm text-slate-500">
                Doble click del saldo pendiente: composición judicial, no judicial y entidades.
              </Text>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-amber-700">Saldo pendiente</p>
          <p className="mt-2 text-4xl font-semibold leading-none text-amber-950 md:text-5xl">
            {formatCLP(detalle.totalPendiente)}
          </p>
          <p className="mt-3 text-sm font-medium text-amber-800">
            Monto aún abierto para gestión y priorización.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-red-700">Judicial</p>
              <p className="mt-2 text-xl font-semibold text-red-950">
                {formatCLP(detalle.judicial.monto)}
              </p>
            </div>
            <Badge color="red" icon={RiScalesLine}>
              {formatNumber(detalle.judicial.casos)} casos
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-600">No judicial</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {formatCLP(detalle.noJudicial.monto)}
              </p>
            </div>
            <Badge color="slate">{formatNumber(detalle.noJudicial.casos)} casos</Badge>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Entidades con casos judiciales
            </h3>
            <p className="text-xs text-slate-500">
              Priorizadas por cantidad de casos judiciales y monto judicial asociado.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {formatNumber(detalle.entidadesJudiciales.length)} entidades
          </span>
        </div>

        {detalle.entidadesJudiciales.length ? (
          <Table className="text-sm">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Entidad</TableHeaderCell>
                <TableHeaderCell className="text-right">Casos judiciales</TableHeaderCell>
                <TableHeaderCell className="text-right">Monto judicial</TableHeaderCell>
                <TableHeaderCell className="text-right">Pendiente total</TableHeaderCell>
                <TableHeaderCell className="text-right">Acción</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalle.entidadesJudiciales.map((entidad) => (
                <TableRow key={`${entidad.entidadId || entidad.entidadNombre}`}>
                  <TableCell className="font-medium text-slate-800">
                    {entidad.entidadNombre}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(entidad.casosJudiciales)}
                  </TableCell>
                  <TableCell className="text-right">{formatCLP(entidad.montoJudicial)}</TableCell>
                  <TableCell className="text-right">{formatCLP(entidad.deudaPendiente)}</TableCell>
                  <TableCell className="text-right">
                    {typeof onSelectEntidad === "function" && entidad.entidadId ? (
                      <button
                        type="button"
                        onClick={() => onSelectEntidad(entidad.entidadId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950"
                      >
                        Focalizar
                        <RiArrowRightSLine className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Sin acción</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            No hay entidades con casos judiciales para los filtros actuales.
          </div>
        )}
      </div>
    </div>
  );
};

export default PendienteOperativoDetalle;
