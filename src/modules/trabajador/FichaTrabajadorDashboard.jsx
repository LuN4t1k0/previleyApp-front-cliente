"use client";

import React, { useMemo, useState } from "react";
import {
  RiSearchLine,
  RiFileExcel2Line,
  RiUser3Line,
  RiShieldCheckLine,
  RiAlertLine,
  RiInformationLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import TrabajadorSkeleton from "@/components/skeleton/TrabajadorSkeleton";

const isValidRut = (rut) => /^\d{7,8}-[\dkK]$/.test(rut.trim());
const normalizeRut = (rut) => rut.trim().replace(/\s+/g, "").toUpperCase();
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
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-CL");
};
const estadoLabel = (estado) =>
  estado
    ? estado.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Sin estado";
const estadoTone = (estado) => {
  const normalized = (estado || "").toLowerCase();
  if (["autorizada", "completado", "pagado", "pagada", "resueltos"].includes(normalized)) {
    return "emerald";
  }
  if (["pendiente", "en trámite", "en tramite", "en_tramite"].includes(normalized)) {
    return "amber";
  }
  if (["rechazada", "rechazado", "devuelta"].includes(normalized)) {
    return "rose";
  }
  return "slate";
};

const toneClasses = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-200 text-slate-700",
};

const badgeClasses = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-200 text-slate-700",
};

const SearchSection = ({ rut, setRut, handleBuscar, handleExportar, loading, resumen, touched }) => (
  <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-elevated backdrop-blur md:p-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
          Panel trabajador
        </span>
        <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
          Ficha integral de trabajador
        </h1>
        <p className="text-sm text-[color:var(--text-secondary)] md:text-base">
          Consulta licencias, anticipos, subsidios y estado de mora asociados a un trabajador.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex min-w-[260px] items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm">
          <RiSearchLine className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
          <input
            className="flex-1 bg-transparent text-sm uppercase text-[color:var(--text-primary)] placeholder:text-gray-400 outline-none"
            placeholder="Ej: 12345678-9"
            value={rut}
            onChange={(event) => setRut(event.target.value.toUpperCase())}
            onKeyDown={(event) => event.key === "Enter" && handleBuscar()}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-primary-dark)] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={!resumen || loading}
            className="rounded-2xl border border-white/70 bg-white/90 px-5 py-2 text-sm font-semibold text-[color:var(--text-primary)] shadow-sm transition hover:border-[color:var(--theme-primary)]"
          >
            <span className="flex items-center gap-2">
              <RiFileExcel2Line className="h-4 w-4" aria-hidden="true" />
              Exportar
            </span>
          </button>
        </div>
      </div>
    </div>

    {touched && !isValidRut(normalizeRut(rut)) && (
      <p className="mt-4 text-sm font-semibold text-rose-600">
        Debes ingresar un RUT válido (formato 12345678-9).
      </p>
    )}
  </section>
);

const EmptyState = () => (
  <section className="rounded-3xl border border-white/70 bg-white/75 p-12 text-center shadow-sm backdrop-blur">
    <RiInformationLine className="mx-auto h-12 w-12 text-[color:var(--theme-primary)]" />
    <h2 className="mt-4 text-2xl font-semibold text-[color:var(--text-primary)]">
      Comienza una nueva búsqueda
    </h2>
    <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
      Ingresa el RUT de un trabajador para ver su ficha completa.
    </p>
  </section>
);

const ResumenTrabajador = ({ resumen, licenciasPorEstado, hoveredFolio, setHoveredFolio }) => {
  const empresasRelacionadas = resumen?.empresasRelacionadas || [];
  const metricas = resumen?.metricas ?? {};
  const licenciasMetricas = metricas.licencias ?? {};
  const anticiposMetricas = metricas.anticipos ?? { total: 0 };
  const subsidiosMetricas = metricas.subsidios ?? { total: 0 };
  const cuentaCorriente = metricas.cuentaCorriente ?? { saldo: 0, estado: "" };

  const surface = "rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur";

  return (
    <div className="space-y-8">
      <section className={surface}>
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--theme-primary)]">
              Trabajador
            </span>
            <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">
              {resumen?.trabajador?.nombreCompleto || "Sin registro"}
            </h2>
            <p className="text-sm text-[color:var(--text-secondary)]">
              RUT: {resumen?.trabajador?.rut || "-"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Licencias registradas
              </p>
              <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                {formatNumber(licenciasMetricas.cantidad)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Saldo cuenta corriente
              </p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  cuentaCorriente.saldo >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatCLP(cuentaCorriente.saldo)}
              </p>
              <span
                className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  badgeClasses[cuentaCorriente.saldo >= 0 ? "emerald" : "rose"]
                }`}
              >
                {cuentaCorriente.estado === "a favor" ? "A favor" : "En contra"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Total anticipos
              </p>
              <p className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                {formatCLP(anticiposMetricas.total)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Total subsidios
              </p>
              <p className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                {formatCLP(subsidiosMetricas.total)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Empresas relacionadas
            </p>
            <div className="flex flex-wrap gap-2">
              {empresasRelacionadas.length > 0 ? (
                empresasRelacionadas.map((empresaRut) => (
                  <span
                    key={empresaRut}
                    className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)] shadow-sm"
                  >
                    {empresaRut}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Sin registros asociados
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={surface}>
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Distribución de licencias por estado
        </h3>
        {licenciasPorEstado.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {licenciasPorEstado.map(({ estado, cantidad }) => (
              <div
                key={estado}
                className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm transition hover:border-[color:var(--theme-primary)]"
              >
                <p className="text-sm font-medium text-gray-700">{estado}</p>
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    toneClasses[estadoTone(estado)]
                  }`}
                >
                  {cantidad}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="pt-4 text-center text-sm text-[color:var(--text-secondary)]">
            No hay licencias para mostrar.
          </p>
        )}
      </section>

      <section className={surface}>
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
            Detalle de licencias médicas
          </h3>
        </header>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2">Folio</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Periodo</th>
                <th className="px-4 py-2">Días</th>
                <th className="px-4 py-2 text-right">Anticipo</th>
                <th className="px-4 py-2 text-right">Subsidio</th>
                <th className="px-4 py-2 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {resumen.detalle.licencias.length > 0 ? (
                resumen.detalle.licencias.map((item, index) => (
                  <tr
                    key={`${item.folio}-${index}`}
                    onMouseEnter={() => setHoveredFolio(item.folio)}
                    onMouseLeave={() => setHoveredFolio(null)}
                    className={`border-t border-gray-100 transition-colors ${
                      hoveredFolio && item.folio === hoveredFolio
                        ? "bg-amber-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                      {item.folio}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          toneClasses[estadoTone(item.estado)]
                        }`}
                      >
                        {estadoLabel(item.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                      {`${formatDate(item.fechaInicio)} — ${formatDate(item.fechaTermino)}`}
                    </td>
                    <td className="px-4 py-3">{formatNumber(item.dias)}</td>
                    <td className="px-4 py-3 text-right text-[color:var(--text-primary)]">
                      {formatCLP(item.montoAnticipo)}
                    </td>
                    <td className="px-4 py-3 text-right text-[color:var(--text-primary)]">
                      {formatCLP(item.montoSubsidio)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        item.montoDiferencia >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {formatCLP(item.montoDiferencia)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    No hay licencias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className={surface}>
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Anticipos</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Folio</th>
                  <th className="px-4 py-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {resumen.detalle.anticipos.length > 0 ? (
                  resumen.detalle.anticipos.map((item, index) => (
                    <tr
                      key={`${item.folio}-${index}`}
                      onMouseEnter={() => setHoveredFolio(item.folio)}
                      onMouseLeave={() => setHoveredFolio(null)}
                      className={`border-t border-gray-100 transition-colors ${
                        hoveredFolio && item.folio === hoveredFolio
                          ? "bg-amber-50"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3">{formatDate(item.fechaAnticipo)}</td>
                      <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                        {item.folio}
                      </td>
                      <td className="px-4 py-3 text-right text-[color:var(--text-primary)]">
                        {formatCLP(item.monto)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                      No hay anticipos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={surface}>
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Subsidios</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Folio</th>
                  <th className="px-4 py-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {resumen.detalle.subsidios.length > 0 ? (
                  resumen.detalle.subsidios.map((item, index) => (
                    <tr
                      key={`${item.folio}-${index}`}
                      onMouseEnter={() => setHoveredFolio(item.folio)}
                      onMouseLeave={() => setHoveredFolio(null)}
                      className={`border-t border-gray-100 transition-colors ${
                        hoveredFolio && item.folio === hoveredFolio
                          ? "bg-amber-50"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3">{formatDate(item.fechaDeposito)}</td>
                      <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                        {item.folio}
                      </td>
                      <td className="px-4 py-3 text-right text-[color:var(--text-primary)]">
                        {formatCLP(item.monto)}
                      </td>
                    </tr>
                  ))
                ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay subsidios registrados.
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {resumen.detalle.mora && (
        <section className={surface}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
                Estado de mora
              </h3>
              <span className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-sm font-semibold text-rose-700">
                Deuda pendiente: {formatCLP(resumen.detalle.mora.totalDeudaPendiente)}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <RiAlertLine className="h-5 w-5" aria-hidden="true" />
                  Periodos pendientes
                </div>
                <div className="mt-4 space-y-3">
                  {resumen.detalle.mora.pendientes.length > 0 ? (
                    resumen.detalle.mora.pendientes.map((item, index) => (
                      <div key={`${item.periodo}-${index}`} className="rounded-xl border border-rose-100 bg-white/90 p-4">
                        <div className="flex items-center justify-between text-sm font-semibold text-rose-700">
                          <span>{item.periodo}</span>
                          <span>{formatCLP(item.monto)}</span>
                        </div>
                        <p className="mt-1 text-xs text-rose-600">Empresa: {item.empresaRut}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-rose-600">Sin periodos pendientes.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <RiShieldCheckLine className="h-5 w-5" aria-hidden="true" />
                  Periodos resueltos
                </div>
                <div className="mt-4 space-y-3">
                  {resumen.detalle.mora.resueltos.length > 0 ? (
                    resumen.detalle.mora.resueltos.map((item, index) => (
                      <div key={`${item.periodo}-${index}`} className="rounded-xl border border-emerald-100 bg-white/90 p-4">
                        <div className="flex items-center justify-between text-sm font-semibold text-emerald-700">
                          <span>{item.periodo}</span>
                          <span>{formatCLP(item.monto)}</span>
                        </div>
                        <p className="mt-1 text-xs text-emerald-600">
                          {item.tipoGestion || "Gestión sin especificar"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-emerald-600">Sin periodos resueltos.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const FichaTrabajadorDashboard = () => {
  const [rut, setRut] = useState("");
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [hoveredFolio, setHoveredFolio] = useState(null);

  const handleBuscar = async () => {
    const normalized = normalizeRut(rut);
    setTouched(true);
    if (!isValidRut(normalized)) {
      setError("Debes ingresar un RUT válido (formato 12345678-9).");
      setResumen(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await apiService.get(
        `/trabajador-dashboard/trabajador/${normalized}/resumen`
      );
      setResumen(data?.data || null);
      if (!data?.data) {
        setError("No se encontró información para el RUT indicado.");
      }
    } catch (err) {
      setResumen(null);
      setError(err?.response?.data?.message || "No fue posible obtener la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    const normalized = normalizeRut(rut);
    if (!resumen || !isValidRut(normalized)) return;

    try {
      const response = await apiService.get(
        `/trabajador-dashboard/trabajador/${normalized}/exportar-excel`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ficha_trabajador_${normalized}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "No fue posible exportar la información.");
    }
  };

  const licenciasPorEstado = useMemo(() => {
    if (!resumen?.metricas?.licencias?.porEstado) return [];
    return Object.entries(resumen.metricas.licencias.porEstado)
      .map(([estado, cantidad]) => ({ estado: estadoLabel(estado), cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [resumen]);

  const showError = !!error && !loading;

  return (
    <div className="theme-licencias">
      <main className="dashboard-gradient min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <SearchSection
            rut={rut}
            setRut={setRut}
            handleBuscar={handleBuscar}
            handleExportar={handleExportar}
            loading={loading}
            resumen={resumen}
            touched={touched}
          />

          {showError && (
            <section className="rounded-3xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm text-rose-700 shadow-sm">
              <div className="flex items-center gap-2">
                <RiAlertLine className="h-5 w-5" aria-hidden="true" />
                <p>{error}</p>
              </div>
            </section>
          )}

          {loading && <TrabajadorSkeleton />}

          {!loading && !resumen && !error && <EmptyState />}

          {!loading && resumen && (
            <ResumenTrabajador
              resumen={resumen}
              licenciasPorEstado={licenciasPorEstado}
              hoveredFolio={hoveredFolio}
              setHoveredFolio={setHoveredFolio}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default FichaTrabajadorDashboard;
