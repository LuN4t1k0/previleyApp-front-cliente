"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DateRangePicker } from "@tremor/react";
import { useSession } from "next-auth/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import useSocket from "@/hooks/useSocket";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";
import apiService from "@/app/api/apiService";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  RiBankLine,
  RiBuildingLine,
  RiCalendarLine,
  RiExternalLinkLine,
  RiFileDownloadLine,
  RiFileUploadLine,
  RiQuestionAnswerLine,
} from "@remixicon/react";

const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  return String(estado)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const estadoTone = {
  cerrada: "border-slate-200 bg-slate-100 text-slate-700",
  cerrado: "border-slate-200 bg-slate-100 text-slate-700",
  pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  analisis: "border-sky-200 bg-sky-50 text-sky-700",
  "solicitud cliente": "border-amber-200 bg-amber-50 text-amber-700",
  "respuesta cliente": "border-indigo-200 bg-indigo-50 text-indigo-700",
  pagado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  regularizado: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const getEstadoTone = (estado) =>
  estadoTone[String(estado || "").toLowerCase()] ||
  "border-slate-200 bg-slate-50 text-slate-700";

const tipoSolicitudLabels = {
  certificado_deuda_actualizado: "Certificado de deuda actualizado",
  certificado_pago: "Certificado de pago",
  comprobante_pago: "Comprobante de pago",
  aclaracion_movimiento_personal: "Aclaracion de movimiento personal",
  documento_respaldo_finiquito: "Documento de respaldo de finiquito",
  contrato_o_anexo: "Contrato o anexo",
  certificado_previred: "Certificado Previred",
  otro_respaldo: "Otro respaldo",
};

const MoraGestionesDashboard = () => {
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastEmpresaLabel = useRef("");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [gestiones, setGestiones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingGestiones, setLoadingGestiones] = useState(false);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [errorGestiones, setErrorGestiones] = useState("");
  const [solicitudActiva, setSolicitudActiva] = useState(null);
  const [respuestaCliente, setRespuestaCliente] = useState("");
  const [respuestaArchivo, setRespuestaArchivo] = useState(null);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  const handleDownloadDetalle = useCallback(async (gestion) => {
    if (!gestion?.id) return;
    try {
      const response = await apiService.get(`/gestion-mora/${gestion.id}/export`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `detalle_gestion_${gestion.folio || gestion.id}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando archivo de detalle", error);
      setErrorGestiones("No se pudo descargar el archivo de detalle de la gestión.");
    }
  }, []);

  const empresaOptions = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => ({
          rut: empresa.empresaRut,
          nombre: empresa.nombre,
          label: `${empresa.nombre} (${empresa.empresaRut})`,
          rutNormalized: empresa.empresaRut.replace(/[^\dk]/gi, "").toLowerCase(),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    [empresas]
  );

  useEffect(() => {
    if (empresaOptions.length > 0 && !empresaSeleccionada) {
      setEmpresaSeleccionada(empresaOptions[0].rut);
    }
  }, [empresaOptions, empresaSeleccionada]);

  useEffect(() => {
    const match = empresaOptions.find((option) => option.rut === empresaSeleccionada);
    const label = match ? match.label : "";
    setEmpresaInput(label);
    lastEmpresaLabel.current = label;
  }, [empresaOptions, empresaSeleccionada]);

  const fetchGestiones = useCallback(async () => {
    if (!empresaSeleccionada) {
      setGestiones([]);
      setErrorGestiones("");
      return;
    }

    try {
      setLoadingGestiones(true);
      setErrorGestiones("");
      const params = {
        empresaRut: empresaSeleccionada,
        limit: 500,
        offset: 0,
      };

      if (entidadSeleccionada) {
        params.entidadId = entidadSeleccionada;
      }

      if (dateRange?.from instanceof Date) {
        params.fechaGestion_inicio = dateRange.from.toISOString().split("T")[0];
      }

      if (dateRange?.to instanceof Date) {
        params.fechaGestion_termino = dateRange.to.toISOString().split("T")[0];
      }

      const response = await apiService.get("/gestion-mora", { params });
      setGestiones(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error cargando gestiones de mora", error);
      setGestiones([]);
      setErrorGestiones(
        error?.response?.data?.message || "No se pudieron cargar las gestiones."
      );
    } finally {
      setLoadingGestiones(false);
    }
  }, [empresaSeleccionada, entidadSeleccionada, dateRange]);

  useEffect(() => {
    fetchGestiones();
  }, [fetchGestiones]);

  const fetchSolicitudes = useCallback(async () => {
    if (!empresaSeleccionada) {
      setSolicitudes([]);
      return;
    }

    try {
      setLoadingSolicitudes(true);
      const response = await apiService.get("/solicitudes-mora");
      setSolicitudes(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error cargando solicitudes de mora", error);
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  }, [empresaSeleccionada]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const belongsToSelectedEmpresa = useCallback(
    (payload) => {
      const payloadEmpresaRut =
        payload?.empresaRut || payload?.gestionMora?.empresaRut || payload?.gestion?.empresaRut;
      return !empresaSeleccionada || !payloadEmpresaRut || payloadEmpresaRut === empresaSeleccionada;
    },
    [empresaSeleccionada]
  );

  const handleGestionRealtime = useCallback(
    (payload) => {
      if (!belongsToSelectedEmpresa(payload)) return;
      fetchGestiones();
    },
    [belongsToSelectedEmpresa, fetchGestiones]
  );

  const handleSolicitudRealtime = useCallback(
    (payload) => {
      if (!belongsToSelectedEmpresa(payload)) return;
      fetchSolicitudes();
      fetchGestiones();
    },
    [belongsToSelectedEmpresa, fetchGestiones, fetchSolicitudes]
  );

  useRealtimeEntity(socket, "gestionMora", {
    onCreated: handleGestionRealtime,
    onUpdated: handleGestionRealtime,
    onDeleted: handleGestionRealtime,
  });

  useRealtimeEntity(socket, "solicitudMora", {
    onCreated: handleSolicitudRealtime,
    onUpdated: handleSolicitudRealtime,
    onDeleted: handleSolicitudRealtime,
  });

  const entidadesDisponibles = useMemo(() => {
    const byId = new Map();
    gestiones.forEach((gestion) => {
      if (!gestion?.entidadId || byId.has(String(gestion.entidadId))) return;
      byId.set(String(gestion.entidadId), {
        value: String(gestion.entidadId),
        label: gestion.entidad || "Entidad sin nombre",
      });
    });
    return Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [gestiones]);

  useEffect(() => {
    if (!entidadSeleccionada) return;
    if (!entidadesDisponibles.find((item) => item.value === entidadSeleccionada)) {
      setEntidadSeleccionada("");
    }
  }, [entidadesDisponibles, entidadSeleccionada]);

  const handleEmpresaInputChange = useCallback(
    (value) => {
      setEmpresaInput(value);
      const normalized = value.trim().toLowerCase();
      if (!normalized) {
        setEmpresaSeleccionada("");
        return;
      }

      const byLabel = empresaOptions.find((option) => option.label.toLowerCase() === normalized);
      if (byLabel) {
        if (byLabel.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(byLabel.rut);
        }
        if (value !== byLabel.label) {
          setEmpresaInput(byLabel.label);
        }
        lastEmpresaLabel.current = byLabel.label;
        return;
      }

      const normalizedRut = normalized.replace(/[^\dk]/gi, "");
      const byRut = empresaOptions.find(
        (option) => option.rutNormalized === normalizedRut
      );
      if (byRut) {
        if (byRut.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(byRut.rut);
        }
        setEmpresaInput(byRut.label);
        lastEmpresaLabel.current = byRut.label;
      }
    },
    [empresaOptions, empresaSeleccionada]
  );

  const handleEmpresaFocus = useCallback(() => {
    setEmpresaInput("");
  }, []);

  const handleEmpresaBlur = useCallback(() => {
    if (!empresaInput) {
      setEmpresaInput(lastEmpresaLabel.current || "");
    }
  }, [empresaInput]);

  const solicitudesPorGestion = useMemo(() => {
    const map = new Map();
    solicitudes.forEach((solicitud) => {
      const key = Number(solicitud.gestionMoraId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(solicitud);
    });
    return map;
  }, [solicitudes]);

  const openResponderSolicitud = useCallback((solicitud) => {
    setSolicitudActiva(solicitud);
    setRespuestaCliente("");
    setRespuestaArchivo(null);
  }, []);

  const closeResponderSolicitud = useCallback(() => {
    if (enviandoRespuesta) return;
    setSolicitudActiva(null);
    setRespuestaCliente("");
    setRespuestaArchivo(null);
  }, [enviandoRespuesta]);

  const handleResponderSolicitud = useCallback(async () => {
    if (!solicitudActiva?.id) return;
    if (!respuestaCliente.trim() && !respuestaArchivo) {
      return;
    }

    const formData = new FormData();
    if (respuestaCliente.trim()) formData.append("respuestaCliente", respuestaCliente.trim());
    if (respuestaArchivo) formData.append("respuestaArchivo", respuestaArchivo);

    try {
      setEnviandoRespuesta(true);
      await apiService.patch(`/solicitudes-mora/${solicitudActiva.id}/responder`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchSolicitudes();
      setSolicitudActiva(null);
      setRespuestaCliente("");
      setRespuestaArchivo(null);
      setGestiones((current) =>
        current.map((gestion) =>
          Number(gestion.id) === Number(solicitudActiva.gestionMoraId)
            ? { ...gestion, estado: "respuesta cliente" }
            : gestion
        )
      );
    } catch (error) {
      console.error("Error respondiendo solicitud de mora", error);
      setErrorGestiones("No se pudo enviar la respuesta de la solicitud.");
    } finally {
      setEnviandoRespuesta(false);
    }
  }, [fetchSolicitudes, respuestaArchivo, respuestaCliente, solicitudActiva]);

  if (loadingEmpresas && !empresaSeleccionada) {
    return <DashboardMoraAnaliticoSkeleton />;
  }

  return (
    <div className="theme-mora">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8">
          <section className="glass-panel rounded-[2.5rem] p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                  Gestiones
                </span>
                <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                  Trazabilidad de gestiones
                </h1>
                <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                  Línea de tiempo con las gestiones realizadas y su estado actual.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex min-w-[260px] flex-1 items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                  <RiBuildingLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Buscar empresa"
                    placeholder={
                      loadingEmpresas ? "Cargando empresas..." : "Busca por nombre o RUT"
                    }
                    className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder:text-gray-400 outline-none"
                    value={empresaInput}
                    onChange={(event) => handleEmpresaInputChange(event.target.value)}
                    onFocus={(event) => {
                      event.target.select();
                      handleEmpresaFocus();
                    }}
                    onBlur={handleEmpresaBlur}
                    list="mora-gestiones-empresas"
                    disabled={loadingEmpresas}
                  />
                  <datalist id="mora-gestiones-empresas">
                    {empresaOptions.map((empresa) => (
                      <option key={empresa.rut} value={empresa.label} />
                    ))}
                  </datalist>
                </div>

                <div className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                  <RiBankLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
                  <select
                    aria-label="Filtrar por entidad"
                    className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] outline-none"
                    value={entidadSeleccionada}
                    onChange={(event) => setEntidadSeleccionada(event.target.value)}
                    disabled={loadingGestiones}
                  >
                    <option value="">
                      {loadingGestiones ? "Cargando entidades..." : "Todas las entidades"}
                    </option>
                    {entidadesDisponibles.map((entidad) => (
                      <option key={entidad.value} value={entidad.value}>
                        {entidad.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                  <RiCalendarLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
                  <DateRangePicker
                    value={dateRange}
                    onValueChange={setDateRange}
                    enableClear
                    className="min-w-[220px]"
                  />
                </div>
              </div>
            </div>
          </section>

          {empresaSeleccionada ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">
                    Gestiones de la empresa
                  </h2>
                  <p className="text-sm text-slate-500">
                    Se muestran todas las gestiones registradas para la empresa seleccionada, incluidas las cerradas.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                  {gestiones.length} Gestiones
                </div>
              </div>

              {loadingGestiones ? (
                <div className="py-16 text-center text-sm text-slate-400">
                  Cargando gestiones...
                </div>
              ) : errorGestiones ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-medium text-rose-700">
                  {errorGestiones}
                </div>
              ) : gestiones.length === 0 ? (
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                  <p className="text-lg font-semibold text-slate-600">Sin gestiones</p>
                  <p className="text-sm text-slate-400">
                    No hay gestiones registradas para los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gestiones.map((gestion) => {
                    const montoTotal =
                      Number(gestion?.montoRegularizado || 0) + Number(gestion?.montoPago || 0);

                    const documentos = [
                      {
                        label: "Certificado inicial",
                        href: gestion?.certificadoInicial,
                      },
                      {
                        label: "Certificado final",
                        href: gestion?.certificadoFinal,
                      },
                      {
                        label: "Comprobante pago",
                        href: gestion?.comprobantePago,
                      },
                    ].filter((item) => item.href);
                    const solicitudesGestion = solicitudesPorGestion.get(Number(gestion.id)) || [];
                    const solicitudesAccionables = solicitudesGestion.filter((solicitud) =>
                      ["pendiente", "rechazada"].includes(String(solicitud.estado || "").toLowerCase())
                    );

                    return (
                      <article
                        key={gestion.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-black uppercase tracking-tighter text-slate-400">
                                Gestión #{gestion.id}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ${getEstadoTone(
                                  gestion.estado
                                )}`}
                              >
                                {formatEstado(gestion.estado)}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-lg font-semibold text-slate-800">
                                {gestion.folio || `Gestión #${gestion.id}`}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {gestion.empresa || gestion.empresaRut}
                              </p>
                            </div>

                            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                              <p>
                                <span className="font-semibold text-slate-700">Entidad:</span>{" "}
                                {gestion.entidad || "Sin entidad"}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-700">Analista:</span>{" "}
                                {gestion.analista || "Sin analista"}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-700">Fecha gestión:</span>{" "}
                                {gestion.fechaGestion ? formatDate(gestion.fechaGestion) : "Sin fecha"}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-700">Fecha pago:</span>{" "}
                                {gestion.fechaPago ? formatDate(gestion.fechaPago) : "Sin fecha"}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-[180px] rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                              Monto total
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-800">
                              {formatCurrency(montoTotal)}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              Regularizado: {formatCurrency(gestion?.montoRegularizado || 0)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Pago: {formatCurrency(gestion?.montoPago || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => handleDownloadDetalle(gestion)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <RiFileDownloadLine className="h-4 w-4" />
                            Archivo de detalle
                          </button>

                          {documentos.length ? (
                            documentos.map((documento) => (
                              <a
                                key={`${gestion.id}-${documento.label}`}
                                href={documento.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <RiFileDownloadLine className="h-4 w-4" />
                                {documento.label}
                                <RiExternalLinkLine className="h-3.5 w-3.5" />
                              </a>
                            ))
                          ) : null}
                        </div>

                        {solicitudesGestion.length > 0 && (
                          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <RiQuestionAnswerLine className="h-5 w-5 text-amber-600" />
                                <h4 className="text-sm font-black uppercase tracking-wide text-amber-800">
                                  Solicitudes de antecedentes
                                </h4>
                              </div>
                              {loadingSolicitudes && (
                                <span className="text-xs font-semibold text-amber-600">
                                  Actualizando...
                                </span>
                              )}
                            </div>

                            <div className="space-y-3">
                              {solicitudesGestion.map((solicitud) => {
                                const accionable = solicitudesAccionables.some(
                                  (item) => item.id === solicitud.id
                                );
                                return (
                                  <div
                                    key={solicitud.id}
                                    className="rounded-xl border border-white/80 bg-white p-3 shadow-sm"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">
                                          {tipoSolicitudLabels[solicitud.tipoSolicitud] || solicitud.tipoSolicitud}
                                        </p>
                                        {solicitud.mensaje && (
                                          <p className="mt-1 text-sm text-slate-600">
                                            {solicitud.mensaje}
                                          </p>
                                        )}
                                        {solicitud.respuestaCliente && (
                                          <p className="mt-2 text-xs text-slate-500">
                                            Respuesta enviada: {solicitud.respuestaCliente}
                                          </p>
                                        )}
                                      </div>
                                      <span
                                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getEstadoTone(
                                          solicitud.estado
                                        )}`}
                                      >
                                        {formatEstado(solicitud.estado)}
                                      </span>
                                    </div>

                                    {accionable && (
                                      <button
                                        type="button"
                                        onClick={() => openResponderSolicitud(solicitud)}
                                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-500"
                                      >
                                        <RiFileUploadLine className="h-4 w-4" />
                                        Responder solicitud
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-3xl border border-white/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur">
              <p className="text-sm text-[color:var(--text-secondary)]">
                Selecciona una empresa para visualizar la trazabilidad de gestiones.
              </p>
            </section>
          )}
        </div>
      </main>

      {solicitudActiva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-600">
                Responder solicitud
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {tipoSolicitudLabels[solicitudActiva.tipoSolicitud] || solicitudActiva.tipoSolicitud}
              </h3>
              {solicitudActiva.mensaje && (
                <p className="mt-2 text-sm text-slate-500">{solicitudActiva.mensaje}</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="respuesta-solicitud-mora" className="text-sm font-semibold text-slate-700">
                  Comentario
                </label>
                <textarea
                  id="respuesta-solicitud-mora"
                  value={respuestaCliente}
                  onChange={(event) => setRespuestaCliente(event.target.value)}
                  rows={5}
                  maxLength={4000}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="Indica que documento enviaste o agrega contexto para Previley."
                  disabled={enviandoRespuesta}
                />
              </div>

              <div>
                <label htmlFor="archivo-solicitud-mora" className="text-sm font-semibold text-slate-700">
                  Documento adjunto
                </label>
                <input
                  id="archivo-solicitud-mora"
                  type="file"
                  onChange={(event) => setRespuestaArchivo(event.target.files?.[0] || null)}
                  className="mt-1 block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  disabled={enviandoRespuesta}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeResponderSolicitud}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                disabled={enviandoRespuesta}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResponderSolicitud}
                disabled={enviandoRespuesta || (!respuestaCliente.trim() && !respuestaArchivo)}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {enviandoRespuesta ? "Enviando..." : "Enviar respuesta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoraGestionesDashboard;
