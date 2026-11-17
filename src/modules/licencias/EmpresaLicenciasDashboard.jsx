"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AreaChart, BarList } from "@tremor/react";
import {
  RiBuildingLine,
  RiCalendarCheckLine,
  RiGroupLine,
  RiTimeLine,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import useLicenciasCompanyDashboard from "@/hooks/useLicenciasCompanyDashboard";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";
import {
  buildLicenciasSectionHref,
  resolveRequiredEmpresa,
} from "@/services/licenciasWorkspace.mjs";
import LicenciasFinancialPanel from "./LicenciasFinancialPanel";

const number = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });
const formatNumber = (value) => number.format(Number(value || 0));
const formatPercent = (value) => `${percent.format(Number(value || 0))}%`;

const humanize = (value) => {
  const normalized = String(value || "sin estado")
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const MetricCard = ({ label, value, detail, icon: Icon }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </article>
);

const Panel = ({ title, description, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
    {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    {children}
  </section>
);

const CompanyRequired = () => (
  <section className="rounded-lg border border-blue-200 bg-blue-50 p-10 text-center">
    <RiBuildingLine className="mx-auto h-10 w-10 text-blue-700" />
    <h2 className="mt-4 text-xl font-semibold text-slate-950">Selecciona una empresa</h2>
    <p className="mt-2 text-sm text-slate-600">
      El dashboard operativo siempre corresponde a una empresa específica.
    </p>
  </section>
);

const RecentManagement = ({ rows, empresaRut }) => (
  <Panel title="Expedientes recientes" description="Las cinco gestiones más recientes de la empresa.">
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-3">Folio</th>
            <th className="px-3 py-3">Periodo</th>
            <th className="px-3 py-3">Estado</th>
            <th className="px-3 py-3 text-right">Licencias</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id || row.folio} className="border-b border-slate-100">
              <td className="px-3 py-3 font-semibold text-slate-900">{row.folio}</td>
              <td className="px-3 py-3 text-slate-600">{row.periodo}</td>
              <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{humanize(row.estado)}</span></td>
              <td className="px-3 py-3 text-right">{formatNumber(row.totalLicencias)}</td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">No hay expedientes recientes.</td></tr>
          )}
        </tbody>
      </table>
    </div>
    <Link
      href={buildLicenciasSectionHref("gestiones", { empresa: empresaRut })}
      className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:underline"
    >
      Ver todas las gestiones
    </Link>
  </Panel>
);

const EmpresaLicenciasDashboard = ({ initialEmpresaRut = "", requireExplicitSelection = false }) => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const empresaOptions = useMemo(
    () => [...(empresas || [])].sort((a, b) =>
      `${a.nombre} ${a.empresaRut}`.localeCompare(`${b.nombre} ${b.empresaRut}`, "es")
    ),
    [empresas]
  );
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");

  useEffect(() => {
    const resolved = resolveRequiredEmpresa(empresaOptions, initialEmpresaRut);
    if (resolved) {
      setEmpresaSeleccionada(resolved);
      return;
    }
    if (!requireExplicitSelection && empresaOptions.length) {
      setEmpresaSeleccionada(empresaOptions[0].empresaRut);
      return;
    }
    setEmpresaSeleccionada("");
  }, [empresaOptions, initialEmpresaRut, requireExplicitSelection]);

  const { data, loading, error, retry } = useLicenciasCompanyDashboard(empresaSeleccionada);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Dashboard Operativo</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Licencias médicas por empresa</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">Seguimiento de licencias, ausentismo, estados y balance financiero de una empresa.</p>
          </div>
          <label className="min-w-[300px] text-sm font-semibold text-slate-700">
            Empresa
            <select
              value={empresaSeleccionada}
              onChange={(event) => setEmpresaSeleccionada(event.target.value)}
              disabled={loadingEmpresas}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500"
            >
              <option value="">Selecciona una empresa</option>
              {empresaOptions.map((empresa) => (
                <option key={empresa.empresaRut} value={empresa.empresaRut}>{empresa.nombre} · {empresa.empresaRut}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {!empresaSeleccionada && !loadingEmpresas ? <CompanyRequired /> : null}
          {loading ? <DashboardMoraAnaliticoSkeleton /> : null}
          {error ? (
            <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
              <p>{error}</p>
              <button type="button" onClick={retry} className="mt-3 text-sm font-semibold underline">Reintentar</button>
            </section>
          ) : null}

          {data && !loading ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Licencias registradas" value={formatNumber(data.summary.totalLicencias)} detail="Expedientes visibles" icon={RiCalendarCheckLine} />
                <MetricCard label="Licencias vigentes" value={formatNumber(data.summary.licenciasVigentes)} detail="Autorizadas o en trámite" icon={RiTimeLine} />
                <MetricCard label="Trabajadores con licencia" value={formatNumber(data.summary.trabajadoresConLicencia)} detail="Personas distintas" icon={RiGroupLine} />
                <MetricCard label="Días de ausentismo" value={formatNumber(data.summary.totalDias)} detail="Acumulado de la empresa" icon={RiTimeLine} />
              </section>

              <LicenciasFinancialPanel financial={data.financial} />

              <section className="grid gap-6 lg:grid-cols-2">
                <Panel title="Distribución por estado" description="Situación de las licencias de la empresa.">
                  <BarList className="mt-6" data={data.states.map((item) => ({ name: humanize(item.estado), value: item.cantidad }))} valueFormatter={formatNumber} />
                </Panel>
                <Panel title="Rechazos y devoluciones" description="Tasas calculadas sobre las licencias visibles.">
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <MetricCard label="Tasa de rechazo" value={formatPercent(data.rates.tasaRechazo)} detail={`${formatNumber(data.rates.rechazadas)} licencias`} icon={RiTimeLine} />
                    <MetricCard label="Tasa de devolución" value={formatPercent(data.rates.tasaDevolucion)} detail={`${formatNumber(data.rates.devueltas)} licencias`} icon={RiTimeLine} />
                  </div>
                </Panel>
              </section>

              <Panel title="Evolución mensual" description="Licencias y días de ausentismo en el tiempo.">
                <AreaChart className="mt-6 h-72" data={data.evolution.map((item) => ({ periodo: item.periodo, Licencias: item.licencias, Días: item.dias }))} index="periodo" categories={["Licencias", "Días"]} colors={["blue", "amber"]} valueFormatter={formatNumber} />
              </Panel>

              <Panel title="Trabajadores con más días" description="Personas que concentran más días de licencia en la empresa.">
                <BarList className="mt-6" data={data.topWorkers.map((item) => ({ name: `${item.nombreTrabajador} · ${item.trabajadorRut}`, value: item.totalDias }))} valueFormatter={(value) => `${formatNumber(value)} días`} />
              </Panel>

              <RecentManagement rows={data.recentManagement} empresaRut={empresaSeleccionada} />
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
};

export default EmpresaLicenciasDashboard;
