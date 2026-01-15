// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { 
//   FileText, 
//   Calendar, 
//   User, 
//   Building2, 
//   ExternalLink, 
//   AlertCircle, 
//   Loader2,
//   Inbox,
//   History,
//   TrendingUp
// } from "lucide-react";
// import apiService from "@/app/api/apiService";
// import {
//   resolveServiceDefinition,
//   resolveServiceKeyFromName,
// } from "@/config/clientServices.config";
// import { formatCurrency, formatDate } from "@/utils/formatters";

// const FILES_BASE_URL =
//   process.env.NEXT_PUBLIC_FILES_BASE_URL ||
//   "https://previley-app-files.s3.us-east-1.amazonaws.com";

// const resolveFileUrl = (value) => {
//   if (!value) return null;
//   if (value.startsWith("http://") || value.startsWith("https://")) {
//     return value;
//   }
//   if (value.startsWith("s3://")) {
//     const cleaned = value.replace("s3://", "");
//     const parts = cleaned.split("/");
//     parts.shift();
//     return `${FILES_BASE_URL}/${parts.join("/")}`;
//   }
//   if (value.startsWith("/")) return value;
//   return `${FILES_BASE_URL}/${value}`;
// };

// /**
//  * CONFIGURACIÓN DE ESTILOS Y TEMAS
//  */
// const estadoTone = {
//   pendiente: "bg-amber-50 text-amber-600 border-amber-200",
//   validada: "bg-emerald-50 text-emerald-600 border-emerald-200",
//   validado: "bg-emerald-50 text-emerald-600 border-emerald-200",
//   rechazada: "bg-rose-50 text-rose-600 border-rose-200",
//   rechazado: "bg-rose-50 text-rose-600 border-rose-200",
//   corregida: "bg-sky-50 text-sky-600 border-sky-200",
//   corregido: "bg-sky-50 text-sky-600 border-sky-200",
//   "pre-facturada": "bg-indigo-50 text-indigo-600 border-indigo-200",
// };

// /**
//  * FUNCIONES AUXILIARES DE FORMATO
//  */
// const formatEstado = (estado) => {
//   if (!estado) return "Sin estado";
//   return String(estado)
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (char) => char.toUpperCase());
// };

// const getEstadoClass = (estado) => {
//   const normalized = String(estado || "").toLowerCase();
//   return estadoTone[normalized] || "bg-slate-50 text-slate-600 border-slate-200";
// };

// const buildDateParams = (dateRange, year) => {
//   if (year) {
//     return {
//       fechaProduccion_inicio: `${year}-01-01`,
//       fechaProduccion_termino: `${year}-12-31`,
//     };
//   }
//   if (dateRange?.from || dateRange?.to) {
//     return {
//       fechaProduccion_inicio: dateRange?.from ? dateRange.from.toISOString().slice(0, 10) : undefined,
//       fechaProduccion_termino: dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : undefined,
//     };
//   }
//   return {};
// };

// const resolveServicioId = (serviciosAsignados = [], serviceKey, definition) => {
//   return (
//     serviciosAsignados.find((servicio) => {
//       const nombre = String(servicio?.nombre || "");
//       const normalized = nombre.toLowerCase();
//       if (resolveServiceKeyFromName(nombre) === serviceKey) return true;
//       if (definition?.label && normalized.includes(definition.label.toLowerCase())) return true;
//       if (definition?.slug && normalized.includes(definition.slug.replace(/-/g, " "))) return true;
//       return false;
//     })?.servicioId || null
//   );
// };

// /**
//  * COMPONENTE PRINCIPAL
//  */
// const ServiceTimeline = ({
//   empresaRut,
//   serviceKey,
//   dateRange,
//   year,
//   limit = 12,
// }) => {
//   const [serviceId, setServiceId] = useState(null);
//   const [loadingService, setLoadingService] = useState(false);
//   const [loadingTimeline, setLoadingTimeline] = useState(false);
//   const [items, setItems] = useState([]);
//   const [error, setError] = useState("");

//   const serviceDefinition = useMemo(
//     () => resolveServiceDefinition(serviceKey),
//     [serviceKey]
//   );

//   // EFECTO 1: Resolver el Service ID según la empresa
//   useEffect(() => {
//     let isActive = true;
//     const fetchServiceId = async () => {
//       if (!empresaRut || !serviceKey) {
//         setServiceId(null);
//         setItems([]);
//         return;
//       }
//       setLoadingService(true);
//       setError("");
//       try {
//         const response = await apiService.get(`/empresas/${empresaRut}/completa`);
//         const payload = response?.data || {};
//         const servicios = payload.serviciosAsignados || [];
//         const resolvedId = resolveServicioId(servicios, serviceKey, serviceDefinition);

//         if (!resolvedId) throw new Error("Servicio no asignado a esta empresa.");
//         if (isActive) setServiceId(resolvedId);
//       } catch (err) {
//         if (isActive) {
//           setServiceId(null);
//           setItems([]);
//           setError(err?.message || "Error al resolver el servicio.");
//         }
//       } finally {
//         if (isActive) setLoadingService(false);
//       }
//     };
//     fetchServiceId();
//     return () => { isActive = false; };
//   }, [empresaRut, serviceKey, serviceDefinition]);

//   // EFECTO 2: Cargar la línea de tiempo (Producción)
//   useEffect(() => {
//     let isActive = true;
//     const fetchTimeline = async () => {
//       if (!empresaRut || !serviceId) return;
//       setLoadingTimeline(true);
//       setError("");
//       try {
//         const params = {
//           empresaRut,
//           servicioId: serviceId,
//           limit,
//           ...buildDateParams(dateRange, year),
//         };
//         const response = await apiService.get("/produccion", { params });
//         const list = response?.data?.data || [];
//         if (isActive) setItems(Array.isArray(list) ? list : []);
//       } catch (err) {
//         if (isActive) {
//           setItems([]);
//           setError(err?.response?.data?.message || "Error al cargar la trazabilidad.");
//         }
//       } finally {
//         if (isActive) setLoadingTimeline(false);
//       }
//     };
//     fetchTimeline();
//     return () => { isActive = false; };
//   }, [empresaRut, serviceId, dateRange, year, limit]);

//   const loading = loadingService || loadingTimeline;

//   if (!empresaRut || !serviceKey) return null;

//   return (
//     <section className="rounded-[2rem] border border-slate-200 bg-white/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md">
//       {/* HEADER DEL COMPONENTE */}
//       <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
//         <div className="flex items-center gap-4">
//           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
//             <History size={24} />
//           </div>
//           <div>
//             <h2 className="text-xl font-bold tracking-tight text-slate-800">
//               Trazabilidad de gestiones
//             </h2>
//             <p className="text-sm text-slate-500">
//               Historial de <span className="font-semibold text-blue-600">{serviceDefinition?.label || "servicio"}</span>
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
//           <span className="relative flex h-2 w-2">
//             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
//             <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
//           </span>
//           {items.length} Registros
//         </div>
//       </div>

//       {/* ESTADOS DE CARGA Y ERROR */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <Loader2 className="h-10 w-10 animate-spin text-blue-500 opacity-20" />
//           <p className="mt-4 text-sm font-medium text-slate-400">Sincronizando datos...</p>
//         </div>
//       ) : error ? (
//         <div className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-rose-700">
//           <div className="rounded-full bg-rose-100 p-2 text-rose-600">
//             <AlertCircle size={20} />
//           </div>
//           <p className="text-sm font-medium">{error}</p>
//         </div>
//       ) : items.length === 0 ? (
//         <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
//           <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
//             <Inbox className="h-8 w-8 text-slate-300" />
//           </div>
//           <p className="text-lg font-semibold text-slate-600">Sin movimientos</p>
//           <p className="max-w-[240px] text-sm text-slate-400">
//             No se encontraron registros de producción para los filtros seleccionados.
//           </p>
//         </div>
//       ) : (
//         /* LISTADO DE LÍNEA DE TIEMPO */
//         <div className="relative space-y-2 pr-2">
//           {/* Línea decorativa lateral */}
//           <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-blue-200 via-slate-100 to-transparent" />

//           {items.map((item) => (
//             <div key={item.id} className="group relative flex gap-6 pb-8 last:pb-2">
//               {/* Punto en la línea de tiempo */}
//               <div className="relative z-10 flex flex-col items-center">
//                 <div className="mt-2.5 h-[28px] w-[28px] rounded-full border-[6px] border-white bg-slate-200 shadow-sm transition-all duration-300 group-hover:bg-blue-500 group-hover:scale-110" />
//               </div>

//               {/* Tarjeta de información */}
//               <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
//                 <div className="flex flex-wrap items-start justify-between gap-4">
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-3">
//                       <span className="text-xs font-black uppercase tracking-tighter text-slate-400 group-hover:text-blue-500">
//                         Registro #{item.id}
//                       </span>
//                       <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${getEstadoClass(item.estado)}`}>
//                         {formatEstado(item.estado)}
//                       </span>
//                     </div>

//                     <div className="space-y-1.5">
//                       <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
//                         <Building2 size={16} className="text-slate-400" />
//                         {item.entidad || "Entidad no informada"}
//                       </div>
//                       <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
//                         <User size={16} className="text-slate-300" />
//                         {item.trabajador || "Trabajador no especificado"}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex flex-col items-end gap-2">
//                     <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
//                       <Calendar size={14} />
//                       {formatDate(item.fechaProduccion)}
//                     </div>
//                     <div className="flex flex-col items-end rounded-2xl bg-slate-50 px-4 py-2 border border-slate-100">
//                       <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
//                         <TrendingUp size={10} /> Monto
//                       </span>
//                       <span className="text-lg font-black text-slate-800 tabular-nums">
//                         {formatCurrency(item.montoRegularizado)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Acciones / Documentos */}
//                 <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-50 pt-4">
//                   {[
//                     { label: "Certificado Inicial", url: resolveFileUrl(item.certificadoInicial) },
//                     { label: "Certificado Final", url: resolveFileUrl(item.certificadoFinal) },
//                     { label: "Ver Detalle", url: resolveFileUrl(item.detalle) },
//                     {
//                       label: "Comprobante de pago",
//                       url: resolveFileUrl(
//                         item.comprobantePago ||
//                           item.comprobanteUrl ||
//                           item.comprobante ||
//                           item.comprobante_pago
//                       ),
//                     },
//                   ].map((btn, i) => btn.url && (
//                     <a
//                       key={i}
//                       href={btn.url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="group/btn flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
//                     >
//                       <FileText size={14} className="text-slate-400 group-hover/btn:text-blue-500" />
//                       {btn.label}
//                       <ExternalLink size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// };

// export default ServiceTimeline;


// NUEVO:
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  ExternalLink, 
  AlertCircle, 
  Loader2,
  Inbox,
  History,
  TrendingUp,
  CreditCard,
  Receipt
} from "lucide-react";
import apiService from "@/app/api/apiService";
import {
  resolveServiceDefinition,
  resolveServiceKeyFromName,
} from "@/config/clientServices.config";
import { formatCurrency, formatDate } from "@/utils/formatters";

const FILES_BASE_URL =
  process.env.NEXT_PUBLIC_FILES_BASE_URL ||
  "https://previley-app-files.s3.us-east-1.amazonaws.com";

const resolveFileUrl = (value) => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("s3://")) {
    const cleaned = value.replace("s3://", "");
    const parts = cleaned.split("/");
    parts.shift();
    return `${FILES_BASE_URL}/${parts.join("/")}`;
  }
  if (value.startsWith("/")) return value;
  return `${FILES_BASE_URL}/${value}`;
};

/**
 * CONFIGURACIÓN DE ESTILOS Y TEMAS MEJORADA
 * Se ajustaron los colores a escala 700 para mejor contraste (Accesibilidad)
 */
const estadoTone = {
  // Procesos iniciales
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  
  // Validaciones (Maneja ambos géneros)
  validada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  validado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  
  // Errores
  rechazada: "bg-rose-50 text-rose-700 border-rose-200",
  rechazado: "bg-rose-50 text-rose-700 border-rose-200",
  
  // Correcciones
  corregida: "bg-sky-50 text-sky-700 border-sky-200",
  corregido: "bg-sky-50 text-sky-700 border-sky-200",
  
  // Estados Financieros
  "pre-facturada": "bg-indigo-50 text-indigo-700 border-indigo-200",
  facturada: "bg-violet-50 text-violet-700 border-violet-200",
  facturado: "bg-violet-50 text-violet-700 border-violet-200",
  pagada: "bg-teal-50 text-teal-700 border-teal-200",
  pagado: "bg-teal-50 text-teal-700 border-teal-200",
};

/**
 * FUNCIONES AUXILIARES DE FORMATO
 */
const formatEstado = (estado) => {
  if (!estado) return "Sin estado";
  return String(estado)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getEstadoClass = (estado) => {
  if (!estado) return "bg-slate-50 text-slate-600 border-slate-200";
  const normalized = String(estado).toLowerCase().trim();
  return estadoTone[normalized] || "bg-slate-50 text-slate-600 border-slate-200";
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
      fechaProduccion_inicio: dateRange?.from ? dateRange.from.toISOString().slice(0, 10) : undefined,
      fechaProduccion_termino: dateRange?.to ? dateRange.to.toISOString().slice(0, 10) : undefined,
    };
  }
  return {};
};

const resolveServicioId = (serviciosAsignados = [], serviceKey, definition) => {
  return (
    serviciosAsignados.find((servicio) => {
      const nombre = String(servicio?.nombre || "");
      const normalized = nombre.toLowerCase();
      if (resolveServiceKeyFromName(nombre) === serviceKey) return true;
      if (definition?.label && normalized.includes(definition.label.toLowerCase())) return true;
      if (definition?.slug && normalized.includes(definition.slug.replace(/-/g, " "))) return true;
      return false;
    })?.servicioId || null
  );
};

/**
 * COMPONENTE PRINCIPAL
 */
const ServiceTimeline = ({
  empresaRut,
  serviceKey,
  dateRange,
  year,
  limit = 12,
  entidadId,
  onEntitiesResolved,
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

        if (!resolvedId) throw new Error("Servicio no asignado a esta empresa.");
        if (isActive) setServiceId(resolvedId);
      } catch (err) {
        if (isActive) {
          setServiceId(null);
          setItems([]);
          setError(err?.message || "Error al resolver el servicio.");
        }
      } finally {
        if (isActive) setLoadingService(false);
      }
    };
    fetchServiceId();
    return () => { isActive = false; };
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
          ...(entidadId ? { entidadId } : {}),
        };
        const response = await apiService.get("/produccion", { params });
        const list = response?.data?.data || [];
        if (isActive) {
          const safeList = Array.isArray(list) ? list : [];
          setItems(safeList);
          if (typeof onEntitiesResolved === "function") {
            const byId = new Map();
            safeList.forEach((item) => {
              const value = item?.entidadId != null ? String(item.entidadId) : "";
              if (!value || byId.has(value)) return;
              byId.set(value, {
                value,
                label: item?.entidad || item?.entidadNombre || "Entidad sin nombre",
              });
            });
            onEntitiesResolved(Array.from(byId.values()));
          }
        }
      } catch (err) {
        if (isActive) {
          setItems([]);
          setError(err?.response?.data?.message || "Error al cargar la trazabilidad.");
        }
      } finally {
        if (isActive) setLoadingTimeline(false);
      }
    };
    fetchTimeline();
    return () => { isActive = false; };
  }, [empresaRut, serviceId, dateRange, year, limit, entidadId]);

  const loading = loadingService || loadingTimeline;

  if (!empresaRut || !serviceKey) return null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/60 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-md">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Trazabilidad de gestiones
            </h2>
            <p className="text-sm text-slate-500">
              Historial de <span className="font-semibold text-blue-600">{serviceDefinition?.label || "servicio"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
          {items.length} Registros
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 opacity-20" />
          <p className="mt-4 text-sm font-medium text-slate-400">Sincronizando datos...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-5 text-rose-700">
          <AlertCircle size={20} className="text-rose-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <Inbox className="h-8 w-8 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-600">Sin movimientos</p>
          <p className="text-sm text-slate-400">No hay registros de producción disponibles.</p>
        </div>
      ) : (
        <div className="relative space-y-2 pr-2">
          <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-blue-200 via-slate-100 to-transparent" />

          {items.map((item) => (
            <div key={item.id} className="group relative flex gap-6 pb-8 last:pb-2">
              <div className="relative z-10 flex flex-col items-center">
                <div className="mt-2.5 h-[28px] w-[28px] rounded-full border-[6px] border-white bg-slate-200 shadow-sm transition-all duration-300 group-hover:bg-blue-500 group-hover:scale-110" />
              </div>

              <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-tighter text-slate-400 group-hover:text-blue-500">
                        Registro #{item.id}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ${getEstadoClass(item.estado)}`}>
                        {formatEstado(item.estado)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
                        <Building2 size={16} className="text-slate-400" />
                        {item.entidad || "Entidad no informada"}
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500">
                        <User size={16} className="text-slate-300" />
                        {item.trabajador || "Trabajador no especificado"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Calendar size={14} />
                      {formatDate(item.fechaProduccion)}
                    </div>
                    <div className="flex flex-col items-end rounded-2xl bg-slate-50 px-4 py-2 border border-slate-100">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                        <TrendingUp size={10} /> Monto
                      </span>
                      <span className="text-lg font-black text-slate-800 tabular-nums">
                        {formatCurrency(item.montoRegularized || item.montoRegularizado)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-50 pt-4">
                  {[
                    { label: "Certificado Inicial", url: resolveFileUrl(item.certificadoInicial), icon: FileText },
                    { label: "Certificado Final", url: resolveFileUrl(item.certificadoFinal), icon: FileText },
                    { label: "Ver Detalle", url: resolveFileUrl(item.detalle), icon: FileText },
                    { 
                      label: "Comprobante Pago", 
                      url: resolveFileUrl(item.comprobantePago || item.comprobanteUrl || item.comprobante_pago),
                      icon: Receipt 
                    },
                  ].map((btn, i) => btn.url && (
                    <a
                      key={i}
                      href={btn.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group/btn flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <btn.icon size={14} className="text-slate-400 group-hover/btn:text-blue-500" />
                      {btn.label}
                      <ExternalLink size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </a>
                  ))}
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
