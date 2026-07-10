"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiAlarmWarningLine,
  RiArrowRightLine,
  RiBuildingLine,
  RiCalendarLine,
  RiFileExcel2Line,
  RiFileList3Line,
  RiFilePdf2Line,
  RiListOrdered,
  RiMoneyDollarCircleLine,
  RiScales3Line,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { RiskPill, SectionCard, SectionHeader } from "@/components/dashboard/mora-operativo/MoraOperativoUI";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import {
  buildPlanTrabajoRows,
  exportPlanTrabajoExcel,
  exportPlanTrabajoPdf,
} from "./planTrabajoExport";
import { formatMoraEstadoLabel } from "@/utils/moraEstado";

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const formatCLP = (value) => clpFormatter.format(Number(value || 0));
const formatNumber = (value) => Number(value || 0).toLocaleString("es-CL");

const getCurrentPeriodo = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const ordenarPrioridades = (items) =>
  items.toSorted((a, b) => {
    const ordenA = Number(a?.ordenActual || a?.ordenManual || 0);
    const ordenB = Number(b?.ordenActual || b?.ordenManual || 0);
    if (ordenA && ordenB) return ordenA - ordenB;
    if (ordenA) return -1;
    if (ordenB) return 1;
    return Number(b?.deudaPendiente || 0) - Number(a?.deudaPendiente || 0);
  });

const normalizarEstado = (estado) => String(estado || "").trim().toLowerCase();

const getMotivoOrden = (item) => {
  const casosJudiciales = Number(item?.casosJudiciales || 0);
  const casosPreJudiciales = Number(item?.casosPreJudiciales || 0);
  const deudaPendiente = Number(item?.deudaPendiente || 0);

  if (casosJudiciales > 0) {
    return `${formatNumber(casosJudiciales)} casos judiciales pendientes`;
  }
  if (casosPreJudiciales > 0) {
    return `${formatNumber(casosPreJudiciales)} casos pre judiciales pendientes`;
  }
  if (deudaPendiente > 0) {
    return `Saldo pendiente de ${formatCLP(deudaPendiente)}`;
  }
  return "Seguimiento administrativo";
};

const getProximaAccion = (item) => {
  const estado = normalizarEstado(item?.estadoGestion);
  if (estado === "registrada") return "Activar análisis interno";
  if (estado === "analisis") return "Completar análisis y definir curso";
  if (estado === "solicitud cliente") return "Responder antecedentes solicitados";
  if (estado === "respuesta cliente") return "Revisar respuesta del cliente";
  if (estado === "espera entidad") return "Esperar respuesta de entidad previsional";
  return "Revisar avance de la gestión";
};

const buildGestionHref = ({ empresaRut, gestionId }) => {
  const params = new URLSearchParams();
  if (empresaRut) params.set("empresaRut", empresaRut);
  if (gestionId) params.set("gestionId", String(gestionId));
  const query = params.toString();
  return `/servicios/mora-presunta/gestiones${query ? `?${query}` : ""}`;
};

const buildGrupoOptions = (empresas = []) => {
  const grupos = new Map();
  empresas.forEach((empresa) => {
    const grupoId = empresa?.grupoEmpresarialId || empresa?.grupoEmpresarial?.id;
    if (!grupoId) return;
    const key = String(grupoId);
    const nombre =
      empresa?.grupoEmpresarial?.nombre ||
      empresa?.grupoEmpresarialNombre ||
      `Grupo ${key}`;
    if (!grupos.has(key)) {
      grupos.set(key, { id: key, label: nombre, empresas: 0 });
    }
    grupos.get(key).empresas += 1;
  });
  return Array.from(grupos.values()).sort((a, b) => a.label.localeCompare(b.label, "es"));
};

const MoraPriorizacionCliente = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [scopeMode, setScopeMode] = useState("empresa");
  const [empresaRut, setEmpresaRut] = useState("");
  const [grupoEmpresarialId, setGrupoEmpresarialId] = useState("");
  const [periodo, setPeriodo] = useState(() => getCurrentPeriodo());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(null);

  const empresaOptions = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => ({
          rut: empresa.empresaRut,
          label: `${empresa.nombre || empresa.empresaRut} (${empresa.empresaRut})`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    [empresas]
  );

  const grupoOptions = useMemo(() => buildGrupoOptions(empresas), [empresas]);
  const empresaRutActiva = empresaRut || empresaOptions[0]?.rut || "";
  const grupoEmpresarialIdActivo =
    grupoEmpresarialId || grupoOptions[0]?.id || "";
  const selectedScopeName = useMemo(() => {
    if (scopeMode === "grupo") {
      return (
        grupoOptions.find((option) => String(option.id) === String(grupoEmpresarialIdActivo))
          ?.label || "Grupo empresarial"
      );
    }
    return (
      empresaOptions.find((option) => option.rut === empresaRutActiva)?.label ||
      empresaRutActiva ||
      "Empresa"
    );
  }, [empresaOptions, empresaRutActiva, grupoEmpresarialIdActivo, grupoOptions, scopeMode]);
  const scopeReady =
    scopeMode === "grupo" ? Boolean(grupoEmpresarialIdActivo) : Boolean(empresaRutActiva);
  const requestParams = useMemo(
    () =>
      scopeMode === "grupo"
        ? { grupoEmpresarialId: Number(grupoEmpresarialIdActivo) }
        : { empresaRut: empresaRutActiva },
    [empresaRutActiva, grupoEmpresarialIdActivo, scopeMode]
  );

  useEffect(() => {
    const fetchPrioridades = async () => {
      if (!scopeReady) {
        setItems([]);
        return;
      }

      try {
        setLoading(true);
        const res = await apiService.get("/prioridad-gestion-mora", {
          params: { ...requestParams, periodo },
        });
        setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error("Error cargando priorización cliente:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrioridades();
  }, [periodo, requestParams, scopeReady]);

  const prioridades = useMemo(() => ordenarPrioridades(items), [items]);

  const resumen = useMemo(() => {
    const totalPendiente = prioridades.reduce(
      (acc, item) => acc + Number(item.deudaPendiente || 0),
      0
    );
    const totalJudicial = prioridades.reduce(
      (acc, item) => acc + Number(item.montoJudicial || 0),
      0
    );
    const totalPreJudicial = prioridades.reduce(
      (acc, item) => acc + Number(item.montoPreJudicial || 0),
      0
    );
    const casosJudiciales = prioridades.reduce(
      (acc, item) => acc + Number(item.casosJudiciales || 0),
      0
    );
    const casosPreJudiciales = prioridades.reduce(
      (acc, item) => acc + Number(item.casosPreJudiciales || 0),
      0
    );
    const manuales = prioridades.filter(
      (item) => String(item.origenPrioridad || "").toLowerCase() === "manual"
    ).length;

    return {
      totalPendiente,
      totalJudicial,
      totalPreJudicial,
      casosJudiciales,
      casosPreJudiciales,
      manuales,
      sugeridas: Math.max(0, prioridades.length - manuales),
    };
  }, [prioridades]);

  const exportRows = useMemo(
    () =>
      buildPlanTrabajoRows({
        items: prioridades,
        getMotivoOrden,
        getProximaAccion,
      }),
    [prioridades]
  );

  const handleExportExcel = () => {
    if (!exportRows.length) return;
    try {
      setExporting("excel");
      exportPlanTrabajoExcel({
        rows: exportRows,
        resumen,
        periodo,
        scopeMode,
        scopeName: selectedScopeName,
      });
      showSuccessAlert("Excel generado", "El plan de trabajo fue descargado.");
    } catch (error) {
      console.error("Error exportando plan de trabajo a Excel:", error);
      showErrorAlert("Error", "No se pudo exportar el plan a Excel.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!exportRows.length) return;
    try {
      setExporting("pdf");
      await exportPlanTrabajoPdf({
        rows: exportRows,
        resumen,
        periodo,
        scopeMode,
        scopeName: selectedScopeName,
        formatCLP,
      });
      showSuccessAlert("PDF generado", "El plan de trabajo fue descargado.");
    } catch (error) {
      console.error("Error exportando plan de trabajo a PDF:", error);
      showErrorAlert("Error", "No se pudo exportar el plan a PDF.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f6ff] text-slate-950">
      <header className="border-b border-indigo-100 bg-[#f6f6ff]">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5 px-4 py-7 sm:px-6 lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase text-emerald-700">
                Mora presunta
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">
                Plan de trabajo
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Consulta el orden vigente de focos pendientes definido para el periodo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={!prioridades.length || loading || Boolean(exporting)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RiFileExcel2Line className="h-4 w-4" aria-hidden="true" />
              {exporting === "excel" ? "Generando..." : "Exportar Excel"}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={!prioridades.length || loading || Boolean(exporting)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RiFilePdf2Line className="h-4 w-4" aria-hidden="true" />
              {exporting === "pdf" ? "Generando..." : "Exportar PDF"}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6">
          <section className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(320px,1fr)_220px]">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase text-slate-500">
                  Planificar por
                </span>
                <div className="grid min-h-[42px] grid-cols-2 rounded-md border border-indigo-200 bg-slate-50 p-1">
                  {[
                    ["empresa", "Empresa"],
                    ["grupo", "Grupo"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScopeMode(value)}
                      disabled={loadingEmpresas || loading}
                      className={`rounded px-3 text-sm font-semibold transition ${
                        scopeMode === value
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase text-slate-500">
                  {scopeMode === "grupo" ? "Grupo empresarial" : "Empresa"}
                </span>
                <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <RiBuildingLine className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <select
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                    value={scopeMode === "grupo" ? grupoEmpresarialIdActivo : empresaRutActiva}
                    disabled={
                      loadingEmpresas ||
                      loading ||
                      (scopeMode === "grupo" ? grupoOptions.length === 0 : empresaOptions.length === 0)
                    }
                    onChange={(event) => {
                      if (scopeMode === "grupo") {
                        setGrupoEmpresarialId(event.target.value);
                      } else {
                        setEmpresaRut(event.target.value);
                      }
                    }}
                  >
                    {(scopeMode === "grupo" ? grupoOptions : empresaOptions).map((option) => (
                      <option key={option.id || option.rut} value={option.id || option.rut}>
                        {option.label}
                        {option.empresas ? ` (${option.empresas} empresas)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Periodo</span>
                <div className="flex min-h-[42px] items-center gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm">
                  <RiCalendarLine className="h-5 w-5 text-slate-500" aria-hidden="true" />
                  <input
                    type="month"
                    value={periodo}
                    disabled={loading}
                    onChange={(event) => setPeriodo(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
                <RiListOrdered className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                <p className="mt-4 text-[11px] font-semibold uppercase text-slate-500">
                  Prioridades
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {formatNumber(prioridades.length)}
                </p>
              </article>
              <article className="rounded-lg border border-indigo-200 bg-white p-5 shadow-sm">
                <RiMoneyDollarCircleLine className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <p className="mt-4 text-[11px] font-semibold uppercase text-slate-500">
                  Pendiente priorizado
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-900">
                  {formatCLP(resumen.totalPendiente)}
                </p>
              </article>
              <article className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
                <RiScales3Line className="h-5 w-5 text-red-800" aria-hidden="true" />
                <p className="mt-4 text-[11px] font-semibold uppercase text-red-900">
                  Judicial pendiente
                </p>
                <p className="mt-2 text-2xl font-semibold text-red-950">
                  {formatNumber(resumen.casosJudiciales)} casos
                </p>
                <p className="mt-2 text-sm text-red-900">{formatCLP(resumen.totalJudicial)}</p>
              </article>
              <article className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-sm">
                <RiAlarmWarningLine className="h-5 w-5 text-orange-800" aria-hidden="true" />
                <p className="mt-4 text-[11px] font-semibold uppercase text-orange-900">
                  Pre judicial pendiente
                </p>
                <p className="mt-2 text-2xl font-semibold text-orange-950">
                  {formatNumber(resumen.casosPreJudiciales)} casos
                </p>
                <p className="mt-2 text-sm text-orange-900">{formatCLP(resumen.totalPreJudicial)}</p>
              </article>
            </div>

            <article className="flex flex-col gap-4 rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-indigo-200 bg-white text-indigo-700">
                  <RiFileList3Line className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-indigo-700">
                    Origen del orden
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {resumen.manuales ? `${formatNumber(resumen.manuales)} prioridades manuales` : "Orden sugerido"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    El plan convierte los focos del dashboard en una cola de trabajo con motivo y próxima acción por gestión.
                  </p>
                </div>
              </div>
              <div className="rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-indigo-900">
                {formatNumber(resumen.sugeridas)} mantienen orden automático
              </div>
            </article>
          </section>

          <SectionCard>
            <SectionHeader
              title="Detalle del plan de trabajo"
              description="Vista solo lectura del orden vigente de gestiones priorizadas."
              badge={`${formatNumber(prioridades.length)} gestiones`}
              icon={RiFileList3Line}
            />

            <div className="overflow-x-auto border-t border-indigo-100">
              {loading ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  Cargando priorización...
                </div>
              ) : !prioridades.length ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No hay gestiones priorizadas para el periodo seleccionado.
                </div>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Orden</th>
                      <th className="px-5 py-4">Gestión</th>
                      <th className="px-5 py-4">Entidad</th>
                      <th className="px-5 py-4 text-right">Pendiente</th>
                      <th className="px-5 py-4 text-right">Judicial</th>
                      <th className="px-5 py-4 text-right">Pre judicial</th>
                      <th className="px-5 py-4">Motivo del orden</th>
                      <th className="px-5 py-4">Próxima acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {prioridades.map((item, index) => (
                      <tr key={item.gestionMoraId} className="bg-white">
                        <td className="px-5 py-4 font-semibold text-slate-950">{index + 1}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">
                            {item.folio || `Gestión #${item.gestionMoraId}`}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                            {formatMoraEstadoLabel(item.estadoGestion, "sin estado")}
                          </p>
                          {scopeMode === "grupo" ? (
                            <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                              Empresa {item.empresaNombre || item.empresaRut || "sin nombre"}
                              {item.empresaNombre && item.empresaRut ? ` (${item.empresaRut})` : ""}
                            </p>
                          ) : null}
                          <p className="mt-2">
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-indigo-800">
                              {item.origenPrioridad || "sugerida"}
                            </span>
                          </p>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          {item.entidadNombre || "Entidad sin nombre"}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-amber-800">
                          {formatCLP(item.deudaPendiente)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-semibold text-red-950">
                            {formatNumber(item.casosJudiciales)} casos
                          </p>
                          <p className="mt-1 text-xs text-red-700">{formatCLP(item.montoJudicial)}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-semibold text-orange-950">
                            {formatNumber(item.casosPreJudiciales)} casos
                          </p>
                          <p className="mt-1 text-xs text-orange-700">{formatCLP(item.montoPreJudicial)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex max-w-[220px] flex-wrap items-center gap-1.5">
                            <span className="scale-90 origin-left">
                              <RiskPill level={item.nivelRiesgo} />
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold leading-4 text-slate-600">
                              {getMotivoOrden(item)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-[180px] flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-700">
                              {getProximaAccion(item)}
                            </span>
                            <Link
                              href={buildGestionHref({
                                empresaRut: scopeMode === "grupo" ? item.empresaRut : empresaRutActiva,
                                gestionId: item.gestionMoraId,
                              })}
                              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100"
                            >
                              Ver gestión
                              <RiArrowRightLine className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
};

export default MoraPriorizacionCliente;
