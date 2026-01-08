"use client";

import { useEffect, useMemo, useState } from "react";
import apiService from "@/app/api/apiService";
import {
  resolveServiceDefinition,
  resolveServiceKeyFromName,
} from "@/config/clientServices.config";
import { formatCurrency, formatDate } from "@/utils/formatters";

const estadoTone = {
  pendiente: "bg-amber-100 text-amber-700",
  validada: "bg-emerald-100 text-emerald-700",
  validado: "bg-emerald-100 text-emerald-700",
  rechazada: "bg-rose-100 text-rose-700",
  rechazado: "bg-rose-100 text-rose-700",
  corregida: "bg-sky-100 text-sky-700",
  corregido: "bg-sky-100 text-sky-700",
  "pre-facturada": "bg-indigo-100 text-indigo-700",
};

const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  return String(estado)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getEstadoClass = (estado) => {
  const normalized = String(estado || "").toLowerCase();
  return estadoTone[normalized] || "bg-slate-100 text-slate-700";
};

const buildDateParams = (dateRange, year) => {
  if (year) {
    return {
      fechaProduccion_inicio: `${year}-01-01`,
      fechaProduccion_termino: `${year}-12-31`,
    };
  }

  if (dateRange?.from || dateRange?.to) {
    return {
      fechaProduccion_inicio: dateRange?.from
        ? dateRange.from.toISOString().slice(0, 10)
        : undefined,
      fechaProduccion_termino: dateRange?.to
        ? dateRange.to.toISOString().slice(0, 10)
        : undefined,
    };
  }

  return {};
};

const resolveServicioId = (serviciosAsignados = [], serviceKey, definition) => {
  return (
    serviciosAsignados.find(
      (servicio) => {
        const nombre = String(servicio?.nombre || "");
        const normalized = nombre.toLowerCase();
        if (resolveServiceKeyFromName(nombre) === serviceKey) return true;
        if (definition?.label && normalized.includes(definition.label.toLowerCase())) {
          return true;
        }
        if (definition?.slug && normalized.includes(definition.slug.replace(/-/g, " "))) {
          return true;
        }
        return false;
      }
    )?.servicioId || null
  );
};

const ServiceTimeline = ({
  empresaRut,
  serviceKey,
  dateRange,
  year,
  limit = 12,
}) => {
  const [serviceId, setServiceId] = useState(null);
  const [loadingService, setLoadingService] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const serviceDefinition = useMemo(
    () => resolveServiceDefinition(serviceKey),
    [serviceKey]
  );

  useEffect(() => {
    let isActive = true;

    const fetchServiceId = async () => {
      if (!empresaRut || !serviceKey) {
        setServiceId(null);
        setItems([]);
        return;
      }

      setLoadingService(true);
      setError("");
      try {
        const response = await apiService.get(`/empresas/${empresaRut}/completa`);
        const payload = response?.data || {};
        const servicios = payload.serviciosAsignados || [];
        const resolvedId = resolveServicioId(servicios, serviceKey, serviceDefinition);

        if (!resolvedId) {
          throw new Error("No se encontró el servicio asignado para esta empresa.");
        }

        if (isActive) {
          setServiceId(resolvedId);
        }
      } catch (err) {
        if (isActive) {
          setServiceId(null);
          setItems([]);
          setError(
            err?.message || "No fue posible resolver el servicio para la empresa."
          );
        }
      } finally {
        if (isActive) {
          setLoadingService(false);
        }
      }
    };

    fetchServiceId();

    return () => {
      isActive = false;
    };
  }, [empresaRut, serviceKey, serviceDefinition]);

  useEffect(() => {
    let isActive = true;

    const fetchTimeline = async () => {
      if (!empresaRut || !serviceId) return;

      setLoadingTimeline(true);
      setError("");

      try {
        const params = {
          empresaRut,
          servicioId: serviceId,
          limit,
          ...buildDateParams(dateRange, year),
        };

        const response = await apiService.get("/produccion", { params });
        const payload = response?.data || {};
        const list = payload.data || [];

        if (isActive) {
          setItems(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isActive) {
          setItems([]);
          setError(
            err?.response?.data?.message ||
              "No fue posible cargar la trazabilidad del servicio."
          );
        }
      } finally {
        if (isActive) {
          setLoadingTimeline(false);
        }
      }
    };

    fetchTimeline();

    return () => {
      isActive = false;
    };
  }, [empresaRut, serviceId, dateRange, year, limit]);

  const loading = loadingService || loadingTimeline;

  if (!empresaRut || !serviceKey) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
            Trazabilidad de gestiones
          </h2>
          <p className="text-sm text-[color:var(--text-secondary)]">
            Línea de tiempo de producciones asociadas a{" "}
            {serviceDefinition?.label || "este servicio"}.
          </p>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] shadow-sm">
          {items.length} registros
        </span>
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-[color:var(--text-secondary)]">
          Cargando trazabilidad del servicio...
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-[color:var(--text-secondary)]">
          No hay gestiones registradas para el periodo seleccionado.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[color:var(--theme-primary)]" />
                <span className="flex-1 w-px bg-[color:var(--theme-soft)]" />
              </div>
              <div className="flex-1 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                      Producción #{item.id}
                    </p>
                    <p className="text-xs text-[color:var(--text-secondary)]">
                      {item.entidad || "Entidad no informada"} ·{" "}
                      {item.trabajador || "Trabajador no informado"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[color:var(--text-secondary)]">
                    <p>{formatDate(item.fechaProduccion)}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getEstadoClass(
                        item.estado
                      )}`}
                    >
                      {formatEstado(item.estado)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-[color:var(--text-secondary)]">
                    Monto regularizado
                  </div>
                  <div className="font-semibold text-[color:var(--text-primary)]">
                    {formatCurrency(item.montoRegularizado)}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {item.certificadoInicial && (
                    <a
                      href={item.certificadoInicial}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/70 bg-white px-3 py-1 font-semibold text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-soft)]"
                    >
                      Certificado inicial
                    </a>
                  )}
                  {item.certificadoFinal && (
                    <a
                      href={item.certificadoFinal}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/70 bg-white px-3 py-1 font-semibold text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-soft)]"
                    >
                      Certificado final
                    </a>
                  )}
                  {item.detalle && (
                    <a
                      href={item.detalle}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/70 bg-white px-3 py-1 font-semibold text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-soft)]"
                    >
                      Detalle
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ServiceTimeline;
