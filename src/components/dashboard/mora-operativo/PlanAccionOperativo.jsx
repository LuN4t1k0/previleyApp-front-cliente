"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RiCrosshair2Line,
  RiErrorWarningLine,
  RiFileList3Line,
  RiScales3Line,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import buildMoraDashboardParams from "@/utils/moraDashboardParams";
import { RiskPill, SectionCard, SectionHeader } from "./MoraOperativoUI";

const formatCLP = (valor) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const formatNumber = (valor) => Number(valor || 0).toLocaleString("es-CL");

const riesgoPeso = {
  alto: 0,
  medio: 1,
  bajo: 2,
};

const getCurrentPeriodo = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getPeriodoFromDateRange = (dateRange) => {
  const sourceDate = dateRange?.from instanceof Date ? dateRange.from : null;
  if (!sourceDate) return getCurrentPeriodo();
  return `${sourceDate.getFullYear()}-${String(sourceDate.getMonth() + 1).padStart(2, "0")}`;
};

const PlanAccionOperativo = ({ empresaRut, entidadId, dateRange }) => {
  const [gestiones, setGestiones] = useState([]);
  const [motivos, setMotivos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!empresaRut) return;

      try {
        const params = buildMoraDashboardParams({ empresaRut, entidadId, dateRange });
        const periodo = getPeriodoFromDateRange(dateRange);
        const [gestionesRes, motivosRes] = await Promise.all([
          apiService.get("/prioridad-gestion-mora", {
            params: {
              ...params,
              periodo,
            },
          }),
          apiService.get("/mora-dashboard/operativo/distribucion-motivo", { params }),
        ]);

        setGestiones(gestionesRes.data.data || []);
        setMotivos(motivosRes.data.data || []);
      } catch (error) {
        console.error("Error cargando plan de acción operativo:", error);
        setGestiones([]);
        setMotivos([]);
      }
    };

    fetchData();
  }, [empresaRut, entidadId, dateRange]);

  const plan = useMemo(() => {
    const filas = Array.isArray(gestiones)
      ? [...gestiones]
          .filter((gestion) => Number(gestion?.casosPendientes || 0) > 0)
          .sort((a, b) => {
            const ordenA = Number(a?.ordenActual || a?.ordenManual || 0);
            const ordenB = Number(b?.ordenActual || b?.ordenManual || 0);
            if (ordenA && ordenB) return ordenA - ordenB;
            if (ordenA) return -1;
            if (ordenB) return 1;

            const riesgoA = riesgoPeso[String(a?.nivelRiesgo || "").toLowerCase()] ?? 3;
            const riesgoB = riesgoPeso[String(b?.nivelRiesgo || "").toLowerCase()] ?? 3;
            if (riesgoA !== riesgoB) return riesgoA - riesgoB;
            return Number(b?.deudaPendiente || 0) - Number(a?.deudaPendiente || 0);
          })
      : [];

    const totalPendiente = filas.reduce(
      (acc, gestion) => acc + Number(gestion.deudaPendiente || 0),
      0
    );
    const totalCasos = filas.reduce((acc, gestion) => acc + Number(gestion.casosPendientes || 0), 0);
    const judiciales = filas.reduce((acc, gestion) => acc + Number(gestion.casosJudiciales || 0), 0);
    const montoJudicial = filas.reduce((acc, gestion) => acc + Number(gestion.montoJudicial || 0), 0);
    const preJudiciales = filas.reduce((acc, gestion) => acc + Number(gestion.casosPreJudiciales || 0), 0);
    const montoPreJudicial = filas.reduce((acc, gestion) => acc + Number(gestion.montoPreJudicial || 0), 0);
    const gestionPrincipal = filas[0] || null;
    const origenManual = filas.filter(
      (gestion) => String(gestion?.origenPrioridad || "").toLowerCase() === "manual"
    ).length;
    const motivoPrincipal = Array.isArray(motivos)
      ? [...motivos].sort((a, b) => Number(b?.monto || 0) - Number(a?.monto || 0))[0]
      : null;

    const planInterno = {
      label: "Plan interno",
      value: origenManual > 0 ? `${formatNumber(origenManual)} manuales` : "Sugerida",
      detail:
        origenManual > 0
          ? "Orden definido desde la mesa interna."
          : "Orden calculado por deuda, riesgo y estado.",
      icon: RiFileList3Line,
      tone: "border-slate-200 bg-slate-50 text-slate-950",
    };

    const cards = [
      {
        label: "Mayor concentración",
        value: gestionPrincipal?.entidadNombre || "Sin gestiones pendientes",
        detail: gestionPrincipal
          ? `${formatCLP(gestionPrincipal.deudaPendiente)} en ${formatNumber(
              gestionPrincipal.casosPendientes
            )} casos`
          : "No hay deuda pendiente para revisar.",
        icon: RiCrosshair2Line,
        tone: "border-indigo-200 bg-indigo-50 text-indigo-950",
      },
      {
        label: "Judicial pendiente",
        value: `${formatNumber(judiciales)} casos`,
        detail: `${formatCLP(montoJudicial)} pendiente judicial.`,
        icon: RiScales3Line,
        tone: judiciales > 0 ? "border-red-200 bg-red-50 text-red-950" : "border-emerald-200 bg-emerald-50 text-emerald-950",
      },
      {
        label: "Pre judicial pendiente",
        value: `${formatNumber(preJudiciales)} casos`,
        detail: `${formatCLP(montoPreJudicial)} pendiente pre judicial.`,
        icon: RiScales3Line,
        tone: preJudiciales > 0 ? "border-orange-200 bg-orange-50 text-orange-950" : "border-emerald-200 bg-emerald-50 text-emerald-950",
      },
      {
        label: "Motivo dominante",
        value: motivoPrincipal?.motivo || "Sin motivo registrado",
        detail: motivoPrincipal
          ? `${formatCLP(motivoPrincipal.monto)} en ${formatNumber(motivoPrincipal.casos)} casos`
          : "No hay clasificación disponible.",
        icon: RiFileList3Line,
        tone: "border-amber-200 bg-amber-50 text-amber-950",
      },
    ];

    return {
      cards,
      planInterno,
      gestiones: filas.slice(0, 3),
      totalPendiente,
      totalCasos,
    };
  }, [gestiones, motivos]);

  if (!plan.gestiones.length && plan.totalPendiente === 0) {
    return null;
  }

  const PlanInternoIcon = plan.planInterno?.icon;

  return (
    <SectionCard>
      <SectionHeader
        title="Focos priorizados"
        description="Resumen de las prioridades vigentes definidas para el periodo."
        badge={`${formatNumber(plan.totalCasos)} casos pendientes`}
        icon={RiErrorWarningLine}
      />

      <div className="border-t border-indigo-100 px-5 py-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plan.cards.map(({ label, value, detail, icon: Icon, tone }) => (
            <article key={label} className={`rounded-lg border p-4 ${tone}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase">{label}</p>
                  <p className="mt-3 truncate text-xl font-semibold">{value}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-sm leading-5 opacity-80">{detail}</p>
            </article>
          ))}
        </div>

        {plan.planInterno ? (
          <article className={`mt-4 rounded-lg border p-4 ${plan.planInterno.tone}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase">{plan.planInterno.label}</p>
                <p className="mt-2 text-xl font-semibold">{plan.planInterno.value}</p>
                <p className="mt-2 text-sm leading-5 opacity-80">{plan.planInterno.detail}</p>
              </div>
              {PlanInternoIcon ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70">
                  <PlanInternoIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : null}
            </div>
          </article>
        ) : null}

        <div className="mt-5 rounded-lg border border-indigo-100 bg-slate-50">
          <div className="flex flex-col gap-2 border-b border-indigo-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Top focos del periodo</p>
              <p className="mt-1 text-sm text-slate-600">
                Saldo pendiente asociado: {formatCLP(plan.totalPendiente)}.
              </p>
            </div>
            <Link
              href="/servicios/mora-presunta/priorizacion"
              className="inline-flex w-fit items-center rounded-md border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-800 hover:border-indigo-500 hover:bg-indigo-50"
            >
              Ver plan de trabajo completo
            </Link>
          </div>

          <div className="divide-y divide-indigo-100">
            {plan.gestiones.map((gestion, index) => (
              <article
                key={gestion.gestionMoraId}
                className="grid gap-4 bg-white px-4 py-4 lg:grid-cols-[44px_minmax(220px,1fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)] lg:items-center"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-sm font-semibold text-indigo-950">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {gestion.folio || `Gestión #${gestion.gestionMoraId}`}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-600">{gestion.entidadNombre}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Pendiente</p>
                  <p className="mt-1 text-base font-semibold text-slate-950">
                    {formatCLP(gestion.deudaPendiente)}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskPill level={gestion.nivelRiesgo} />
                    {Number(gestion.casosJudiciales || 0) > 0 ? (
                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-950">
                        {formatNumber(gestion.casosJudiciales)} judicial
                      </span>
                    ) : null}
                    {Number(gestion.casosPreJudiciales || 0) > 0 ? (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-950">
                        {formatNumber(gestion.casosPreJudiciales)} pre judicial
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {formatNumber(gestion.casosNoJudiciales)} casos no judiciales. Avance informado:{" "}
                    {Number(gestion.avancePorcentaje || 0).toFixed(1)}%.
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                    Origen: {gestion.origenPrioridad || "sugerida"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default PlanAccionOperativo;
