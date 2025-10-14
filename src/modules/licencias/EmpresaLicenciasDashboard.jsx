"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RiBuildingLine,
  RiRefreshLine,
  RiAlertLine,
  RiInformationLine,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import TrabajadorSkeleton from "@/components/skeleton/TrabajadorSkeleton";

// --- Helpers ---
const formatCLP = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(
    Number.isFinite(Number(value)) ? Number(value) : 0
  );

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-CL");
};

const estadoLabel = (estado) =>
  estado
    ? estado.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Sin estado";

const estadoBadgeColor = (estado) => {
  const normalized = (estado || "").toLowerCase();
  if (["autorizada", "completado", "pagado", "pagada"].includes(normalized)) return "emerald";
  if (["pendiente", "en trámite"].includes(normalized)) return "amber";
  if (["rechazada", "rechazado", "devuelta"].includes(normalized)) return "rose";
  return "slate";
};

const badgeToneClasses = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-200 text-slate-700",
};

const getBadgeTone = (tone) => badgeToneClasses[tone] || badgeToneClasses.slate;

// --- Sub-componentes ---
const Header = ({
  loadingEmpresas,
  empresaSeleccionada,
  empresaInput,
  onEmpresaInputChange,
  onEmpresaInputFocus,
  onEmpresaInputBlur,
  empresaOptions,
  handleActualizar,
  loading,
}) => (
  <section className="rounded-3xl border border-white/60 bg-white/65 p-6 shadow-elevated backdrop-blur md:p-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
          Panel empresa
        </span>
        <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
          Dashboard integral por empresa
        </h1>
        <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
          Visualiza licencias, anticipos, subsidios y el saldo consolidado para cada empresa autorizada.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex min-w-[260px] flex-1 items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
          <RiBuildingLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
          <input
            type="text"
            placeholder={loadingEmpresas ? "Cargando empresas..." : "Busca por nombre o RUT"}
            className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder:text-gray-400 outline-none"
            value={empresaInput}
            onChange={(event) => onEmpresaInputChange(event.target.value)}
            onFocus={(event) => {
              event.target.select();
              onEmpresaInputFocus();
            }}
            onBlur={onEmpresaInputBlur}
            list="empresa-options"
            disabled={loadingEmpresas || loading}
          />
          <datalist id="empresa-options">
            {empresaOptions.map((empresa) => (
              <option key={empresa.rut} value={empresa.label} />
            ))}
          </datalist>
        </div>

        <button
          type="button"
          onClick={handleActualizar}
          disabled={!empresaSeleccionada || loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-primary-dark)] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RiRefreshLine className="h-4 w-4" aria-hidden="true" />
          Actualizar
        </button>
      </div>
    </div>
  </section>
);

const EmptyState = () => (
  <section className="rounded-3xl border border-white/70 bg-white/75 p-12 text-center shadow-sm backdrop-blur">
    <RiInformationLine className="mx-auto h-12 w-12 text-[color:var(--theme-primary)]" />
    <h2 className="mt-5 text-2xl font-semibold text-[color:var(--text-primary)]">
      Selecciona una empresa
    </h2>
    <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
      Elige una empresa para revisar su resumen actualizado de licencias.
    </p>
  </section>
);

const ResumenEmpresa = ({ resumen }) => {
  const metricas = resumen?.metricas ?? {};
  const cuentaCorriente = metricas.cuentaCorriente ?? { saldo: 0, estado: "" };
  const anticipos = metricas.anticipos ?? { total: 0, cantidad: 0 };
  const subsidios = metricas.subsidios ?? { total: 0, cantidad: 0 };
  const trabajadores = metricas.trabajadores ?? { conLicencia: 0 };
  const licenciasMetricas = metricas.licencias ?? { total: 0, diasTotales: 0 };
  const detalle = resumen?.detalle ?? {};
  const licenciasRecientes = detalle.licenciasRecientes ?? [];
  const anticiposRecientes = detalle.anticiposRecientes ?? [];
  const subsidiosRecientes = detalle.subsidiosRecientes ?? [];
  const topAFavor = detalle.topTrabajadoresAFavor ?? [];
  const topEnContra = detalle.topTrabajadoresEnContra ?? [];

  const licenciasPorEstado = useMemo(() => {
    const porEstado = resumen?.metricas?.licencias?.porEstado;
    if (!porEstado) return [];
    return Object.entries(porEstado)
      .map(([estado, cantidad]) => ({ estado: estadoLabel(estado), cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [resumen]);

  const cardSurface =
    "rounded-3xl border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur";

  return (
    <div className="space-y-8">
      <section className={cardSurface}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
            {resumen?.empresa?.nombre}
          </span>
          <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">
            Resumen financiero
          </h2>
          <p className="text-sm text-[color:var(--text-secondary)]">
            {resumen?.empresa?.rut}
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-inner">
            <p className="text-sm font-medium text-gray-600">Saldo general de la cuenta</p>
            <p
              className={`mt-2 text-3xl font-semibold ${
                cuentaCorriente.saldo >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCLP(cuentaCorriente.saldo)}
            </p>
            <span
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeTone(
                cuentaCorriente.saldo >= 0 ? "emerald" : "rose"
              )}`}
            >
              {cuentaCorriente.estado === "a favor" ? "A favor" : "En contra"}
            </span>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-inner">
            <p className="text-sm font-medium text-gray-600">Total anticipos pagados</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)]">
              {formatCLP(anticipos.total)}
            </p>
            <p className="text-xs text-[color:var(--text-secondary)]">
              Movimientos: {formatNumber(anticipos.cantidad)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-inner">
            <p className="text-sm font-medium text-gray-600">Total subsidios recibidos</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)]">
              {formatCLP(subsidios.total)}
            </p>
            <p className="text-xs text-[color:var(--text-secondary)]">
              Movimientos: {formatNumber(subsidios.cantidad)}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Métricas operacionales
        </h3>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className={cardSurface}>
            <p className="text-sm font-medium text-gray-600">Trabajadores con licencia</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
              {formatNumber(trabajadores.conLicencia)}
            </p>
          </div>
          <div className={cardSurface}>
            <p className="text-sm font-medium text-gray-600">Total días de ausentismo</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
              {formatNumber(licenciasMetricas.diasTotales)}
            </p>
          </div>
          <div className={cardSurface}>
            <p className="text-sm font-medium text-gray-600">Licencias registradas</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
              {formatNumber(licenciasMetricas.total)}
            </p>
          </div>
        </div>
      </section>

      <section className={cardSurface}>
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Distribución de licencias por estado
        </h3>
        {licenciasPorEstado.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {licenciasPorEstado.map(({ estado, cantidad }) => (
              <div
                key={estado}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm transition hover:border-[color:var(--theme-primary)]"
              >
                <p className="text-sm font-medium text-gray-700">{estado}</p>
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeTone(
                    estadoBadgeColor(estado)
                  )}`}
                >
                  {cantidad}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="pt-4 text-sm text-center text-[color:var(--text-secondary)]">
            No hay datos disponibles.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Movimientos recientes
        </h3>
        <div className={cardSurface}>
          <header className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-[color:var(--text-primary)]">Licencias</h4>
          </header>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2">Trabajador</th>
                  <th className="px-4 py-2">RUT</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Periodo</th>
                  <th className="px-4 py-2 text-right">Anticipo</th>
                  <th className="px-4 py-2 text-right">Subsidio</th>
                </tr>
              </thead>
              <tbody>
                {licenciasRecientes.length > 0 ? (
                  licenciasRecientes.map((item) => (
                    <tr key={item.folio} className="border-t border-gray-100">
                      <td className="px-4 py-3">{item.nombreTrabajador}</td>
                      <td className="px-4 py-3 text-gray-500">{item.trabajadorRut}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeTone(
                            estadoBadgeColor(item.estado)
                          )}`}
                        >
                          {estadoLabel(item.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {`${formatDate(item.fechaInicio)} - ${formatDate(item.fechaTermino)}`}
                      </td>
                      <td className="px-4 py-3 text-right">{formatCLP(item.montoAnticipo)}</td>
                      <td className="px-4 py-3 text-right">{formatCLP(item.montoSubsidio)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      No hay licencias recientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className={cardSurface}>
            <h4 className="flex items-center gap-2 text-base font-semibold text-emerald-700">
              <RiArrowUpCircleLine className="h-5 w-5" aria-hidden="true" />
              Anticipos
            </h4>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">RUT trabajador</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {anticiposRecientes.length > 0 ? (
                    anticiposRecientes.map((item, index) => (
                      <tr key={`${item.trabajadorRut}-${index}`} className="border-t border-gray-100">
                        <td className="px-4 py-3">{formatDate(item.fecha)}</td>
                        <td className="px-4 py-3 text-gray-500">{item.trabajadorRut}</td>
                        <td className="px-4 py-3 text-right text-emerald-700">
                          {formatCLP(item.monto)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay anticipos recientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={cardSurface}>
            <h4 className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-primary)]">
              <RiArrowDownCircleLine className="h-5 w-5 text-rose-600" aria-hidden="true" />
              Subsidios
            </h4>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">RUT trabajador</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {subsidiosRecientes.length > 0 ? (
                    subsidiosRecientes.map((item, index) => (
                      <tr key={`${item.trabajadorRut}-${index}`} className="border-t border-gray-100">
                        <td className="px-4 py-3">{formatDate(item.fecha)}</td>
                        <td className="px-4 py-3 text-gray-500">{item.trabajadorRut}</td>
                        <td className="px-4 py-3 text-right text-rose-600">
                          {formatCLP(item.monto)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay subsidios recientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className={cardSurface}>
          <h4 className="flex items-center gap-2 text-base font-semibold text-emerald-700">
            <RiArrowUpCircleLine className="h-5 w-5" aria-hidden="true" />
            Top trabajadores con saldo a favor
          </h4>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2">Trabajador</th>
                  <th className="px-4 py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {topAFavor.length > 0 ? (
                  topAFavor.map((item) => (
                    <tr key={item.trabajadorRut} className="border-t border-gray-100">
                      <td className="px-4 py-3">{`${item.nombre} (${item.trabajadorRut})`}</td>
                      <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                        {formatCLP(item.saldo)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-sm text-gray-500">
                      Sin registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardSurface}>
          <h4 className="flex items-center gap-2 text-base font-semibold text-rose-700">
            <RiArrowDownCircleLine className="h-5 w-5" aria-hidden="true" />
            Top trabajadores con saldo en contra
          </h4>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2">Trabajador</th>
                  <th className="px-4 py-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {topEnContra.length > 0 ? (
                  topEnContra.map((item) => (
                    <tr key={item.trabajadorRut} className="border-t border-gray-100">
                      <td className="px-4 py-3">{`${item.nombre} (${item.trabajadorRut})`}</td>
                      <td className="px-4 py-3 text-right text-rose-700 font-semibold">
                        {formatCLP(item.saldo)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-sm text-gray-500">
                      Sin registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Componente Principal ---
const EmpresaLicenciasDashboard = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const lastValidLabelRef = useRef("");
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const empresaOptions = useMemo(() =>
    empresas
      .map((empresa) => ({
        rut: empresa.empresaRut,
        nombre: empresa.nombre,
        label: `${empresa.nombre} (${empresa.empresaRut})`,
        rutNormalized: empresa.empresaRut.replace(/[^\dk]/gi, "").toLowerCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es')),
  [empresas]);

  useEffect(() => {
    if (empresas.length > 0 && !empresaSeleccionada) {
      setEmpresaSeleccionada(empresas[0].empresaRut);
    }
  }, [empresas, empresaSeleccionada]);

  useEffect(() => {
    const match = empresaOptions.find((option) => option.rut === empresaSeleccionada);
    const label = match ? match.label : "";
    setEmpresaInput(label);
    lastValidLabelRef.current = label;
  }, [empresaOptions, empresaSeleccionada]);

  const handleEmpresaInputChange = useCallback((value) => {
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
        setResumen(null);
        setEmpresaSeleccionada(matchByLabel.rut);
      }
      if (matchByLabel.label !== value) {
        setEmpresaInput(matchByLabel.label);
      }
      lastValidLabelRef.current = matchByLabel.label;
      return;
    }

    const normalizedRut = normalizedValue.replace(/[^\dk]/gi, "");
    const matchByRut = empresaOptions.find(
      (option) => option.rutNormalized === normalizedRut
    );
    if (matchByRut && matchByRut.rut !== empresaSeleccionada) {
      setResumen(null);
      setEmpresaSeleccionada(matchByRut.rut);
      setEmpresaInput(matchByRut.label);
      lastValidLabelRef.current = matchByRut.label;
    }
  }, [empresaOptions, empresaSeleccionada]);

  const handleEmpresaInputFocus = useCallback(() => {
    setEmpresaInput("");
  }, []);

  const handleEmpresaInputBlur = useCallback(() => {
    if (!empresaInput) {
      setEmpresaInput(lastValidLabelRef.current || "");
    }
  }, [empresaInput]);

  const fetchResumen = async (rut) => {
    if (!rut) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await apiService.get(`/licencia-dashboard/${rut}/ficha-resumen`);
      setResumen(data?.data || null);
      if (!data?.data) setError("No se encontró información para la empresa seleccionada.");
    } catch (err) {
      setResumen(null);
      setError(
        err?.response?.data?.message || "No fue posible obtener la información de la empresa."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empresaSeleccionada) {
      fetchResumen(empresaSeleccionada);
    }
  }, [empresaSeleccionada]);

  const showError = !!error && !loading;
  const showSkeleton = loading || (loadingEmpresas && !resumen);

  return (
    <div className="theme-licencias">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <Header
            loadingEmpresas={loadingEmpresas}
            empresaSeleccionada={empresaSeleccionada}
            empresaInput={empresaInput}
            onEmpresaInputChange={handleEmpresaInputChange}
            onEmpresaInputFocus={handleEmpresaInputFocus}
            onEmpresaInputBlur={handleEmpresaInputBlur}
            empresaOptions={empresaOptions}
            handleActualizar={() => fetchResumen(empresaSeleccionada)}
            loading={loading}
          />

          {showError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-700 shadow-sm">
              <div className="flex items-center gap-2">
                <RiAlertLine className="h-5 w-5" aria-hidden="true" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {showSkeleton && <TrabajadorSkeleton />}

          {!showSkeleton && !resumen && <EmptyState />}

          {!showSkeleton && resumen && <ResumenEmpresa resumen={resumen} />}
        </div>
      </main>
    </div>
  );
};

export default EmpresaLicenciasDashboard;
