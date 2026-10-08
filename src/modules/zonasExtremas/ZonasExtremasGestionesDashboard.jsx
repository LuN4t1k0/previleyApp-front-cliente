"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DateRangePicker, Divider } from "@tremor/react";
import {
  RiArrowLeftLine,
  RiBuildingLine,
  RiCalendarLine,
  RiCloseCircleLine,
  RiDownloadLine,
  RiFileList3Line,
  RiFilter3Line,
  RiMoneyDollarCircleLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiUserLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { formatCurrency, formatDate } from "@/utils/formatters";

const toISODate = (value) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
};

const buildRangeParams = (range) => {
  const params = {};
  const from = toISODate(range?.from);
  const to = toISODate(range?.to);
  if (from) params.fechaGestion_inicio = from;
  if (to) params.fechaGestion_termino = to;
  return params;
};

const formatEstado = (estado) =>
  String(estado || "Sin estado")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const estadoTone = {
  analisis: "border-sky-200 bg-sky-50 text-sky-700",
  cerrada: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  rechazada: "border-rose-200 bg-rose-50 text-rose-700",
};

const getEstadoTone = (estado) =>
  estadoTone[String(estado || "").toLowerCase()] ||
  "border-slate-200 bg-slate-50 text-slate-700";

const normalizeGestiones = (payload) => {
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload)
        ? payload
        : [];

  return Array.from(
    rows
      .reduce((map, gestion) => {
        if (gestion?.id) map.set(String(gestion.id), gestion);
        return map;
      }, new Map())
      .values()
  );
};

const ZonasExtremasGestionesDashboard = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaRut, setEmpresaRut] = useState("");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [estado, setEstado] = useState("");
  const [gestiones, setGestiones] = useState([]);
  const [summary, setSummary] = useState({
    totalGestiones: 0,
    totalRegistros: 0,
    totalRecuperado: 0,
  });
  const [listTotal, setListTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedGestion, setSelectedGestion] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const empresaOptions = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => ({
          rut: empresa.empresaRut,
          nombre: empresa.nombre || empresa.empresaRut,
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [empresas]
  );

  useEffect(() => {
    if (!empresaRut && empresaOptions.length) {
      setEmpresaRut(empresaOptions[0].rut);
    }
  }, [empresaOptions, empresaRut]);

  const fetchGestiones = useCallback(async () => {
    if (!empresaRut) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        empresaRut,
        limit: 100,
        ...buildRangeParams(dateRange),
      };
      if (estado) params.estado = estado;
      const [gestionesResponse, summaryResponse] = await Promise.all([
        apiService.get("/gestion-zonas-extremas", { params }),
        apiService.get(
          `/zonas-extremas-dashboard/${empresaRut}/resumen-financiero`,
          { params }
        ),
      ]);
      const rows = normalizeGestiones(gestionesResponse?.data);
      const nextSummary = summaryResponse?.data?.data || {};
      setGestiones(rows);
      setListTotal(Number(gestionesResponse?.data?.total || rows.length));
      setSummary({
        totalGestiones: Number(nextSummary.totalGestiones || 0),
        totalRegistros: Number(nextSummary.totalRegistros || 0),
        totalRecuperado: Number(nextSummary.totalRecuperado || 0),
      });
    } catch (err) {
      console.error("Error cargando gestiones de zonas extremas", err);
      setError(err?.message || "No fue posible cargar las gestiones.");
      setGestiones([]);
      setListTotal(0);
      setSummary({ totalGestiones: 0, totalRegistros: 0, totalRecuperado: 0 });
    } finally {
      setLoading(false);
    }
  }, [dateRange, empresaRut, estado]);

  useEffect(() => {
    fetchGestiones();
  }, [fetchGestiones]);

  const fetchDetalles = useCallback(async (gestion) => {
    if (!gestion?.id) return;
    setSelectedGestion(gestion);
    setLoadingDetalles(true);
    try {
      const response = await apiService.get(
        `/gestion-zonas-extremas/${gestion.id}/detalles`,
        { params: { limit: 100 } }
      );
      setDetalles(response?.data?.data?.data || response?.data?.data || []);
    } catch (err) {
      console.error("Error cargando detalle de zonas extremas", err);
      setDetalles([]);
    } finally {
      setLoadingDetalles(false);
    }
  }, []);

  const handleDownloadDetalle = useCallback(async (gestion) => {
    if (!gestion?.id) return;
    try {
      const response = await apiService.get(
        `/gestion-zonas-extremas/${gestion.id}/export`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `detalle_zonas_extremas_${gestion.folio || gestion.id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando detalle de zonas extremas", err);
      setError("No se pudo descargar el archivo de detalle de la gestión.");
    }
  }, []);

  return (
    <main className="min-h-dvh bg-[#f7f4fb] px-4 py-5 text-slate-950 md:px-6 md:py-7">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              href="/servicios/zonas-extremas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <RiArrowLeftLine className="h-4 w-4" />
              Volver al dashboard
            </Link>
            <h1 className="mt-4 text-[clamp(2rem,2.3vw,2.85rem)] font-bold leading-tight tracking-normal text-[#06164b]">
              Bandeja de Gestiones
            </h1>
            <p className="mt-2 max-w-4xl text-base text-slate-600 md:text-lg">
              Monitorea las gestiones de Zonas Extremas, sus montos recuperados y los trabajadores informados.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-4 py-2 text-sm font-bold text-[#06164b] shadow-sm transition hover:bg-white"
            >
              <RiFilter3Line className="h-4 w-4" />
              Filtrar
            </button>
            <button
              type="button"
              onClick={fetchGestiones}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
            >
              <RiRefreshLine className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </section>

        {filtersOpen ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(260px,1.2fr)_minmax(260px,1fr)_minmax(220px,0.8fr)]">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Empresa</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <RiBuildingLine className="h-4 w-4 text-blue-600" />
                  <select
                    value={empresaRut}
                    onChange={(event) => setEmpresaRut(event.target.value)}
                    disabled={loadingEmpresas}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                  >
                    {empresaOptions.map((empresa) => (
                      <option key={empresa.rut} value={empresa.rut}>
                        {empresa.nombre} ({empresa.rut})
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Rango de fechas
                </legend>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <RiCalendarLine className="h-4 w-4 shrink-0 text-blue-600" />
                  <DateRangePicker
                    value={dateRange}
                    onValueChange={setDateRange}
                    enableClear
                    className="min-w-[220px]"
                  />
                </div>
              </fieldset>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Estado</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <RiShieldCheckLine className="h-4 w-4 text-blue-600" />
                  <select
                    value={estado}
                    onChange={(event) => setEstado(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                  >
                    <option value="">Todos los estados</option>
                    <option value="analisis">Analisis</option>
                    <option value="cerrada">Cerrada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
              </label>
            </div>
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Gestiones
            </p>
            <p className="mt-1 text-xl font-bold text-[#06164b]">
              {summary.totalGestiones.toLocaleString("es-CL")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Mostrando {gestiones.length.toLocaleString("es-CL")} de{" "}
              {listTotal.toLocaleString("es-CL")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Registros
            </p>
            <p className="mt-1 text-xl font-bold text-[#06164b]">
              {summary.totalRegistros.toLocaleString("es-CL")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Total recuperado
            </p>
            <p className="mt-1 text-xl font-bold text-[#06164b]">
              {formatCurrency(summary.totalRecuperado)}
            </p>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
            {error}
          </section>
        ) : null}

        {!empresaRut ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              Selecciona una empresa para visualizar la bandeja de gestiones.
            </p>
          </section>
        ) : loading ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Cargando gestiones...
          </section>
        ) : !gestiones.length ? (
          <section className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/70 py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">Sin gestiones</p>
            <p className="text-sm text-slate-500">
              No hay gestiones registradas para los filtros seleccionados.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {gestiones.map((gestion) => {
              const isSelected = selectedGestion?.id === gestion.id;
              const montoRecuperado = Number(gestion.montoRecuperado || 0);

              return (
                <article
                  key={gestion.id}
                  className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition md:p-5 ${
                    isSelected ? "border-indigo-300 ring-4 ring-indigo-100" : "border-slate-200"
                  }`}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400" />

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                          <h2 className="text-2xl font-bold leading-tight tracking-normal text-[#06164b]">
                            Gestión #{gestion.id}
                          </h2>
                          {gestion.folio ? (
                            <>
                              <span className="text-2xl font-semibold text-slate-300">/</span>
                              <span className="text-2xl font-bold text-slate-400">
                                {gestion.folio}
                              </span>
                            </>
                          ) : null}
                          <span
                            className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ring-1 ${getEstadoTone(gestion.estado)}`}
                          >
                            {formatEstado(gestion.estado)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <RiBuildingLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Empresa</p>
                            <p className="mt-1 truncate text-base font-medium text-slate-950">
                              {gestion.empresaNombre || gestion.empresaRut}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <RiShieldCheckLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Zona</p>
                            <p className="mt-1 truncate text-base font-medium text-slate-950">
                              {gestion.zonaExtrema || "Sin zona"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <RiCalendarLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha gestión</p>
                            <p className="mt-1 text-base text-slate-950">
                              {formatDate(gestion.fechaGestion)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <RiUserLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Analista</p>
                            <p className="mt-1 truncate text-base text-slate-950">
                              {gestion.analistaNombre || "Sin analista"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <aside className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_rgba(15,23,42,0.06)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Recuperado
                          </p>
                          <p className="mt-1 text-4xl font-bold leading-none text-[#06164b]">
                            {formatCurrency(montoRecuperado)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">CLP</p>
                        </div>
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                          <RiMoneyDollarCircleLine className="h-6 w-6" />
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-xs text-slate-600">
                        <div className="rounded-xl border border-blue-100 bg-white px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-wide text-slate-500">
                              <RiFileList3Line className="h-4 w-4 text-blue-600" />
                              Registros
                            </span>
                            <span className="font-semibold text-blue-950">
                              {Number(gestion.totalRegistros || 0).toLocaleString("es-CL")}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-wide text-slate-500">
                              <RiShieldCheckLine className="h-4 w-4 text-indigo-600" />
                              Folio TGR
                            </span>
                            <span className="font-semibold text-indigo-950">
                              {gestion.folioTgr || "—"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDownloadDetalle(gestion)}
                          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <RiDownloadLine className="h-4 w-4" />
                          Descargar Excel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedGestion(null);
                              setDetalles([]);
                              return;
                            }
                            fetchDetalles(gestion);
                          }}
                          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-700 transition hover:bg-blue-100"
                        >
                          {isSelected ? (
                            <>
                              <RiCloseCircleLine className="h-4 w-4" />
                              Ocultar trabajadores
                            </>
                          ) : (
                            <>
                              <RiFileList3Line className="h-4 w-4" />
                              Ver trabajadores
                            </>
                          )}
                        </button>
                      </div>
                    </aside>
                  </div>

                  {isSelected ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="mb-3 flex items-center gap-2 px-1">
                        <RiUserLine className="h-4 w-4 text-slate-500" />
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Trabajadores informados
                        </p>
                      </div>
                      {loadingDetalles ? (
                        <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-500">
                          Cargando detalle...
                        </p>
                      ) : detalles.length ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                          {detalles.map((detalle) => (
                            <article
                              key={detalle.id}
                              className="rounded-xl border border-slate-100 bg-white px-4 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {detalle.nombreCompleto || "Sin nombre"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {detalle.trabajadorRut || "Sin RUT"} · Periodo{" "}
                                    {detalle.periodo || "sin periodo"}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                  {detalle.afp || "AFP —"}
                                </span>
                              </div>
                              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                                <span>Region: {detalle.region || "—"}</span>
                                <span>Zona: {detalle.zonaExtrema || "—"}</span>
                                <span>
                                  Remuneracion: {formatCurrency(detalle.remuneracionImponible || 0)}
                                </span>
                                <span className="font-semibold text-emerald-700">
                                  Bonificacion: {formatCurrency(detalle.montoBonificado || 0)}
                                </span>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-slate-500">
                          Esta gestión no tiene detalle visible para tu usuario.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default ZonasExtremasGestionesDashboard;
