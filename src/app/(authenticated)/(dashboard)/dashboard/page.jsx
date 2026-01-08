"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import {
  usePrefacturas,
  usePrefacturasSummary,
} from "@/hooks/usePrefacturas";
import apiService from "@/app/api/apiService";
import MetricCard from "@/components/dashboard/MetricCard";
import CompanyServicesCard from "@/components/dashboard/CompanyServicesCard";
import StatusPill from "@/components/status/StatusPill";
import { formatCurrency, formatDate } from "@/utils/formatters";

const DEFAULT_YEAR = 2025;

const DashboardPage = () => {
  const { data: session } = useSession();
  const nombre = session?.user?.nombre || "";
  const currentYear = new Date().getFullYear();
  const initialYear = currentYear >= DEFAULT_YEAR ? DEFAULT_YEAR : currentYear;
  const [executiveYear, setExecutiveYear] = useState(initialYear);
  const [executiveLoading, setExecutiveLoading] = useState(false);
  const [executiveError, setExecutiveError] = useState("");
  const [executiveData, setExecutiveData] = useState({
    mora: null,
    pagex: null,
    licencias: null,
  });

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
    };
    if (empresaRuts.length > 0) {
      query.empresaRut = empresaRuts;
    }
    refetchAlertas(query).catch(() => {});
  }, [empresaRuts, refetchAlertas]);

  const totalServiciosActivos = useMemo(() => {
    if (!empresasConServicios) return 0;
    return empresasConServicios.reduce(
      (acc, empresa) => acc + (empresa.serviciosAsignados?.length || 0),
      0
    );
  }, [empresasConServicios]);

  const pendingCount = summary.byStatus?.pendiente || 0;
  const billedCount = summary.byStatus?.facturada || 0;
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
      if (!pref.prefacturaPdfUrl) {
        missingPrefPdf += 1;
      }
      const facturas = Array.isArray(pref.facturas) ? pref.facturas : [];
      facturas.forEach((factura) => {
        if (!factura?.pdfUrl) {
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
    };
  }, [prefacturasAlertas]);

  useEffect(() => {
    let isActive = true;

    const fetchExecutiveSummary = async () => {
      if (!empresaRuts.length) {
        setExecutiveData({ mora: null, pagex: null, licencias: null });
        setExecutiveLoading(false);
        return;
      }

      const fechaInicio = `${executiveYear}-01-01`;
      const fechaFin = `${executiveYear}-12-31`;

      setExecutiveLoading(true);
      setExecutiveError("");

      try {
        const [moraResponse, pagexResponses, licenciasResponses] = await Promise.all([
          fetch(
            `/api/mora/operativo/indicadores?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
            { cache: "no-store" }
          ).then(async (response) => {
            const payload = await response.json();
            if (!response.ok) {
              throw new Error(payload?.message || "No fue posible cargar la mora presunta.");
            }
            return payload?.data ?? payload;
          }),
          Promise.all(
            empresaRuts.map((rut) =>
              apiService.get(`/pagex-dashboard/${rut}/resumen-financiero`, {
                params: { fechaInicio, fechaFin },
              })
            )
          ),
          Promise.all(
            empresaRuts.map((rut) =>
              apiService.get(`/licencia-dashboard/${rut}/evolucion-mensual`)
            )
          ),
        ]);

        const pagexTotals = pagexResponses.reduce(
          (acc, response) => {
            const data = response?.data?.data ?? response?.data ?? {};
            acc.totalSolicitado += Number(data.totalSolicitado || 0);
            acc.totalRecuperado += Number(data.totalRecuperado || 0);
            acc.totalPendiente += Number(data.totalPendiente || 0);
            return acc;
          },
          { totalSolicitado: 0, totalRecuperado: 0, totalPendiente: 0 }
        );

        const licenciasTotals = licenciasResponses.reduce(
          (acc, response) => {
            const rows = Array.isArray(response?.data)
              ? response.data
              : response?.data?.data || [];
            const rowsArray = Array.isArray(rows) ? rows : [];
            let empresaTieneLicencias = false;

            rowsArray.forEach((row) => {
              const dateValue = row?.mes || row?.periodo;
              if (!dateValue) return;
              const date = new Date(dateValue);
              if (Number.isNaN(date.getTime()) || date.getFullYear() !== executiveYear) {
                return;
              }
              const cantidad = Number(
                row?.cantidadLicencias ?? row?.cantidad ?? 0
              );
              const dias = Number(row?.totalDias || 0);
              if (cantidad > 0) {
                empresaTieneLicencias = true;
              }
              acc.totalLicencias += cantidad;
              acc.totalDias += dias;
            });

            if (empresaTieneLicencias) {
              acc.empresasConLicencias += 1;
            }

            return acc;
          },
          { totalLicencias: 0, totalDias: 0, empresasConLicencias: 0 }
        );

        if (isActive) {
          setExecutiveData({
            mora: moraResponse,
            pagex: pagexTotals,
            licencias: licenciasTotals,
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

  const formatNumber = (value) =>
    new Intl.NumberFormat("es-CL", {
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-6">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-elevated backdrop-blur">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
            Visión general
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Hola{nombre ? `, ${nombre}` : ""} 👋
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)] sm:text-base">
            Bienvenido al panel de clientes. Aquí encontrarás un resumen de tus
            empresas, servicios contratados y el estado de tus prefacturas.
          </p>
          <div className="mt-6">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--theme-primary-dark)]"
            >
              Ver detalle por servicio
              <span aria-hidden>→</span>
            </Link>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Empresas asociadas"
            value={loading ? "…" : empresas?.length || 0}
            helperText="Empresas vinculadas a tu usuario."
            tone="primary"
            icon="🏢"
          />
          <MetricCard
            label="Servicios activos"
            value={loading ? "…" : totalServiciosActivos}
            helperText="Cantidad de servicios habilitados."
            tone="info"
            icon="🧾"
          />
          <MetricCard
            label="Prefacturas pendientes"
            value={loading ? "…" : pendingCount}
            helperText="Aún en revisión o a la espera de facturar."
            tone="warning"
            icon="⏳"
          />
          <MetricCard
            label="Prefacturas pagadas"
            value={loading ? "…" : paidCount}
            helperText="Prefacturas cerradas y conciliadas."
            tone="success"
            icon="✅"
          />
        </div>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                Servicios por empresa
              </h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Revisa el detalle de los servicios contratados por cada empresa.
              </p>
            </div>
          </div>

          {loadingServicios ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              Cargando información de servicios...
            </div>
          ) : empresasConServicios && empresasConServicios.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {empresasConServicios.map((empresa) => (
                <CompanyServicesCard key={empresa.empresaRut} empresa={empresa} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              Aún no hay servicios asociados a tus empresas.
            </div>
          )}
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                Resumen ejecutivo {executiveYear}
              </h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Panorama anual por servicio para todas tus empresas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
                Año
              </span>
              <select
                value={executiveYear}
                onChange={(event) => setExecutiveYear(Number(event.target.value))}
                className="rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold text-[color:var(--text-primary)] shadow-sm backdrop-blur"
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
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              Construyendo el resumen ejecutivo...
            </div>
          ) : executiveError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {executiveError}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Mora Presunta
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                  Regularizado y pagado durante el año.
                </p>
                <div className="mt-4 space-y-2 text-sm text-[color:var(--text-primary)]">
                  <div className="flex items-center justify-between">
                    <span>Regularizado</span>
                    <span className="font-semibold">
                      {executiveData.mora
                        ? formatCurrency(executiveData.mora.totalRegularizado)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pagado</span>
                    <span className="font-semibold">
                      {executiveData.mora
                        ? formatCurrency(executiveData.mora.totalPagado)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[color:var(--text-secondary)]">
                    <span>Recuperado total</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">
                      {executiveData.mora
                        ? formatCurrency(executiveData.mora.totalRecuperado)
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/servicios/mora-presunta?tab=dashboard-global"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Ver dashboard global →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Pagos en Exceso
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                  Recuperación acumulada del año.
                </p>
                <div className="mt-4 space-y-2 text-sm text-[color:var(--text-primary)]">
                  <div className="flex items-center justify-between">
                    <span>Recuperado</span>
                    <span className="font-semibold">
                      {executiveData.pagex
                        ? formatCurrency(executiveData.pagex.totalRecuperado)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Solicitado</span>
                    <span className="font-semibold">
                      {executiveData.pagex
                        ? formatCurrency(executiveData.pagex.totalSolicitado)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[color:var(--text-secondary)]">
                    <span>Pendiente</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">
                      {executiveData.pagex
                        ? formatCurrency(executiveData.pagex.totalPendiente)
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/servicios/pagos-en-exceso?tab=dashboard-global"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Ver dashboard global →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Licencias Médicas
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                  Volumen tramitado en el año.
                </p>
                <div className="mt-4 space-y-2 text-sm text-[color:var(--text-primary)]">
                  <div className="flex items-center justify-between">
                    <span>Licencias tramitadas</span>
                    <span className="font-semibold">
                      {executiveData.licencias
                        ? formatNumber(executiveData.licencias.totalLicencias)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Días totales</span>
                    <span className="font-semibold">
                      {executiveData.licencias
                        ? formatNumber(executiveData.licencias.totalDias)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[color:var(--text-secondary)]">
                    <span>Empresas con licencias</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">
                      {executiveData.licencias
                        ? formatNumber(executiveData.licencias.empresasConLicencias)
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href="/servicios/licencias-medicas?tab=dashboard-global"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Ver dashboard global →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                Alertas accionables
              </h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Tareas pendientes y documentos que requieren atención.
              </p>
            </div>
          </div>

          {loadingAlertas ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              Analizando alertas...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Facturas vencidas
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {alertas.overdue}
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  Requieren seguimiento inmediato.
                </p>
                <div className="mt-4">
                  <Link
                    href="/prefacturas"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Ver prefacturas →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Facturas por vencer
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {alertas.dueSoon}
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  Vencen en los próximos 7 días.
                </p>
                <div className="mt-4">
                  <Link
                    href="/prefacturas"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Revisar vencimientos →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Prefacturas sin PDF
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {alertas.missingPrefPdf}
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  Adjuntos principales faltantes.
                </p>
                <div className="mt-4">
                  <Link
                    href="/documentos"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Ir a documentos →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Facturas sin PDF
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {alertas.missingFacturaPdf}
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  Revisa documentación pendiente.
                </p>
                <div className="mt-4">
                  <Link
                    href="/documentos"
                    className="text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                  >
                    Revisar adjuntos →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                Prefacturas recientes
              </h2>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Últimas prefacturas generadas ordenadas de más recientes a más antiguas.
              </p>
            </div>
            <Link
              href="/prefacturas"
              className="text-sm font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
            >
              Ver todas →
            </Link>
          </div>

          {loadingPrefacturas ? (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              Cargando prefacturas...
            </div>
          ) : prefacturasRecientes && prefacturasRecientes.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-sm backdrop-blur">
              <table className="min-w-full divide-y divide-white/60 text-sm">
                <thead className="bg-white/70 text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Folio
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Empresa
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Total
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Generada
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/50 bg-white/80 text-[color:var(--text-primary)]">
                  {prefacturasRecientes.map((prefactura) => (
                    <tr key={prefactura.id} className="hover:bg-[color:var(--theme-soft)]/60">
                      <td className="px-4 py-3 font-semibold">
                        <Link
                          href={`/prefacturas/${prefactura.id}`}
                          className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                        >
                          {prefactura.folio}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                        {prefactura.empresaNombre || prefactura.empresaRut}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill estado={prefactura.estado} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        {formatCurrency(prefactura.totalFacturado)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[color:var(--text-secondary)]">
                        {formatDate(prefactura.fechaGeneracion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/60 bg-white/80 p-6 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              No se encontraron prefacturas recientes.
            </div>
          )}

          {!loading && billedCount > 0 && (
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
              <span className="font-semibold text-[color:var(--theme-primary)]">
                {billedCount}
              </span>{" "}
              prefacturas se encuentran facturadas durante el período actual.
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default DashboardPage;
