"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RiDownload2Line,
  RiEyeLine,
  RiFileList3Line,
  RiFilter3Line,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import {
  downloadGestionLicenciaExcel,
  fetchGestionesLicencia,
} from "@/services/clientServiceApi";
import {
  buildLicenciasManagementQuery,
  getGestionLicenciaDetailHref,
} from "@/services/licenciasManagement.mjs";

const PAGE_SIZE = 20;
const EMPTY_PAGE = { rows: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 };

const humanize = (value) => {
  const normalized = String(value || "sin estado").replace(/[_-]+/g, " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const LicenciasManagement = () => {
  const searchParams = useSearchParams();
  const requestedEmpresa = searchParams?.get("empresa") || "";
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const [filters, setFilters] = useState({
    empresaRut: requestedEmpresa,
    folioInterno: "",
    periodo: "",
    estado: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const empresaOptions = useMemo(
    () => [...(empresas || [])].sort((a, b) =>
      `${a.nombre} ${a.empresaRut}`.localeCompare(`${b.nombre} ${b.empresaRut}`, "es")
    ),
    [empresas]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchGestionesLicencia(
      buildLicenciasManagementQuery({
        ...appliedFilters,
        page,
        pageSize: PAGE_SIZE,
      })
    )
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((requestError) => {
        if (!active) return;
        setResult(EMPTY_PAGE);
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "No fue posible cargar las gestiones."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedFilters, page]);

  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const cleared = { empresaRut: "", folioInterno: "", periodo: "", estado: "" };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  };

  const download = async (row) => {
    setDownloadingId(row.id);
    setError("");
    try {
      await downloadGestionLicenciaExcel(row.id);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "No fue posible descargar el Excel."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Gestiones</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Gestiones de Licencias Médicas</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Consulta todas las gestiones autorizadas, revisa su detalle en modo lectura y descarga el Excel individual.
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={applyFilters} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <RiFilter3Line className="h-5 w-5 text-slate-600" />
            <h2 className="font-semibold">Filtros de expedientes</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium text-slate-700">
              Empresa
              <select
                value={filters.empresaRut}
                onChange={(event) => updateFilter("empresaRut", event.target.value)}
                disabled={loadingEmpresas}
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal"
              >
                <option value="">Todas las empresas</option>
                {empresaOptions.map((empresa) => (
                  <option key={empresa.empresaRut} value={empresa.empresaRut}>
                    {empresa.nombre} · {empresa.empresaRut}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Folio interno
              <input
                value={filters.folioInterno}
                onChange={(event) => updateFilter("folioInterno", event.target.value)}
                placeholder="Ej. LM-00125"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Periodo
              <input
                type="month"
                value={filters.periodo}
                onChange={(event) => updateFilter("periodo", event.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Estado
              <select
                value={filters.estado}
                onChange={(event) => updateFilter("estado", event.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="cerrada">Cerrada</option>
                <option value="reabierta">Reabierta</option>
                <option value="anulada">Anulada</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Aplicar filtros</button>
            <button type="button" onClick={clearFilters} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Limpiar</button>
          </div>
        </form>

        {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <RiFileList3Line className="h-5 w-5 text-slate-600" />
              <h2 className="font-semibold">Todas las gestiones</h2>
            </div>
            <span className="text-sm text-slate-500">{result.total} expedientes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Folio</th>
                  <th className="px-5 py-3">Periodo</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Licencias</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Cargando gestiones…</td></tr>
                ) : result.rows.length ? result.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4"><p className="font-medium text-slate-900">{row.empresaNombre || row.empresaRut}</p><p className="mt-1 text-xs text-slate-500">{row.empresaRut}</p></td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{row.folioInterno}</td>
                    <td className="px-5 py-4 text-slate-600">{row.periodo || "—"}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{humanize(row.estado)}</span></td>
                    <td className="px-5 py-4 text-right tabular-nums">{row.totalLicencias}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={getGestionLicenciaDetailHref(row.id)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><RiEyeLine className="h-4 w-4" />Ver detalle</Link>
                        <button type="button" onClick={() => download(row)} disabled={downloadingId === row.id} className="inline-flex items-center gap-1 rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"><RiDownload2Line className="h-4 w-4" />{downloadingId === row.id ? "Preparando…" : "Descargar Excel"}</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No hay gestiones para los filtros seleccionados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">Página {result.page} de {result.totalPages}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || page <= 1} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">Anterior</button>
              <button type="button" onClick={() => setPage((current) => Math.min(result.totalPages, current + 1))} disabled={loading || page >= result.totalPages} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LicenciasManagement;
