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
  RiAlarmWarningLine,
  RiArrowDownSLine,
  RiBankLine,
  RiBuildingLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiExternalLinkLine,
  RiFilter3Line,
  RiFileDownloadLine,
  RiFileList3Line,
  RiFileUploadLine,
  RiHistoryLine,
  RiMoneyDollarCircleLine,
  RiQuestionAnswerLine,
  RiRefreshLine,
  RiScales3Line,
  RiShieldCheckLine,
  RiTimeLine,
  RiUserLine,
} from "@remixicon/react";

const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  if (String(estado).trim().toLowerCase() === "espera entidad") {
    return "En espera de respuesta de entidad";
  }
  return String(estado)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const estadoBadgeStyles = {
  registrada: "border-blue-200 bg-blue-50 text-blue-700 ring-blue-100",
  pendiente: "border-slate-200 bg-slate-50 text-slate-700 ring-slate-100",
  analisis: "border-amber-200 bg-amber-50 text-amber-800 ring-amber-100",
  "solicitud cliente": "border-orange-200 bg-orange-50 text-orange-700 ring-orange-100",
  "respuesta cliente": "border-indigo-200 bg-indigo-50 text-indigo-700 ring-indigo-100",
  "espera entidad": "border-violet-200 bg-violet-50 text-violet-700 ring-violet-100",
  cerrada: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-100",
  cerrado: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-100",
  rechazada: "border-rose-200 bg-rose-50 text-rose-700 ring-rose-100",
  pagado: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-100",
  regularizado: "border-teal-200 bg-teal-50 text-teal-700 ring-teal-100",
};

const getEstadoTone = (estado) =>
  estadoBadgeStyles[String(estado || "").trim().toLowerCase()] ||
  "border-slate-200 bg-slate-50 text-slate-700 ring-slate-100";

const isGestionCerrada = (estado) =>
  ["cerrada", "cerrado"].includes(String(estado || "").trim().toLowerCase());

const compactText = (value, fallback = "Sin información registrada.", maxLength = 150) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const formatDurationHours = (hours) => {
  if (hours === null || hours === undefined || Number.isNaN(Number(hours))) return "Sin dato";
  const value = Number(hours);
  if (value < 1) return "Menos de 1 h";
  if (value < 24) return `${Math.round(value)} h`;
  const days = Math.floor(value / 24);
  const restHours = Math.round(value % 24);
  return restHours > 0 ? `${days} d ${restHours} h` : `${days} d`;
};

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
  const [errorGestiones, setErrorGestiones] = useState("");
  const [solicitudActiva, setSolicitudActiva] = useState(null);
  const [respuestaCliente, setRespuestaCliente] = useState("");
  const [respuestaArchivo, setRespuestaArchivo] = useState(null);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedSolicitudId, setExpandedSolicitudId] = useState(null);

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
      const response = await apiService.get("/solicitudes-mora");
      setSolicitudes(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error cargando solicitudes de mora", error);
      setSolicitudes([]);
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

  const gestionesEnriquecidas = useMemo(
    () =>
      gestiones.map((gestion) => {
        const solicitudesGestion = solicitudesPorGestion.get(Number(gestion.id)) || [];
        const solicitudesAccionables = solicitudesGestion.filter((solicitud) =>
          ["pendiente", "rechazada"].includes(String(solicitud.estado || "").toLowerCase())
        );
        const deudaPendiente = Number(gestion?.deudaPendiente || 0);
        const deudaTotal = Number(gestion?.deudaTotal || 0);
        const montoCierre =
          Number(gestion?.montoRegularizado || 0) + Number(gestion?.montoPago || 0);
        const montoTotal = deudaPendiente || deudaTotal || montoCierre;
        const documentos = [
          {
            key: "comprobante",
            label: "Comprobante de pago",
            href: gestion?.comprobantePago,
          },
          {
            key: "detalle",
            label: "Archivo de detalle",
            onClick: () => handleDownloadDetalle(gestion),
          },
          {
            key: "final",
            label: "Certificado final",
            href: gestion?.certificadoFinal,
          },
          {
            key: "inicial",
            label: "Certificado inicial",
            href: gestion?.certificadoInicial,
            primary: true,
          },
        ];

        return {
          gestion,
          documentos,
          montoTotal,
          deudaPendiente,
          deudaTotal,
          montoCierre,
          solicitudesGestion,
          solicitudesAccionables,
        };
      }),
    [gestiones, handleDownloadDetalle, solicitudesPorGestion]
  );

  const resumenBandeja = useMemo(() => {
    const pendientesCliente = gestionesEnriquecidas.reduce(
      (total, item) => total + item.solicitudesAccionables.length,
      0
    );
    const montoTotal = gestionesEnriquecidas.reduce(
      (total, item) => total + item.montoTotal,
      0
    );

    return {
      gestiones: gestionesEnriquecidas.length,
      pendientesCliente,
      montoTotal,
    };
  }, [gestionesEnriquecidas]);

  const handleRefresh = useCallback(() => {
    fetchGestiones();
    fetchSolicitudes();
  }, [fetchGestiones, fetchSolicitudes]);

  const openResponderSolicitud = useCallback((solicitud) => {
    setSolicitudActiva(solicitud);
    setRespuestaCliente("");
    setRespuestaArchivo(null);
  }, []);

  const toggleSolicitudDetalle = useCallback((solicitudId) => {
    setExpandedSolicitudId((current) => (current === solicitudId ? null : solicitudId));
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
      <main className="min-h-screen bg-[#f7f4fb] px-4 py-5 md:px-6 md:py-7">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
          <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-[clamp(2rem,2.3vw,2.85rem)] font-bold leading-tight tracking-normal text-[#06164b]">
                Bandeja de Gestiones
              </h1>
              <p className="mt-2 max-w-4xl text-base text-slate-600 md:text-lg">
                Monitorea y administra las solicitudes de Mora Presunta en tiempo real.
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
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-500"
              >
                <RiRefreshLine className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </section>

          {filtersOpen ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.2fr)_minmax(220px,0.8fr)_minmax(260px,1fr)]">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="mora-gestiones-empresa"
                    className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500"
                  >
                    Empresa
                  </label>
                  <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <RiBuildingLine className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <input
                      id="mora-gestiones-empresa"
                      type="text"
                      aria-label="Buscar empresa"
                      placeholder={
                        loadingEmpresas ? "Cargando empresas..." : "Busca por nombre o RUT"
                      }
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
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
                        <option key={empresa.rut} value={empresa.label} label={empresa.label}>
                          {empresa.label}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="mora-gestiones-entidad"
                    className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500"
                  >
                    Entidad
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <RiBankLine className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <select
                      id="mora-gestiones-entidad"
                      aria-label="Filtrar por entidad"
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
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
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Rango de fechas
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <RiCalendarLine className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    <DateRangePicker
                      value={dateRange}
                      onValueChange={setDateRange}
                      enableClear
                      aria-label="Filtrar por rango de fechas"
                      className="min-w-[220px]"
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Gestiones
              </p>
              <p className="mt-1 text-xl font-bold text-[#06164b]">
                {resumenBandeja.gestiones}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Solicitudes pendientes
              </p>
              <p className="mt-1 text-xl font-bold text-[#06164b]">
                {resumenBandeja.pendientesCliente}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Monto total
              </p>
              <p className="mt-1 text-xl font-bold text-[#06164b]">
                {formatCurrency(resumenBandeja.montoTotal)}
              </p>
            </div>
          </section>

          {!empresaSeleccionada ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                Selecciona una empresa para visualizar la bandeja de gestiones.
              </p>
            </section>
          ) : loadingGestiones ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
              Cargando gestiones...
            </section>
          ) : errorGestiones ? (
            <section className="rounded-[2rem] border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
              {errorGestiones}
            </section>
          ) : gestionesEnriquecidas.length === 0 ? (
            <section className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/70 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">Sin gestiones</p>
              <p className="text-sm text-slate-500">
                No hay gestiones registradas para los filtros seleccionados.
              </p>
            </section>
          ) : (
            <section className="space-y-5">
              {gestionesEnriquecidas.map((item) => {
                const { gestion, solicitudesGestion, solicitudesAccionables } = item;
                const estado = formatEstado(gestion.estado);
                const gestionCerrada = isGestionCerrada(gestion.estado);
                const montoResumenLabel = gestionCerrada ? "Regularizado" : "Pendiente";
                const montoResumenIconTone = gestionCerrada
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : "bg-blue-600 text-white shadow-blue-600/20";

                return (
                  <article
                    key={gestion.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-5"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400" />

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                            <h2 className="text-2xl font-black leading-tight tracking-normal text-[#06164b]">
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
                              className={`inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-sm ring-1 ${getEstadoTone(gestion.estado)}`}
                            >
                              {estado}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <RiBuildingLine className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Empresa</p>
                              <p className="mt-1 truncate text-base font-bold text-slate-950">
                                {gestion.empresa || gestion.empresaRut}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <RiBankLine className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Entidad</p>
                              <p className="mt-1 truncate text-base font-bold text-slate-950">
                                {gestion.entidad || "Sin entidad"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <RiUserLine className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Analista</p>
                              <p className="mt-1 truncate text-base text-slate-950">
                                {gestion.analista || "Sin analista"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <RiCalendarLine className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Fecha inicio</p>
                              <p className="mt-1 text-base text-slate-950">
                                {gestion.fechaGestion ? formatDate(gestion.fechaGestion) : "Sin fecha"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <aside className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_28px_rgba(15,23,42,0.06)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                              {montoResumenLabel}
                            </p>
                            <p className="mt-1 text-4xl font-black leading-none text-[#06164b]">
                              {formatCurrency(item.montoTotal)}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">CLP</p>
                          </div>
                          <span
                            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg ${montoResumenIconTone}`}
                          >
                            <RiMoneyDollarCircleLine className="h-6 w-6" />
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-xs text-slate-600">
                          <div className="rounded-xl border border-blue-100 bg-white px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-2 font-black uppercase tracking-wide text-slate-500">
                                <RiScales3Line className="h-4 w-4 text-blue-600" />
                                Casos judiciales
                              </span>
                              <span className="font-black text-[#06164b]">
                                {Number(gestion?.casosJudiciales || 0).toLocaleString("es-CL")}
                              </span>
                            </div>
                            <p className="mt-1 font-bold text-slate-500 xl:text-right">
                              {formatCurrency(gestion?.montoJudicial || 0)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-2 font-black uppercase tracking-wide text-slate-500">
                                <RiShieldCheckLine className="h-4 w-4 text-emerald-600" />
                                Casos no judiciales
                              </span>
                              <span className="font-black text-[#06164b]">
                                {Number(gestion?.casosNoJudiciales || 0).toLocaleString("es-CL")}
                              </span>
                            </div>
                            <p className="mt-1 font-bold text-slate-500 xl:text-right">
                              {formatCurrency(gestion?.montoNoJudicial || 0)}
                            </p>
                          </div>
                        </div>
                      </aside>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="mb-3 flex items-center gap-2 px-1">
                        <RiHistoryLine className="h-4 w-4 text-slate-500" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                          Ciclo de gestión
                        </p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <RiCalendarLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                              Registrada
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-950">
                              {gestion.fechaRegistro || gestion.createdAt
                                ? formatDate(gestion.fechaRegistro || gestion.createdAt)
                                : "Sin fecha"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <RiTimeLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                              Pasó a análisis
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-950">
                              {gestion.fechaAnalisis ? formatDate(gestion.fechaAnalisis) : "Pendiente"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <RiRefreshLine className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                              Tiempo de resolución
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#06164b]">
                              {gestion.fechaCierre
                                ? formatDurationHours(gestion.horasResolucionTotal)
                                : "En curso"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <section className="mt-6 rounded-2xl border border-slate-200 bg-[#f8f7fb] p-4 md:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <RiFileList3Line className="h-5 w-5" />
                          </span>
                          <h3 className="text-lg font-semibold tracking-normal text-[#06164b]">
                            Solicitudes de antecedentes
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {solicitudesAccionables.length > 0 ? (
                            <span className="rounded-full border border-amber-200 bg-amber-100 px-4 py-1 text-xs font-bold uppercase text-amber-800">
                              {solicitudesAccionables.length} requiere respuesta
                            </span>
                          ) : null}
                          <span className="rounded-full bg-slate-200 px-4 py-1 text-xs font-bold uppercase text-slate-700">
                            {solicitudesGestion.length} documento
                            {solicitudesGestion.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      {solicitudesAccionables.length > 0 ? (
                        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <RiAlarmWarningLine className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-bold text-amber-900">
                              Acción requerida del cliente
                            </p>
                            <p className="mt-1 text-sm leading-5 text-amber-800">
                              Previley necesita antecedentes para continuar esta gestión. Revisa el documento solicitado y adjunta la respuesta correspondiente.
                            </p>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {solicitudesGestion.length === 0 ? (
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm font-semibold text-slate-500 md:col-span-3">
                            No hay solicitudes de antecedentes asociadas a esta gestión.
                          </div>
                        ) : (
                          solicitudesGestion.map((solicitud) => {
                            const accionable = solicitudesAccionables.some(
                              (actual) => actual.id === solicitud.id
                            );
                            const solicitudLabel =
                              tipoSolicitudLabels[solicitud.tipoSolicitud] || solicitud.tipoSolicitud;
                            const isExpanded = expandedSolicitudId === solicitud.id;
                            return (
                              <div
                                key={solicitud.id}
                                className={
                                  accionable
                                    ? "rounded-2xl border border-amber-300 bg-amber-50/40 px-4 py-4 shadow-sm md:col-span-3"
                                    : "rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:shadow-md md:col-span-3"
                                }
                              >
                                {accionable ? (
                                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-center">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                                          Pendiente de respuesta
                                        </span>
                                        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${getEstadoTone(solicitud.estado)}`}>
                                          {formatEstado(solicitud.estado)}
                                        </span>
                                      </div>
                                      <h4 className="mt-3 text-lg font-bold text-[#06164b]">
                                        Adjuntar {solicitudLabel}
                                      </h4>
                                      {solicitud.mensaje ? (
                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                                          {solicitud.mensaje}
                                        </p>
                                      ) : (
                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                                          Necesitamos que adjuntes este antecedente para continuar con el análisis de la gestión.
                                        </p>
                                      )}
                                      {solicitud.solicitudArchivoUrl ? (
                                        <a
                                          href={solicitud.solicitudArchivoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
                                        >
                                          <RiFileDownloadLine className="h-4 w-4" />
                                          Ver documento enviado por Previley
                                          <RiExternalLinkLine className="h-4 w-4" />
                                        </a>
                                      ) : null}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openResponderSolicitud(solicitud)}
                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-500"
                                    >
                                      <RiFileUploadLine className="h-5 w-5" />
                                      Adjuntar respuesta
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-full">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                                          <RiCheckboxCircleLine className="h-6 w-6" />
                                        </span>
                                        <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-base font-bold text-slate-950">
                                              {solicitudLabel}
                                            </p>
                                            {solicitud.respuestaArchivoUrl ? (
                                              <a
                                                href={solicitud.respuestaArchivoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                              >
                                                Adjunto
                                                <RiExternalLinkLine className="h-3.5 w-3.5" />
                                              </a>
                                            ) : solicitud.respuestaArchivo ? (
                                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                Adjunto recibido
                                              </span>
                                            ) : null}
                                          </div>
                                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                            Respuesta recibida
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        {solicitud.fechaRespuesta ? (
                                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                            {formatDate(solicitud.fechaRespuesta)}
                                          </span>
                                        ) : null}
                                        <button
                                          type="button"
                                          onClick={() => toggleSolicitudDetalle(solicitud.id)}
                                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-black text-[#06164b] shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                                          aria-expanded={isExpanded}
                                        >
                                          {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                                          <RiArrowDownSLine
                                            className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`}
                                          />
                                        </button>
                                      </div>
                                    </div>

                                    {isExpanded ? (
                                      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 lg:grid-cols-2">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <RiQuestionAnswerLine className="h-4 w-4 text-blue-600" />
                                            Previley solicitó
                                          </div>
                                          <p className="mt-2 text-sm leading-5 text-slate-700">
                                            {compactText(
                                              solicitud.mensaje,
                                              "Sin mensaje registrado para esta solicitud."
                                            )}
                                          </p>
                                          {solicitud.solicitudArchivoUrl ? (
                                            <a
                                              href={solicitud.solicitudArchivoUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                                            >
                                              Documento de Previley
                                              <RiExternalLinkLine className="h-3.5 w-3.5" />
                                            </a>
                                          ) : null}
                                        </div>

                                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 px-4 py-3">
                                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <RiFileList3Line className="h-4 w-4 text-emerald-600" />
                                            Cliente respondió
                                          </div>
                                          <p className="mt-2 text-sm leading-5 text-slate-700">
                                            {compactText(
                                              solicitud.respuestaCliente,
                                              solicitud.respuestaArchivo || solicitud.respuestaArchivoUrl
                                                ? "El cliente adjuntó documentación sin comentario adicional."
                                                : "Sin respuesta registrada."
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </section>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2.5">
                        {item.documentos.map((documento) => {
                          const buttonClass = documento.primary
                            ? "border-[#06164b] bg-[#06164b] text-white shadow-sm hover:bg-blue-700"
                            : "border-slate-300 bg-white text-slate-700 shadow-sm hover:border-blue-600 hover:bg-blue-600 hover:text-white";

                          if (documento.onClick) {
                            return (
                              <button
                                key={documento.key}
                                type="button"
                                onClick={documento.onClick}
                                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${buttonClass}`}
                              >
                                <RiFileDownloadLine className="h-5 w-5" />
                                {documento.label}
                              </button>
                            );
                          }

                          if (!documento.href) {
                            return (
                              <button
                                key={documento.key}
                                type="button"
                                disabled
                                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-400"
                              >
                                <RiFileDownloadLine className="h-5 w-5" />
                                {documento.label}
                              </button>
                            );
                          }

                          return (
                            <a
                              key={documento.key}
                              href={documento.href}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition ${buttonClass}`}
                            >
                              <RiFileDownloadLine className="h-5 w-5" />
                              {documento.label}
                              <RiExternalLinkLine className="h-4 w-4" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>

      {solicitudActiva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/35 px-4 py-5 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 md:px-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#06164b]">
                Acción requerida
              </p>
              <h3 className="mt-2 text-[clamp(1.6rem,2vw,2.15rem)] font-black leading-tight tracking-normal text-[#06164b]">
                Adjuntar {tipoSolicitudLabels[solicitudActiva.tipoSolicitud] || solicitudActiva.tipoSolicitud}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                Este antecedente es necesario para que Previley pueda continuar con la gestión.
              </p>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-6">
              <div className="rounded-xl border border-amber-200 bg-white px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                  Solicitud de Previley
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700 md:text-base">
                  {solicitudActiva.mensaje ||
                    "Necesitamos que adjuntes el documento solicitado y agregues cualquier contexto relevante para revisar la gestión."}
                </p>
                {solicitudActiva.solicitudArchivoUrl ? (
                  <a
                    href={solicitudActiva.solicitudArchivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
                  >
                    <RiFileDownloadLine className="h-4 w-4" />
                    Ver documento enviado por Previley
                    <RiExternalLinkLine className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              <div>
                <label htmlFor="respuesta-solicitud-mora" className="text-base font-black text-[#06164b]">
                  Comentario para Previley
                </label>
                <textarea
                  id="respuesta-solicitud-mora"
                  value={respuestaCliente}
                  onChange={(event) => setRespuestaCliente(event.target.value)}
                  rows={3}
                  maxLength={4000}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej: Adjunto contrato firmado de los trabajadores solicitados."
                  disabled={enviandoRespuesta}
                />
              </div>

              <div>
                <label htmlFor="archivo-solicitud-mora" className="text-base font-black text-[#06164b]">
                  Documento adjunto
                </label>
                <label
                  htmlFor="archivo-solicitud-mora"
                  className="mt-2 flex min-h-[145px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-sky-50/20 px-5 py-6 text-center transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <RiFileUploadLine className="h-6 w-6" />
                  </span>
                  <span className="mt-4 max-w-full break-words text-lg font-black text-[#06164b]">
                    {respuestaArchivo ? respuestaArchivo.name : "Seleccionar archivo"}
                  </span>
                  <span className="mt-1 text-sm text-slate-500">
                    Adjunta el respaldo solicitado para cerrar esta solicitud.
                  </span>
                </label>
                <input
                  id="archivo-solicitud-mora"
                  type="file"
                  onChange={(event) => setRespuestaArchivo(event.target.files?.[0] || null)}
                  className="sr-only"
                  disabled={enviandoRespuesta}
                />
              </div>
            </div>

            <div className="shrink-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end md:px-6">
              <button
                type="button"
                onClick={closeResponderSolicitud}
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                disabled={enviandoRespuesta}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResponderSolicitud}
                disabled={enviandoRespuesta || (!respuestaCliente.trim() && !respuestaArchivo)}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {enviandoRespuesta ? "Enviando..." : "Enviar respuesta a Previley"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoraGestionesDashboard;
