"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiBuildingLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiDashboardLine,
  RiErrorWarningLine,
  RiFileTextLine,
  RiLineChartLine,
  RiReceiptLine,
  RiTimeLine,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import { usePrefacturas, usePrefacturasSummary } from "@/hooks/usePrefacturas";
import apiService from "@/app/api/apiService";
import StatusPill from "@/components/status/StatusPill";
import { formatCurrency } from "@/utils/formatters";
import {
  resolveServiceDefinition,
  resolveServiceKeyFromName,
} from "@/config/clientServices.config";

const DEFAULT_YEAR = 2026;

const DashboardPage = () => {
  const { data: session } = useSession();
  const nombre = session?.user?.nombre || "";
  const currentYear = new Date().getFullYear();
  const initialYear = currentYear >= DEFAULT_YEAR ? DEFAULT_YEAR : currentYear;

  const [executiveYear, setExecutiveYear] = useState(initialYear);
  const [executiveLoading, setExecutiveLoading] = useState(false);
  const [executiveError, setExecutiveError] = useState("");
  const [executiveData, setExecutiveData] = useState({
    services: [],
  });
  const [documentAlerts, setDocumentAlerts] = useState({
    missingDetalle: 0,
    missingCertificados: 0,
  });
  const [loadingDocumentAlerts, setLoadingDocumentAlerts] = useState(true);

  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const empresaRuts = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => empresa?.empresaRut || empresa?.empresas?.empresaRut)
        .filter(Boolean),
    [empresas]
  );

  const {
    data: empresasConServicios,
    loading: loadingServicios,
    servicesByType,
  } = useEmpresasServicios(empresas);

  const { summary, loading: loadingSummary } = usePrefacturasSummary({
    empresaRut: empresaRuts,
  });

  const {
    data: prefacturasRecientes,
    loading: loadingPrefacturas,
    refetch: refetchPrefacturas,
  } = usePrefacturas(
    { sortField: "fechaGeneracion", sortOrder: "desc" },
    { autoFetch: false, limit: 5 }
  );

  const {
    data: prefacturasAlertas,
    loading: loadingAlertas,
    refetch: refetchAlertas,
  } = usePrefacturas({}, { autoFetch: false, limit: 50 });

  useEffect(() => {
    const query = {
      limit: 5,
      sortField: "fechaGeneracion",
      sortOrder: "desc",
      light: true,
    };
    if (empresaRuts.length > 0) {
      query.empresaRut = empresaRuts;
    }
    refetchPrefacturas(query).catch(() => {});
  }, [empresaRuts, refetchPrefacturas]);

  useEffect(() => {
    const query = {
      limit: 50,
      sortField: "fechaGeneracion",
      sortOrder: "desc",
      light: true,
    };
    if (empresaRuts.length > 0) {
      query.empresaRut = empresaRuts;
    }
    refetchAlertas(query).catch(() => {});
  }, [empresaRuts, refetchAlertas]);

  const totalServiciosActivos = useMemo(() => {
    if (!empresasConServicios) return 0;
    const uniqueKeys = new Set();
    empresasConServicios.forEach((empresa) => {
      (empresa.serviciosAsignados || []).forEach((servicio) => {
        if (servicio?.serviceKey) {
          uniqueKeys.add(servicio.serviceKey);
        } else if (servicio?.nombre) {
          uniqueKeys.add(servicio.nombre);
        }
      });
    });
    return uniqueKeys.size;
  }, [empresasConServicios]);

  const pendingCount = summary.byStatus?.pendiente || 0;
  const paidCount = summary.byStatus?.pagada || 0;

  const loading =
    loadingEmpresas || loadingServicios || loadingSummary || loadingPrefacturas;

  const yearOptions = useMemo(() => {
    const years = [];
    const start = Math.max(2021, currentYear - 4);
    for (let year = currentYear; year >= start; year -= 1) {
      years.push(year);
    }
    if (!years.includes(DEFAULT_YEAR)) {
      years.push(DEFAULT_YEAR);
      years.sort((a, b) => b - a);
    }
    return years;
  }, [currentYear]);

  const alertas = useMemo(() => {
    const prefList = Array.isArray(prefacturasAlertas) ? prefacturasAlertas : [];
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const inSevenDays = new Date(startToday);
    inSevenDays.setDate(inSevenDays.getDate() + 7);

    const isFacturaOpen = (estado) => {
      const normalized = String(estado || "").toLowerCase();
      return !["pagada", "anulada", "cancelada"].includes(normalized);
    };

    let overdue = 0;
    let dueSoon = 0;
    let missingPrefPdf = 0;
    let missingFacturaPdf = 0;

    prefList.forEach((pref) => {
      const hasPrefPdf =
        pref.prefacturaPdfAvailable !== undefined
          ? Boolean(pref.prefacturaPdfAvailable)
          : Boolean(pref.prefacturaPdfUrl);
      if (!hasPrefPdf) {
        missingPrefPdf += 1;
      }
      const facturas = Array.isArray(pref.facturas) ? pref.facturas : [];
      facturas.forEach((factura) => {
        const hasFacturaPdf =
          factura?.pdfAvailable !== undefined
            ? Boolean(factura.pdfAvailable)
            : Boolean(factura?.pdfUrl);
        if (!hasFacturaPdf) {
          missingFacturaPdf += 1;
        }
        const vencimiento = factura?.fechaVencimiento
          ? new Date(factura.fechaVencimiento)
          : null;
        if (!vencimiento || Number.isNaN(vencimiento.getTime())) return;
        if (!isFacturaOpen(factura.estado)) return;
        if (vencimiento < startToday) overdue += 1;
        if (vencimiento >= startToday && vencimiento <= inSevenDays) dueSoon += 1;
      });
    });

    return {
      overdue,
      dueSoon,
      missingPrefPdf,
      missingFacturaPdf,
      missingCertificados: Number(documentAlerts.missingCertificados || 0),
      missingDetalle: Number(documentAlerts.missingDetalle || 0),
    };
  }, [prefacturasAlertas, documentAlerts]);

  useEffect(() => {
    let isActive = true;
    const fetchDocumentAlerts = async () => {
      if (!empresaRuts.length) {
        if (isActive) {
          setDocumentAlerts({ missingDetalle: 0, missingCertificados: 0 });
          setLoadingDocumentAlerts(false);
        }
        return;
      }
      setLoadingDocumentAlerts(true);
      try {
        const response = await apiService.get("/produccion/alerts", {
          params: {
            empresaRut: empresaRuts,
          },
        });
        if (isActive) {
          setDocumentAlerts(response?.data?.data || { missingDetalle: 0, missingCertificados: 0 });
        }
      } catch (error) {
        if (isActive) {
          console.error("Error al cargar alertas de documentos:", error);
          setDocumentAlerts({ missingDetalle: 0, missingCertificados: 0 });
        }
      } finally {
        if (isActive) {
          setLoadingDocumentAlerts(false);
        }
      }
    };

    fetchDocumentAlerts();

    return () => {
      isActive = false;
    };
  }, [empresaRuts]);

  useEffect(() => {
    let isActive = true;

    const fetchExecutiveSummary = async () => {
      if (!empresaRuts.length) {
        setExecutiveData({ services: [] });
        setExecutiveLoading(false);
        return;
      }

      setExecutiveLoading(true);
      setExecutiveError("");

      try {
        const response = await apiService.get("/prefacturas/dashboard/servicios", {
          params: {
            year: executiveYear,
            empresaRut: empresaRuts.join(","),
          },
        });

        if (isActive) {
          setExecutiveData({
            services: response?.data?.data || [],
          });
        }
      } catch (error) {
        if (isActive) {
          console.error("Error al cargar resumen ejecutivo:", error);
          setExecutiveError(
            error?.message || "No fue posible cargar el resumen ejecutivo."
          );
        }
      } finally {
        if (isActive) {
          setExecutiveLoading(false);
        }
      }
    };

    fetchExecutiveSummary();

    return () => {
      isActive = false;
    };
  }, [empresaRuts, executiveYear]);

  const executiveSummaryByKey = useMemo(() => {
    const map = new Map();
    (executiveData.services || []).forEach((item) => {
      const key =
        item?.serviceKey ||
        resolveServiceKeyFromName(item?.servicioNombre || "") ||
        resolveServiceKeyFromName(item?.servicioAbreviatura || "");
      if (key) map.set(key, item);
    });
    return map;
  }, [executiveData.services]);

  const executiveCards = useMemo(() => {
    if (!servicesByType.length) return [];
    return servicesByType.map((service) => {
      const definition =
        service.definition || resolveServiceDefinition(service.serviceKey);
      const summary =
        executiveSummaryByKey.get(service.serviceKey) ||
        (service.serviceKey === "mora"
          ? executiveSummaryByKey.get("mp-r")
          : null);
      const totalValue = Number(summary?.value || 0);
      const isCurrency = summary?.unit !== "count";
      return {
        key: service.serviceKey,
        title: summary?.label || definition?.label || service.serviceKey,
        mainValue: totalValue,
        label: summary?.metricLabel || "Total procesado",
        link: definition?.slug ? `/servicios/${definition.slug}` : "/servicios",
        isCurrency,
      };
    });
  }, [servicesByType, executiveSummaryByKey]);

  const prefacturasList = Array.isArray(prefacturasRecientes)
    ? prefacturasRecientes
    : [];

  return (
    <section className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(at_top_right,_#e2e8f0,_20%)] pb-20 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-2xl md:p-12">
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                <RiDashboardLine className="h-3 w-3" />
                Panel de Control
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Hola<span className="text-blue-600">{nombre ? `, ${nombre}` : ""}</span> 👋
              </h1>
              <p className="max-w-xl text-lg font-medium text-slate-500/90 leading-relaxed">
                Bienvenido de nuevo. Aquí tienes el balance actual de tus operaciones y prefacturación.
              </p>
            </div>

            <Link
              href="/servicios"
              className="group inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95"
            >
              Explorar Servicios
              <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"></div>
        </header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Empresas"
            value={loading ? "…" : empresas?.length || 0}
            icon={<RiBuildingLine className="h-5 w-5" />}
            color="blue"
            loading={loading}
          />
          <StatCard
            label="Servicios"
            value={loading ? "…" : totalServiciosActivos}
            icon={<RiLineChartLine className="h-5 w-5" />}
            color="indigo"
            loading={loading}
          />
          <StatCard
            label="Pendientes"
            value={loading ? "…" : pendingCount}
            icon={<RiTimeLine className="h-5 w-5" />}
            color="amber"
            loading={loading}
          />
          <StatCard
            label="Pagadas"
            value={loading ? "…" : paidCount}
            icon={<RiCheckboxCircleLine className="h-5 w-5" />}
            color="emerald"
            loading={loading}
          />
        </div>

        <section className="mt-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Resumen Ejecutivo</h2>
              <p className="mt-2 text-slate-500 font-medium">Análisis de rendimiento anual consolidado</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/60 p-1.5 shadow-sm backdrop-blur-md">
              <RiCalendarLine className="ml-3 h-4 w-4 text-slate-400" />
              <select
                value={executiveYear}
                onChange={(event) => setExecutiveYear(Number(event.target.value))}
                className="bg-transparent py-2 pl-1 pr-8 text-sm font-bold text-slate-700 focus:outline-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {executiveLoading ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-500 shadow-sm backdrop-blur">
              Construyendo el resumen ejecutivo...
            </div>
          ) : executiveError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {executiveError}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {executiveCards.map((card) => (
                <GlassCard
                  key={card.key}
                  title={card.title}
                  mainValue={card.mainValue}
                  label={card.label}
                  link={card.link}
                  isCurrency={card.isCurrency}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Alertas Accionables</h2>
            <p className="text-slate-500">Documentos y tareas que requieren tu atención inmediata.</p>
          </div>
          {loadingAlertas || loadingDocumentAlerts ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-slate-500 shadow-sm backdrop-blur">
              Analizando alertas...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AlertTile
                label="Facturas vencidas"
                count={alertas.overdue}
                icon={<RiErrorWarningLine className="h-5 w-5" />}
                urgent
                link="/prefacturas"
              />
              <AlertTile
                label="Por vencer"
                count={alertas.dueSoon}
                icon={<RiTimeLine className="h-5 w-5" />}
                link="/prefacturas"
              />
              <AlertTile
                label="PDFs pendientes"
                count={alertas.missingCertificados}
                icon={<RiFileTextLine className="h-5 w-5" />}
                link="/documentos"
              />
              <AlertTile
                label="Excels pendientes"
                count={alertas.missingDetalle}
                icon={<RiReceiptLine className="h-5 w-5" />}
                link="/documentos"
              />
            </div>
          )}
        </section>

        <section className="mt-20 overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/60 shadow-[0_15px_35px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white/40 px-10 py-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Prefacturas Recientes</h2>
              <p className="text-sm text-slate-500">Últimas prefacturas generadas.</p>
            </div>
            <Link
              href="/prefacturas"
              className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Ver Historial Completo <RiArrowRightUpLine className="h-4 w-4" />
            </Link>
          </div>
          {loadingPrefacturas ? (
            <div className="px-10 py-12 text-sm text-slate-500">Cargando prefacturas...</div>
          ) : prefacturasList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="px-10 py-5">Folio</th>
                    <th className="px-10 py-5">Empresa</th>
                    <th className="px-10 py-5">Estado</th>
                    <th className="px-10 py-5 text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {prefacturasList.map((pref) => (
                    <tr key={pref.id} className="group transition-colors hover:bg-blue-50/40">
                      <td className="px-10 py-6">
                        <Link
                          href={`/prefacturas/${pref.id}`}
                          className="font-bold text-blue-600 group-hover:underline"
                        >
                          #{pref.folio}
                        </Link>
                      </td>
                      <td className="px-10 py-6 text-sm font-medium text-slate-600">
                        {pref.empresaNombre || pref.empresaRut || "N/A"}
                      </td>
                      <td className="px-10 py-6">
                        <StatusPill estado={pref.estado} />
                      </td>
                      <td className="px-10 py-6 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(pref.totalFacturado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-10 py-12 text-sm text-slate-500">
              No se encontraron prefacturas recientes.
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

const StatCard = ({ label, value, icon, color, loading }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <div className="group rounded-3xl border border-white/60 bg-white/50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md backdrop-blur-sm">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${colors[color] || colors.blue}`}>
        {icon}
      </div>
      <p className="text-sm font-bold uppercase tracking-tight text-slate-400">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-3xl font-black text-slate-900">
          {loading ? (
            <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            value ?? 0
          )}
        </p>
      </div>
    </div>
  );
};

const GlassCard = ({ title, mainValue, label, link, isCurrency = true }) => (
  <div className="group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-sm transition-all hover:bg-white/80 backdrop-blur-sm">
    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600/80">{title}</h3>
    <div className="mt-8">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tighter text-slate-900">
        {isCurrency ? formatCurrency(mainValue) : mainValue || "—"}
      </p>
    </div>
    <Link
      href={link}
      className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors group-hover:text-blue-600"
    >
      Ver detalles <RiArrowRightLine className="h-3 w-3 transition-transform group-hover:translate-x-1" />
    </Link>
    <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-blue-50/50 blur-2xl transition-colors group-hover:bg-blue-100/50"></div>
  </div>
);

const AlertTile = ({ label, count, icon, urgent, link }) => (
  <div
    className={`rounded-3xl border p-6 transition-all ${
      urgent && count > 0
        ? "border-rose-100 bg-rose-50/50 shadow-[0_10px_30px_rgba(244,63,94,0.05)]"
        : "border-white bg-white/40"
    }`}
  >
    <div
      className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
        urgent && count > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
      }`}
    >
      {icon}
    </div>
    <p className="text-sm font-bold text-slate-500 tracking-tight">{label}</p>
    <p
      className={`mt-1 text-3xl font-black ${
        urgent && count > 0 ? "text-rose-600" : "text-slate-900"
      }`}
    >
      {count}
    </p>
    {link ? (
      <Link
        href={link}
        className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Ver detalle <RiArrowRightLine className="ml-1 h-3 w-3" />
      </Link>
    ) : null}
  </div>
);

export default DashboardPage;
