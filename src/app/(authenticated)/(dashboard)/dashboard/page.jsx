"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { useEmpresasServicios } from "@/hooks/useEmpresasServicios";
import {
  usePrefacturas,
  usePrefacturasSummary,
} from "@/hooks/usePrefacturas";
import MetricCard from "@/components/dashboard/MetricCard";
import CompanyServicesCard from "@/components/dashboard/CompanyServicesCard";
import StatusPill from "@/components/status/StatusPill";
import { formatCurrency, formatDate } from "@/utils/formatters";

const DashboardPage = () => {
  const { data: session } = useSession();
  const nombre = session?.user?.nombre || "";

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
