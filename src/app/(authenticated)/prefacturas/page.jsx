"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFilter3Line,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { usePrefacturas } from "@/hooks/usePrefacturas";
import { usePrefacturaFilters } from "@/hooks/usePrefacturaFilters";
import StatusPill from "@/components/status/StatusPill";
import { formatCurrency, formatDate } from "@/utils/formatters";

const PAGE_SIZE = 10;

const PrefacturasPage = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresasPermitidas();
  const empresaOptions = useMemo(
    () =>
      (empresas || []).map((empresa) => ({
        value: empresa?.empresaRut || empresa?.empresas?.empresaRut,
        label: empresa?.nombre || empresa?.empresas?.nombre || "Sin nombre",
      })),
    [empresas]
  );

  const empresaRuts = useMemo(
    () => empresaOptions.map((option) => option.value).filter(Boolean),
    [empresaOptions]
  );

  const { filters: availableFilters, loading: loadingFilterOptions } =
    usePrefacturaFilters({ empresaRut: empresaRuts });

  const statusOptions = availableFilters?.estado || [];

  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: prefacturas,
    meta,
    loading,
    error,
    refetch,
  } = usePrefacturas(
    { sortField: "fechaGeneracion", sortOrder: "desc" },
    { autoFetch: false, limit: PAGE_SIZE }
  );

  const applyFilters = useCallback(
    async (page = 1) => {
      const offset = (page - 1) * PAGE_SIZE;

      const query = {
        limit: PAGE_SIZE,
        offset,
        sortField: "fechaGeneracion",
        sortOrder: "desc",
      };

      if (selectedStatuses.length > 0) {
        query.estado = selectedStatuses;
      }
      if (selectedEmpresa !== "all" && selectedEmpresa) {
        query.empresaRut = [selectedEmpresa];
      }
      if (searchTerm.trim()) {
        query.folio = searchTerm.trim();
      }

      await refetch(query);
    },
    [selectedStatuses, selectedEmpresa, searchTerm, refetch]
  );

  useEffect(() => {
    applyFilters(1).catch(() => {});
    setCurrentPage(1);
  }, [selectedStatuses, selectedEmpresa, searchTerm, applyFilters]);

  const handleStatusToggle = (estado) => {
    setSelectedStatuses((prev) =>
      prev.includes(estado)
        ? prev.filter((item) => item !== estado)
        : [...prev, estado]
    );
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedEmpresa("all");
    setSearchInput("");
    setSearchTerm("");
  };

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1) {
      const nextPage = currentPage - 1;
      applyFilters(nextPage).catch(() => {});
      setCurrentPage(nextPage);
    }
    if (direction === "next" && currentPage < (meta.pages || 1)) {
      const nextPage = currentPage + 1;
      applyFilters(nextPage).catch(() => {});
      setCurrentPage(nextPage);
    }
  };

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
            Prefacturas
          </span>
          <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Gestión de prefacturas
          </h1>
          <p className="max-w-3xl text-sm text-[color:var(--text-secondary)] sm:text-base">
            Filtra y revisa el estado de tus prefacturas. Puedes acceder al detalle y descargar los documentos asociados.
          </p>
        </header>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--text-secondary)]">
            <RiFilter3Line className="h-5 w-5 text-[color:var(--theme-primary)]" aria-hidden="true" />
            <span>
              {meta.total ?? 0} prefacturas encontradas
              {selectedEmpresa !== "all" && (
                <>
                  {" "}
                  para{" "}
                  <strong className="text-[color:var(--text-primary)]">
                    {
                      empresaOptions.find((opt) => opt.value === selectedEmpresa)
                        ?.label
                    }
                  </strong>
                </>
              )}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {loadingFilterOptions ? (
                <span className="text-xs text-[color:var(--text-secondary)]">
                  Cargando estados...
                </span>
              ) : statusOptions.length > 0 ? (
                statusOptions.map((status) => {
                  const isActive = selectedStatuses.includes(status.value);
                  return (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleStatusToggle(status.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition ${
                        isActive
                          ? "border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/15 text-[color:var(--theme-primary)]"
                          : "border-white/60 bg-white text-[color:var(--text-secondary)] hover:border-[color:var(--theme-primary)]/40 hover:text-[color:var(--theme-primary)]"
                      }`}
                    >
                      {status.label}
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-[color:var(--text-secondary)]">
                  No hay estados disponibles.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-white/60 bg-white px-3 py-2 shadow-sm"
                >
                  <RiSearchLine
                    className="h-4 w-4 text-[color:var(--text-secondary)]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Buscar por folio..."
                    className="w-full border-none bg-transparent text-sm text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-secondary)]"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[color:var(--theme-primary)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--theme-primary-dark)]"
                  >
                    Buscar
                  </button>
                </form>

                <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-white px-3 py-2 text-xs shadow-sm">
                  <label
                    htmlFor="empresa"
                    className="font-semibold text-[color:var(--text-secondary)]"
                  >
                    Empresa
                  </label>
                  <select
                    id="empresa"
                    value={selectedEmpresa}
                    onChange={(event) => setSelectedEmpresa(event.target.value)}
                    className="rounded-lg border border-transparent bg-transparent text-[color:var(--text-primary)] focus:border-[color:var(--theme-primary)] focus:outline-none"
                  >
                    <option value="all">Todas</option>
                    {empresaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm hover:text-[color:var(--theme-primary)]"
              >
                <RiRefreshLine className="h-4 w-4" aria-hidden="true" />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-sm backdrop-blur">
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
                <th scope="col" className="px-4 py-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50 text-[color:var(--text-primary)]">
              {loading || loadingEmpresas ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-[color:var(--text-secondary)]"
                  >
                    Cargando prefacturas...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-rose-500"
                  >
                    Ocurrió un error al cargar las prefacturas.
                  </td>
                </tr>
              ) : prefacturas.length > 0 ? (
                prefacturas.map((prefactura) => (
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
                    <td className="px-4 py-3 text-right text-sm">
                      <Link
                        href={`/prefacturas/${prefactura.id}`}
                        className="font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-[color:var(--text-secondary)]"
                  >
                    No se encontraron prefacturas con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-[color:var(--text-secondary)]">
          <span>
            Página {currentPage} de {meta.pages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange("prev")}
              disabled={currentPage <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white px-3 py-2 font-semibold shadow-sm disabled:opacity-50"
            >
              <RiArrowLeftSLine className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => handlePageChange("next")}
              disabled={currentPage >= (meta.pages || 1) || loading}
              className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white px-3 py-2 font-semibold shadow-sm disabled:opacity-50"
            >
              Siguiente
              <RiArrowRightSLine className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrefacturasPage;
