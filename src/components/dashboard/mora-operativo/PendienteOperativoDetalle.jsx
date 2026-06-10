"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiAlertLine,
  RiArrowRightSLine,
  RiFileList3Line,
  RiFilter3Line,
  RiInformationLine,
  RiScalesLine,
  RiWallet3Line,
} from "@remixicon/react";
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
const getInitial = (value) => String(value || "?").trim().charAt(0).toUpperCase();

const PendienteOperativoDetalle = ({ empresaRut, entidadId, dateRange, onSelectEntidad }) => {
  const [data, setData] = useState({
    metrics: null,
    gestiones: [],
    lastUpdated: null,
  });

  useEffect(() => {
    const fetchDetalle = async () => {
      if (!empresaRut) return;

      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const [indicadoresRes, gestionesRes] = await Promise.all([
          apiService.get("/mora-dashboard/operativo/indicadores", { params }),
          apiService.get("/mora-dashboard/operativo/priorizacion-gestiones", { params }),
        ]);

        setData({
          metrics: indicadoresRes.data?.data || null,
          gestiones: gestionesRes.data?.data || [],
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error("Error cargando detalle pendiente operativo:", error);
        setData({
          metrics: null,
          gestiones: [],
          lastUpdated: null,
        });
      }
    };

    fetchDetalle();
  }, [empresaRut, entidadId, dateRange]);

  const detalle = useMemo(() => {
    const judicialMetric = data.metrics?.estadoPrevired?.judicial || {};
    const preJudicialMetric = data.metrics?.estadoPrevired?.preJudicial || {};
    const noJudicialMetric = data.metrics?.estadoPrevired?.noJudicial || {};

    const entidadesMap = new Map();
    let judicialCasosAgregado = 0;
    let judicialMontoAgregado = 0;
    let preJudicialCasosAgregado = 0;
    let preJudicialMontoAgregado = 0;
    let noJudicialCasosAgregado = 0;
    let noJudicialMontoAgregado = 0;

    data.gestiones.forEach((gestion) => {
      const casosJudiciales = Number(gestion?.casosJudiciales || 0);
      const montoJudicial = Number(gestion?.montoJudicial || 0);
      const casosPreJudiciales = Number(gestion?.casosPreJudiciales || 0);
      const montoPreJudicial = Number(gestion?.montoPreJudicial || 0);
      const casosNoJudiciales = Number(gestion?.casosNoJudiciales || 0);
      const montoNoJudicial = Number(gestion?.montoNoJudicial || 0);

      judicialCasosAgregado += casosJudiciales;
      judicialMontoAgregado += montoJudicial;
      preJudicialCasosAgregado += casosPreJudiciales;
      preJudicialMontoAgregado += montoPreJudicial;
      noJudicialCasosAgregado += casosNoJudiciales;
      noJudicialMontoAgregado += montoNoJudicial;

      if (!casosJudiciales && !montoJudicial && !casosPreJudiciales && !montoPreJudicial) return;

      const key = String(gestion?.entidadId || gestion?.entidadNombre || "sin-entidad");
      const current = entidadesMap.get(key) || {
        entidadId: gestion?.entidadId,
        entidadNombre: gestion?.entidadNombre || "Entidad sin nombre",
        casosJudiciales: 0,
        montoJudicial: 0,
        casosPreJudiciales: 0,
        montoPreJudicial: 0,
        deudaPendiente: 0,
        gestiones: 0,
      };

      current.casosJudiciales += casosJudiciales;
      current.montoJudicial += montoJudicial;
      current.casosPreJudiciales += casosPreJudiciales;
      current.montoPreJudicial += montoPreJudicial;
      current.deudaPendiente += Number(gestion?.deudaPendiente || 0);
      current.gestiones += 1;
      entidadesMap.set(key, current);
    });

    const entidadesJudiciales = Array.from(entidadesMap.values()).sort((a, b) => {
      if (b.casosJudiciales !== a.casosJudiciales) {
        return b.casosJudiciales - a.casosJudiciales;
      }
      if (b.casosPreJudiciales !== a.casosPreJudiciales) {
        return b.casosPreJudiciales - a.casosPreJudiciales;
      }
      return b.montoJudicial - a.montoJudicial;
    });

    return {
      totalPendiente: Number(data.metrics?.totalPendiente || 0),
      judicial: {
        casos: Number(judicialMetric.casos ?? judicialCasosAgregado),
        monto: Number(judicialMetric.monto ?? judicialMontoAgregado),
      },
      preJudicial: {
        casos: Number(preJudicialMetric.casos ?? preJudicialCasosAgregado),
        monto: Number(preJudicialMetric.monto ?? preJudicialMontoAgregado),
      },
      noJudicial: {
        casos: Number(noJudicialMetric.casos ?? noJudicialCasosAgregado),
        monto: Number(noJudicialMetric.monto ?? noJudicialMontoAgregado),
      },
      entidadesJudiciales,
    };
  }, [data]);

  if (!data.metrics) {
    return null;
  }

  const lastUpdatedText = data.lastUpdated
    ? `Hoy, ${data.lastUpdated.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Hoy";

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white">
                  <RiAlertLine className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-amber-800">
                    Pendiente en gestión
                  </h2>
                  <p className="mt-1 text-sm font-medium text-amber-700">
                    Doble click del saldo pendiente: composición judicial, pre judicial, no judicial y entidades.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase text-amber-700">Ultima actualización</p>
                <p className="mt-1 text-sm font-semibold text-amber-900">{lastUpdatedText}</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[225px] overflow-hidden rounded-lg border border-indigo-200 bg-white p-7 shadow-sm">
            <div className="relative z-10 flex h-full flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase text-amber-800">
                Saldo total pendiente
              </p>
              <p className="mt-4 text-6xl font-bold leading-none text-slate-950 md:text-7xl">
                {formatCLP(detalle.totalPendiente)}
              </p>
              <div className="mt-7 inline-flex w-fit items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-950">
                <RiInformationLine className="h-4 w-4 text-amber-500" aria-hidden="true" />
                <span>Monto aún abierto para gestión y priorización.</span>
              </div>
            </div>
            <RiWallet3Line
              className="absolute -right-8 bottom-3 h-44 w-44 text-slate-100"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-red-200 bg-red-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase text-red-900">Judicial</p>
              <span className="rounded-full bg-red-700 px-3 py-1.5 text-[11px] font-semibold text-white">
                {formatNumber(detalle.judicial.casos)} casos
              </span>
            </div>
            <p className="mt-5 text-4xl font-bold text-red-950">
              {formatCLP(detalle.judicial.monto)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-red-950">
              <RiScalesLine className="h-4 w-4" aria-hidden="true" />
              <span>En litigio</span>
            </div>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase text-orange-900">Pre judicial</p>
              <span className="rounded-full bg-orange-700 px-3 py-1.5 text-[11px] font-semibold text-white">
                {formatNumber(detalle.preJudicial.casos)} casos
              </span>
            </div>
            <p className="mt-5 text-4xl font-bold text-orange-950">
              {formatCLP(detalle.preJudicial.monto)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-950">
              <RiAlertLine className="h-4 w-4" aria-hidden="true" />
              <span>Riesgo preventivo</span>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase text-slate-800">No judicial</p>
              <span className="rounded-full bg-slate-700 px-3 py-1.5 text-[11px] font-semibold text-white">
                {formatNumber(detalle.noJudicial.casos)} casos
              </span>
            </div>
            <p className="mt-5 text-4xl font-bold text-slate-950">
              {formatCLP(detalle.noJudicial.monto)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-950">
              <RiFileList3Line className="h-4 w-4" aria-hidden="true" />
              <span>Gestión Administrativa</span>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-indigo-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Entidades con casos judiciales
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Priorizadas por cantidad de casos judiciales y monto judicial asociado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold uppercase text-indigo-950">
              {formatNumber(detalle.entidadesJudiciales.length)} entidades
            </span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-indigo-200 text-indigo-950 hover:bg-indigo-50"
              aria-label="Filtrar entidades judiciales"
            >
              <RiFilter3Line className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {detalle.entidadesJudiciales.length ? (
          <div className="overflow-x-auto border-t border-indigo-100">
            <table className="min-w-full text-left">
              <thead className="bg-indigo-50 text-[11px] font-semibold uppercase text-indigo-950">
                <tr>
                  <th className="px-5 py-4">Entidad</th>
                  <th className="px-5 py-4 text-center">Casos judiciales</th>
                  <th className="px-5 py-4 text-right">Monto judicial</th>
                  <th className="px-5 py-4 text-center">Casos pre judiciales</th>
                  <th className="px-5 py-4 text-right">Monto pre judicial</th>
                  <th className="px-5 py-4 text-right">Pendiente total</th>
                  <th className="px-5 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {detalle.entidadesJudiciales.map((entidad) => (
                  <tr key={`${entidad.entidadId || entidad.entidadNombre}`} className="bg-white">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-semibold text-indigo-800">
                          {getInitial(entidad.entidadNombre)}
                        </span>
                        <span className="text-sm font-semibold text-slate-950">
                          {entidad.entidadNombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex min-w-10 justify-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        {formatNumber(entidad.casosJudiciales)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-red-700">
                      {formatCLP(entidad.montoJudicial)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex min-w-10 justify-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        {formatNumber(entidad.casosPreJudiciales)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-orange-700">
                      {formatCLP(entidad.montoPreJudicial)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-950">
                      {formatCLP(entidad.deudaPendiente)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {typeof onSelectEntidad === "function" && entidad.entidadId ? (
                        <button
                          type="button"
                          onClick={() => onSelectEntidad(entidad.entidadId)}
                          className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-950 hover:bg-indigo-50"
                        >
                          Focalizar
                          <RiArrowRightSLine className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">Sin acción</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 border-t border-indigo-100 bg-indigo-50 px-5 py-4 text-xs font-bold text-indigo-950 sm:flex-row sm:items-center sm:justify-between">
              <span className="uppercase text-indigo-800">Fin de resultados</span>
              <span>
                Mostrando {formatNumber(detalle.entidadesJudiciales.length)} de{" "}
                {formatNumber(detalle.entidadesJudiciales.length)} entidades
              </span>
            </div>
          </div>
        ) : (
          <div className="border-t border-indigo-100 p-6 text-sm text-slate-500">
            No hay entidades con casos judiciales para los filtros actuales.
          </div>
        )}
      </section>
    </div>
  );
};

export default PendienteOperativoDetalle;
