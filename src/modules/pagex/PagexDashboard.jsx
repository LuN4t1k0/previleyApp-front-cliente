"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DateRangePicker,
  BarChart,
  DonutChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import {
  RiBuildingLine,
  RiCalendarLine,
  RiRefreshLine,
  RiInformationLine,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import apiService from "@/app/api/apiService";
import DashboardMoraAnaliticoSkeleton from "@/components/skeleton/DashboardMoraAnaliticoSkeleton";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const formatPercentage = (value) =>
  `${Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "0.0"}%`;

const buildDateParams = (range) => {
  if (!range?.from || !range?.to) return {};
  const fechaInicio = range.from.toISOString().split("T")[0];
  const fechaFin = range.to.toISOString().split("T")[0];
  return { fechaInicio, fechaFin };
};

const EmptyState = ({ message }) => (
  <section className="rounded-3xl border border-white/70 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
    <RiInformationLine className="mx-auto h-12 w-12 text-[color:var(--theme-primary)]" />
    <h2 className="mt-4 text-2xl font-semibold text-[color:var(--text-primary)]">
      Selecciona una empresa
    </h2>
    <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{message}</p>
  </section>
);

const ChartEmpty = ({ message }) => (
  <div className="mt-6 rounded-2xl border border-dashed border-white/60 bg-white/70 p-6 text-center text-sm text-[color:var(--text-secondary)]">
    {message}
  </div>
);

const MetricCard = ({ label, value, helper, highlight }) => (
  <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:shadow-md">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
      {value}
    </p>
    {helper && (
      <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
        {helper}
      </p>
    )}
    {highlight && (
      <p className="mt-1 text-xs font-semibold text-[color:var(--theme-primary)]">
        {highlight}
      </p>
    )}
  </div>
);

const PagexDashboard = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastEmpresaLabel = useRef("");
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const [loadingDatos, setLoadingDatos] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [resumenFinanciero, setResumenFinanciero] = useState(null);
  const [casosEstado, setCasosEstado] = useState(null);
  const [deudaPorEntidad, setDeudaPorEntidad] = useState([]);
  const [topPendientes, setTopPendientes] = useState([]);

  const empresaOptions = useMemo(
    () =>
      (empresas || [])
        .map((empresa) => ({
          rut: empresa.empresaRut,
          nombre: empresa.nombre,
          label: `${empresa.nombre} (${empresa.empresaRut})`,
          rutNormalized: empresa.empresaRut
            .replace(/[^\dk]/gi, "")
            .toLowerCase(),
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
    const match = empresaOptions.find(
      (option) => option.rut === empresaSeleccionada
    );
    const label = match ? match.label : "";
    setEmpresaInput(label);
    lastEmpresaLabel.current = label;
  }, [empresaOptions, empresaSeleccionada]);

  const handleEmpresaInputChange = useCallback(
    (value) => {
      setEmpresaInput(value);
      const normalizedValue = value.trim().toLowerCase();
      if (!normalizedValue) {
        setEmpresaSeleccionada("");
        return;
      }

      const matchByLabel = empresaOptions.find(
        (option) => option.label.toLowerCase() === normalizedValue
      );
      if (matchByLabel) {
        if (matchByLabel.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(matchByLabel.rut);
        }
        if (value !== matchByLabel.label) {
          setEmpresaInput(matchByLabel.label);
        }
        lastEmpresaLabel.current = matchByLabel.label;
        return;
      }

      const normalizedRut = normalizedValue.replace(/[^\dk]/gi, "");
      const matchByRut = empresaOptions.find(
        (option) => option.rutNormalized === normalizedRut
      );
      if (matchByRut) {
        if (matchByRut.rut !== empresaSeleccionada) {
          setEmpresaSeleccionada(matchByRut.rut);
        }
        setEmpresaInput(matchByRut.label);
        lastEmpresaLabel.current = matchByRut.label;
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

  const filtrosActivos = useMemo(() => {
    const filtros = [];
    if (dateRange?.from || dateRange?.to) {
      const inicio =
        dateRange?.from?.toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) || "-";
      const fin =
        dateRange?.to?.toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) || "-";
      filtros.push({ etiqueta: "Rango", valor: `${inicio} → ${fin}` });
    }
    return filtros;
  }, [dateRange]);

  const cargarDashboard = useCallback(async () => {
    if (!empresaSeleccionada) return;
    try {
      setErrorCarga("");
      setLoadingDatos(true);
      const params = buildDateParams(dateRange);

      const [
        resumenResponse,
        casosResponse,
        deudaResponse,
        pendientesResponse,
      ] = await Promise.all([
        apiService.get(
          `/pagex-dashboard/${empresaSeleccionada}/resumen-financiero`,
          { params }
        ),
        apiService.get(
          `/pagex-dashboard/${empresaSeleccionada}/casos-por-estado`
        ),
        apiService.get(
          `/pagex-dashboard/${empresaSeleccionada}/deuda-por-institucion`
        ),
        apiService.get(
          `/pagex-dashboard/${empresaSeleccionada}/top-pendientes`
        ),
      ]);

      setResumenFinanciero(resumenResponse?.data?.data ?? null);
      setCasosEstado(casosResponse?.data?.data ?? null);
      setDeudaPorEntidad(deudaResponse?.data?.data ?? []);
      setTopPendientes(pendientesResponse?.data?.data ?? []);
    } catch (error) {
      console.error("Error cargando dashboard Pagex:", error);
      setErrorCarga(
        "No pudimos cargar la información. Inténtalo nuevamente en unos minutos."
      );
    } finally {
      setLoadingDatos(false);
    }
  }, [empresaSeleccionada, dateRange]);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  const barChartData = useMemo(() => {
    if (!Array.isArray(deudaPorEntidad)) return [];
    return deudaPorEntidad.map((item) => {
      const solicitado = Number(item.solicitado) || 0;
      const recuperado = Number(item.recuperado) || 0;
      const pendiente = Math.max(solicitado - recuperado, 0);
      return {
        entidad: item.entidad || "Entidad sin nombre",
        Solicitado: solicitado,
        Recuperado: recuperado,
        Pendiente: pendiente,
      };
    });
  }, [deudaPorEntidad]);

  const donutData = useMemo(() => {
    if (!casosEstado) return [];
    return [
      { estado: "Pendiente", casos: casosEstado.pendientes || 0 },
      { estado: "Recuperado", casos: casosEstado.resueltos || 0 },
      { estado: "Rechazado", casos: casosEstado.rechazados || 0 },
    ].filter((item) => item.casos > 0);
  }, [casosEstado]);

  if (loadingEmpresas && !empresaSeleccionada) {
    return <DashboardMoraAnaliticoSkeleton />;
  }

  if (!empresaSeleccionada) {
    return (
      <div className="theme-pagex">
        <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <EmptyState message="Elige una empresa autorizada para revisar su actividad en pagos en exceso." />
          </div>
        </main>
      </div>
    );
  }

  const surface =
    "rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur";

  return (
    <div className="theme-pagex">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="rounded-3xl border border-white/60 bg-white/65 p-6 shadow-elevated backdrop-blur md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
                  Panel operativo
                </span>
                <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                  Dashboard operativo de Pagex
                </h1>
                <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
                  Monitorea tus recuperaciones, saldos pendientes y los casos
                  prioritarios de pagos en exceso.
                </p>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <div className="relative flex min-w-[260px] flex-1 items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                  <RiBuildingLine
                    className="h-5 w-5 text-[color:var(--theme-primary)]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder={
                      loadingEmpresas
                        ? "Cargando empresas..."
                        : "Busca por nombre o RUT"
                    }
                    className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder:text-gray-400 outline-none"
                    value={empresaInput}
                    onChange={(event) =>
                      handleEmpresaInputChange(event.target.value)
                    }
                    onFocus={(event) => {
                      event.target.select();
                      handleEmpresaFocus();
                    }}
                    onBlur={handleEmpresaBlur}
                    list="pagex-empresas-options-cliente"
                    disabled={loadingEmpresas || loadingDatos}
                  />
                  <datalist id="pagex-empresas-options-cliente">
                    {empresaOptions.map((empresa) => (
                      <option key={empresa.rut} value={empresa.label} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
                    <RiCalendarLine
                      className="h-5 w-5 text-[color:var(--theme-primary)]"
                      aria-hidden="true"
                    />
                    <DateRangePicker
                      value={dateRange}
                      onValueChange={setDateRange}
                      enableClear
                      className="flex-1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={cargarDashboard}
                    disabled={loadingDatos}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-primary-dark)] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RiRefreshLine className="h-4 w-4" />
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 shadow-sm backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--text-secondary)]">
              <RiInformationLine className="h-4 w-4 text-[color:var(--theme-primary)]" />
              <span className="font-semibold">Filtros activos</span>
              {filtrosActivos.length === 0 && (
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[color:var(--text-secondary)] shadow-sm">
                  Sin filtros adicionales
                </span>
              )}
              {filtrosActivos.map((filtro) => (
                <span
                  key={`${filtro.etiqueta}-${filtro.valor}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] shadow-sm"
                >
                  {filtro.etiqueta}: {filtro.valor}
                </span>
              ))}
            </div>
          </section>

          {errorCarga && (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
              {errorCarga}
            </section>
          )}

          <section className={surface}>
            <div className="grid gap-4 lg:grid-cols-4">
              <MetricCard
                label="Monto solicitado"
                value={formatCurrency(resumenFinanciero?.totalSolicitado ?? 0)}
                helper="Pagos en exceso identificados"
              />
              <MetricCard
                label="Monto recuperado"
                value={formatCurrency(resumenFinanciero?.totalRecuperado ?? 0)}
                helper="Casos regularizados"
                highlight={
                  casosEstado
                    ? `Avance: ${formatPercentage(
                        casosEstado?.porcentajeAvance ?? 0
                      )}`
                    : undefined
                }
              />
              <MetricCard
                label="Monto pendiente"
                value={formatCurrency(resumenFinanciero?.totalPendiente ?? 0)}
                helper="Saldo aún en gestión"
              />
              <MetricCard
                label="Casos totales"
                value={formatNumber(casosEstado?.total ?? 0)}
                helper={`Pendientes: ${formatNumber(
                  casosEstado?.pendientes ?? 0
                )}`}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <MetricCard
                label="Casos pendientes"
                value={formatNumber(casosEstado?.pendientes ?? 0)}
              />
              <MetricCard
                label="Casos recuperados"
                value={formatNumber(casosEstado?.resueltos ?? 0)}
              />
            </div>
          </section>

          <section className={surface}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Distribución de deuda por entidad
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Compara los montos solicitados, recuperados y pendientes por
                  institución.
                </p>
                {barChartData.length > 0 ? (
                  <BarChart
                    className="mt-6"
                    data={barChartData}
                    index="entidad"
                    categories={["Solicitado", "Recuperado", "Pendiente"]}
                    colors={["indigo", "emerald", "rose"]}
                    valueFormatter={formatCurrency}
                    yAxisWidth={88}
                    noDataText="Sin registros para la selección actual."
                  />
                ) : (
                  <ChartEmpty message="Aún no hay registros de deuda por entidad para la selección actual." />
                )}
              </div>
            </div>
          </section>

          <section className={surface}>
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Casos por estado
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Distribución de gestiones según su estado actual.
                </p>
                {donutData.length > 0 ? (
                  <DonutChart
                    className="mt-6"
                    data={donutData}
                    category="casos"
                    index="estado"
                    valueFormatter={formatNumber}
                    colors={["amber", "emerald", "rose"]}
                    showLabel
                    showTooltip
                  />
                ) : (
                  <ChartEmpty message="Sin datos suficientes para graficar la distribución de estados." />
                )}
              </div>

              <div className="lg:col-span-3">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Top de trabajadores con montos pendientes
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Revisa los trabajadores con mayor monto pendiente para
                  priorizar las gestiones.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm">
                  <Table className="min-w-full divide-y divide-slate-200/50 text-sm">
                    <TableHead className="bg-white/70">
                      <TableRow>
                        <TableHeaderCell>Trabajador</TableHeaderCell>
                        <TableHeaderCell>RUT</TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Monto pendiente
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Periodos
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPendientes.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-6 text-center text-[color:var(--text-secondary)]"
                          >
                            No existen pendientes para la empresa
                            seleccionada.
                          </TableCell>
                        </TableRow>
                      )}
                      {topPendientes.map((item) => (
                        <TableRow key={item.rutTrabajador}>
                          <TableCell>
                            {item.nombreTrabajador || "Sin nombre"}
                          </TableCell>
                          <TableCell className="text-[color:var(--text-secondary)]">
                            {item.rutTrabajador}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-[color:var(--theme-primary)]">
                            {formatCurrency(item.totalDeudaPendiente)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.periodosPendientes)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </section>

          <section className={surface}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] shadow-sm">
                <RiInformationLine className="h-3.5 w-3.5" />
                <span className="uppercase tracking-[0.18em]">Empresa</span>
                <span className="font-semibold normal-case">
                  {empresaOptions.find(
                    (empresa) => empresa.rut === empresaSeleccionada
                  )?.label || empresaSeleccionada}
                </span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] shadow-sm">
                <RiInformationLine className="h-3.5 w-3.5" />
                <span className="uppercase tracking-[0.18em]">
                  Casos Analizados
                </span>
                <span className="font-semibold normal-case">
                  {formatNumber(casosEstado?.total ?? 0)}
                </span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--theme-primary)] shadow-sm">
                <RiInformationLine className="h-3.5 w-3.5" />
                <span className="uppercase tracking-[0.18em]">Avance</span>
                <span className="font-semibold normal-case">
                  {formatPercentage(casosEstado?.porcentajeAvance ?? 0)}
                </span>
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PagexDashboard;
