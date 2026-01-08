"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiFileDownloadLine,
  RiFilter3Line,
  RiRefreshLine,
  RiSearchLine,
} from "@remixicon/react";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import { usePrefacturas } from "@/hooks/usePrefacturas";
import { usePrefacturaFilters } from "@/hooks/usePrefacturaFilters";
import StatusPill from "@/components/status/StatusPill";
import { formatDate } from "@/utils/formatters";
import { fetchPrefacturaDetailWithSignedUrls } from "@/services/prefacturaApi";

const PAGE_SIZE = 10;
const DOC_TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "prefactura", label: "Prefactura" },
  { value: "factura", label: "Factura" },
  { value: "certificado-inicial", label: "Certificado inicial" },
  { value: "certificado-final", label: "Certificado final" },
  { value: "detalle", label: "Detalle" },
  { value: "comprobante", label: "Comprobante de pago" },
];

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

const getPrefacturaPdfUrl = (pref) =>
  resolveFileUrl(
    pref?.prefacturaPdfUrl ||
      pref?.pdfUrl ||
      pref?.prefacturaPdfUrl ||
      pref?.pdfKey ||
      pref?.pdf ||
      null
  );

const normalizeProducciones = (detalle) => {
  const producciones = detalle?.producciones;
  if (Array.isArray(producciones)) return producciones;
  if (producciones) return [producciones];
  const fallbackId = detalle?.produccionId || detalle?.produccionID || null;
  return fallbackId ? [{ id: fallbackId }] : [];
};

const buildProduccionAttachments = (produccion) => {
  const entries = [];
  const pushIf = (label, url) => {
    const resolved = resolveFileUrl(url);
    if (!resolved) return;
    entries.push({ label, url: resolved });
  };

  pushIf("Certificado inicial", produccion?.certificadoInicial);
  pushIf("Certificado final", produccion?.certificadoFinal);
  pushIf("Detalle", produccion?.detalle);
  pushIf(
    "Comprobante de pago",
    produccion?.comprobantePago ||
      produccion?.comprobanteUrl ||
      produccion?.comprobante ||
      produccion?.comprobante_pago
  );

  return entries.map((entry) => {
    if (entry.label === "Certificado inicial") {
      return { ...entry, type: "certificado-inicial" };
    }
    if (entry.label === "Certificado final") {
      return { ...entry, type: "certificado-final" };
    }
    if (entry.label === "Detalle") {
      return { ...entry, type: "detalle" };
    }
    if (entry.label === "Comprobante de pago") {
      return { ...entry, type: "comprobante" };
    }
    return { ...entry, type: "all" };
  });
};

const DocumentosPage = () => {
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
  const [selectedDocType, setSelectedDocType] = useState("all");

  const {
    data: prefacturas,
    meta,
    loading,
    refetch,
  } = usePrefacturas(
    { sortField: "fechaGeneracion", sortOrder: "desc" },
    { autoFetch: false, limit: PAGE_SIZE }
  );

  const [expanded, setExpanded] = useState(new Set());
  const [detailMap, setDetailMap] = useState({});
  const [loadingDetail, setLoadingDetail] = useState({});

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
    setSelectedDocType("all");
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

  const toggleExpanded = async (prefacturaId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(prefacturaId)) {
        next.delete(prefacturaId);
      } else {
        next.add(prefacturaId);
      }
      return next;
    });

    if (!detailMap[prefacturaId] && !loadingDetail[prefacturaId]) {
      setLoadingDetail((prev) => ({ ...prev, [prefacturaId]: true }));
      try {
        const detail = await fetchPrefacturaDetailWithSignedUrls(prefacturaId);
        setDetailMap((prev) => ({ ...prev, [prefacturaId]: detail }));
      } catch (error) {
        setDetailMap((prev) => ({ ...prev, [prefacturaId]: { error } }));
      } finally {
        setLoadingDetail((prev) => ({ ...prev, [prefacturaId]: false }));
      }
    }
  };

  const hasFilters =
    selectedStatuses.length > 0 ||
    (selectedEmpresa !== "all" && selectedEmpresa) ||
    searchTerm.trim() ||
    selectedDocType !== "all";

  const filterByType = useCallback(
    (docs = []) =>
      selectedDocType === "all"
        ? docs
        : docs.filter((doc) => doc.type === selectedDocType),
    [selectedDocType]
  );

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
            Centro de documentos
          </span>
          <h1 className="text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Archivos y respaldos
          </h1>
          <p className="max-w-3xl text-sm text-[color:var(--text-secondary)] sm:text-base">
            Descarga prefacturas, facturas y adjuntos de gestiones asociadas por
            servicio.
          </p>
        </header>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--text-secondary)]">
            <RiFilter3Line
              className="h-5 w-5 text-[color:var(--theme-primary)]"
              aria-hidden="true"
            />
            <span>
              {meta.total ?? 0} prefacturas disponibles
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

                <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-white px-3 py-2 text-xs shadow-sm">
                  <label
                    htmlFor="docType"
                    className="font-semibold text-[color:var(--text-secondary)]"
                  >
                    Documento
                  </label>
                  <select
                    id="docType"
                    value={selectedDocType}
                    onChange={(event) => setSelectedDocType(event.target.value)}
                    className="rounded-lg border border-transparent bg-transparent text-[color:var(--text-primary)] focus:border-[color:var(--theme-primary)] focus:outline-none"
                  >
                    {DOC_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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
        </div>

        {loading || loadingEmpresas ? (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
            Cargando documentos...
          </div>
        ) : prefacturas?.length ? (
          <div className="flex flex-col gap-4">
            {prefacturas.map((pref) => {
              const prefPdf = getPrefacturaPdfUrl(pref);
              const facturas = Array.isArray(pref.facturas)
                ? pref.facturas
                : [];
              const prefDocsRaw = [];
              if (prefPdf) {
                prefDocsRaw.push({
                  type: "prefactura",
                  label: "PDF prefactura",
                  url: prefPdf,
                });
              }
              facturas.forEach((factura) => {
                if (!factura?.pdfUrl) return;
                prefDocsRaw.push({
                  type: "factura",
                  label: `Factura ${factura.numeroFactura || factura.id}`,
                  url: factura.pdfUrl,
                });
              });
              const prefDocs = filterByType(prefDocsRaw);
              const isOpen = expanded.has(pref.id);
              const detail = detailMap[pref.id];
              const isLoadingDetail = loadingDetail[pref.id];
              const hasDetailError = detail?.error;
              const detailDocs = detail?.detalles?.flatMap((detalle) => {
                const producciones = normalizeProducciones(detalle);
                return producciones.flatMap((prod) =>
                  buildProduccionAttachments(prod)
                );
              }) || [];
              const filteredDetailDocs = filterByType(detailDocs);
              const totalDocsCount = prefDocs.length + filteredDetailDocs.length;
              const countLabel = detail?.detalles
                ? String(totalDocsCount)
                : `${prefDocs.length}+`;

              return (
                <article
                  key={pref.id}
                  className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--theme-primary)]">
                        Prefactura {pref.folio}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">
                        {pref.empresaNombre || pref.empresaRut}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[color:var(--text-secondary)]">
                        <StatusPill estado={pref.estado} />
                        <span>Generada el {formatDate(pref.fechaGeneracion)}</span>
                        <span>Adjuntos: {countLabel}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(pref.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm hover:text-[color:var(--theme-primary)]"
                    >
                      {isOpen ? (
                        <RiArrowUpSLine className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <RiArrowDownSLine className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isOpen ? "Ocultar adjuntos" : "Ver adjuntos"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    {prefDocs.length > 0 ? (
                      prefDocs.map((doc) => (
                        <a
                          key={`${pref.id}-${doc.label}`}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-semibold ${
                            doc.type === "prefactura"
                              ? "border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-primary)]/20"
                              : "border-white/60 bg-white text-[color:var(--text-secondary)] hover:text-[color:var(--theme-primary)]"
                          }`}
                        >
                          <RiFileDownloadLine className="h-4 w-4" aria-hidden="true" />
                          {doc.label}
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-[color:var(--text-secondary)]">
                        No hay documentos principales para este filtro.
                      </span>
                    )}
                  </div>

                  {isOpen ? (
                    <div className="mt-6 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm">
                      {isLoadingDetail ? (
                        <p className="text-sm text-[color:var(--text-secondary)]">
                          Cargando adjuntos...
                        </p>
                      ) : hasDetailError ? (
                        <p className="text-sm text-rose-500">
                          No pudimos cargar los adjuntos de esta prefactura.
                        </p>
                      ) : detail?.detalles?.length ? (
                        <div className="flex flex-col gap-4">
                          {detail.detalles.map((detalle) => {
                            const producciones = normalizeProducciones(detalle);
                            return (
                              <div
                                key={detalle.id}
                                className="rounded-2xl border border-white/60 bg-white/80 p-4"
                              >
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-semibold text-[color:var(--text-primary)]">
                                    {detalle.servicio?.nombre || "Servicio"}
                                  </span>
                                  <span className="text-xs text-[color:var(--text-secondary)]">
                                    {detalle.entidad?.nombre || "Sin entidad"}
                                  </span>
                                </div>

                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                  {producciones.map((prod, index) => {
                                    const attachments = buildProduccionAttachments(prod);
                                    const visibleAttachments = filterByType(attachments);
                                    const label = prod?.id
                                      ? `Gestión #${prod.id}`
                                      : `Gestión ${index + 1}`;
                                    return (
                                      <div
                                        key={prod?.id || index}
                                        className="rounded-xl border border-white/60 bg-white/90 p-3"
                                      >
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                                          {label}
                                        </span>
                                        {visibleAttachments.length > 0 ? (
                                          <div className="mt-2 flex flex-col gap-2">
                                            {visibleAttachments.map((item) => (
                                              <a
                                                key={`${label}-${item.label}`}
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                                              >
                                                <RiFileDownloadLine className="h-3.5 w-3.5" aria-hidden="true" />
                                                {item.label}
                                              </a>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="mt-2 text-xs text-[color:var(--text-secondary)]">
                                            Sin adjuntos para este filtro.
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[color:var(--text-secondary)]">
                          No hay adjuntos registrados para esta prefactura.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
            {hasFilters
              ? "No se encontraron documentos con los filtros actuales."
              : "Aún no hay prefacturas para mostrar."}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-[color:var(--text-secondary)]">
            Página {currentPage} de {meta.pages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange("prev")}
              className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] disabled:opacity-40"
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => handlePageChange("next")}
              className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] disabled:opacity-40"
              disabled={currentPage >= (meta.pages || 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentosPage;
