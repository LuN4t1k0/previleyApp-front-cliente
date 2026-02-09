"use client";

import React, { useEffect, useRef, useState } from "react";
import apiService from "@/app/api/apiService";
import DatasetSelector from "@/components/reporting/DatasetSelector";
import ColumnPicker from "@/components/reporting/ColumnPicker";
import FiltersBuilder from "@/components/reporting/FiltersBuilder";
import SortBuilder from "@/components/reporting/SortBuilder";
import PreviewTable from "@/components/reporting/PreviewTable";
import ExportPanel from "@/components/reporting/ExportPanel";
import ExportHistoryPanel from "@/components/reporting/ExportHistoryPanel";
import toast from "react-hot-toast";

const DEFAULT_LIMIT = 5;
const OP_LABELS = {
  eq: "igual a",
  in: "en",
  ilike: "contiene",
  startsWith: "empieza con",
  endsWith: "termina con",
  between: "entre",
  gte: ">= ",
  lte: "<= ",
};

const ReportesPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [datasetSchema, setDatasetSchema] = useState(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState([]);
  const [preview, setPreview] = useState({ data: [], total: 0 });
  const [previewRan, setPreviewRan] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportJob, setExportJob] = useState(null);
  const [exportElapsed, setExportElapsed] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [exportHistory, setExportHistory] = useState({ data: [], total: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const lastExportStatus = useRef(null);

  const selectedDataset = datasetSchema;

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiService.get("/reporting/datasets");
        setDatasets(data);
        if (data.length) {
          setSelectedDatasetId(data[0].id);
        }
      } catch (error) {
        toast.error("No se pudieron cargar los datasets.");
      }
    };
    load();
  }, []);

  const loadExportHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await apiService.get("/reporting/exports?limit=3&offset=0");
      setExportHistory(data);
    } catch (_) {
      toast.error("No se pudo cargar el historial de exportaciones.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const clearExportHistory = async () => {
    const confirmed = window.confirm("¿Eliminar todas tus exportaciones recientes?");
    if (!confirmed) return;
    setHistoryLoading(true);
    try {
      const { data } = await apiService.delete("/reporting/exports");
      toast.success(`Exportaciones eliminadas: ${data.deleted}`);
      loadExportHistory();
    } catch (_) {
      toast.error("No se pudieron eliminar las exportaciones.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadExportHistory();
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;
    const loadSchema = async () => {
      try {
        const { data } = await apiService.get(`/reporting/datasets/${selectedDatasetId}/schema`);
        setDatasetSchema(data);
        const defaults =
          data.defaultColumns?.length > 0
            ? data.defaultColumns
            : data.columns.slice(0, 5).map((c) => c.key);
        setSelectedColumns(defaults);
        setSort(data.defaultSort || []);
        setFilters([]);
        setPageIndex(0);
        setPreview({ data: [], total: 0 });
        setPreviewRan(false);
        setActiveStep(1);
      } catch (error) {
        toast.error("No se pudo cargar el esquema del dataset.");
      }
    };
    loadSchema();
  }, [selectedDatasetId]);

  const normalizeFilters = (items) => {
    return (items || []).filter((f) => {
      if (!f?.field || !f?.op) return false;
      if (f.op === "in") return Array.isArray(f.value) && f.value.length > 0;
      if (f.op === "between") return f.value?.from && f.value?.to;
      if (typeof f.value === "number") return true;
      return typeof f.value === "string" ? f.value.trim() !== "" : Boolean(f.value);
    });
  };

  const buildPayload = (override = {}) => ({
    datasetId: selectedDatasetId,
    columns: selectedColumns,
    filters: normalizeFilters(filters),
    sort,
    pagination: {
      limit,
      offset: pageIndex * limit,
    },
    ...override,
  });

  const runPreview = async (override = {}) => {
    if (!selectedDatasetId) return;
    setLoading(true);
    try {
      if (override.pagination?.offset === 0) {
        setPageIndex(0);
      }
      const { data } = await apiService.post("/reporting/query", buildPayload(override));
      setPreview(data);
      setPreviewRan(true);
      setActiveStep(3);
    } catch (error) {
      toast.error("Error al generar preview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPreviewRan(false);
  }, [selectedColumns, filters, sort]);

  useEffect(() => {
    if (!selectedDatasetId || preview.data.length === 0) return;
    runPreview();
  }, [pageIndex, limit]);

  const handleExport = async () => {
    if (!selectedDatasetId) return;
    try {
      const { data } = await apiService.post("/reporting/exports", {
        datasetId: selectedDatasetId,
        columns: selectedColumns,
        filters: normalizeFilters(filters),
        sort,
        format: exportFormat,
      });
      setExportJob({
        id: data.id,
        status: data.status,
        createdAt: new Date().toISOString(),
      });
      loadExportHistory();
      setActiveStep(4);
      toast.success("Export encolado.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al crear export.");
    }
  };

  useEffect(() => {
    if (!exportJob?.id) return;
    let timer = null;
    const poll = async () => {
      try {
        const { data } = await apiService.get(`/reporting/exports/${exportJob.id}`);
        setExportJob({
          id: data.id,
          status: data.status,
          rowCount: data.rowCount,
          estimatedRows: data.estimatedRows,
          errorMessage: data.errorMessage,
          downloadUrl: data.downloadUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
        });
      } catch (_) {}
    };
    poll();
    timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [exportJob?.id]);

  useEffect(() => {
    if (!exportJob?.status || ["done", "failed"].includes(exportJob.status)) {
      setExportElapsed("");
      return;
    }
    const start = exportJob.createdAt ? new Date(exportJob.createdAt).getTime() : Date.now();
    const tick = () => {
      const diff = Date.now() - start;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setExportElapsed(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [exportJob?.status, exportJob?.createdAt]);

  useEffect(() => {
    if (!exportJob?.status || lastExportStatus.current === exportJob.status) return;
    lastExportStatus.current = exportJob.status;
    if (exportJob.status === "done") {
      toast.success("Export listo para descargar.");
      loadExportHistory();
    }
    if (exportJob.status === "failed") {
      toast.error("Export falló. Revisa el detalle.");
      loadExportHistory();
    }
  }, [exportJob?.status]);

  useEffect(() => {
    const hasPending = exportHistory.data?.some((job) =>
      ["queued", "processing"].includes(job.status)
    );
    if (!hasPending) return;
    const timer = setInterval(loadExportHistory, 5000);
    return () => clearInterval(timer);
  }, [exportHistory.data]);

  useEffect(() => {
    if (exportJob?.status) {
      setActiveStep(4);
    }
  }, [exportJob?.status]);

  const getColumnLabel = (key) =>
    selectedDataset?.columns?.find((col) => col.key === key)?.label || key;

  const formatFilterValue = (filter) => {
    if (filter?.op === "between") {
      return `${filter?.value?.from || ""} a ${filter?.value?.to || ""}`.trim();
    }
    if (filter?.op === "in" && Array.isArray(filter.value)) {
      return filter.value.join(", ");
    }
    return String(filter?.value ?? "");
  };

  const summaryFilters = normalizeFilters(filters);
  const columnSummary = () => {
    if (!selectedColumns.length) return "Sin columnas";
    const labels = selectedColumns.map(getColumnLabel);
    const head = labels.slice(0, 3).join(", ");
    return labels.length > 3 ? `${head} +${labels.length - 3} más` : head;
  };
  const estimatedTotal = preview.total || exportJob?.estimatedRows || 0;
  const filteredPreviewData = searchTerm
    ? preview.data.filter((row) =>
        Object.values(row || {}).some((value) =>
          String(value ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : preview.data;
  const activeSubtitle =
    activeStep === 4
      ? "Finaliza tu configuración y exporta tu reporte personalizado."
      : "Sigue los pasos para generar un informe personalizado.";

  const resetSelections = () => {
    const defaults =
      selectedDataset?.defaultColumns?.length > 0
        ? selectedDataset.defaultColumns
        : selectedDataset?.columns?.slice(0, 5).map((c) => c.key) || [];
    setSelectedColumns(defaults);
    setFilters([]);
    setSort(selectedDataset?.defaultSort || []);
    setPreview({ data: [], total: 0 });
    setPreviewRan(false);
    setPageIndex(0);
  };

  useEffect(() => {
    if (!autoRefresh || activeStep !== 3 || !selectedDatasetId) return;
    const timer = setInterval(() => {
      runPreview({ pagination: { limit, offset: pageIndex * limit } });
    }, 8000);
    return () => clearInterval(timer);
  }, [autoRefresh, activeStep, selectedDatasetId, limit, pageIndex]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav aria-label="Breadcrumb" className="flex mb-2">
            <ol className="flex items-center space-x-2 text-xs text-slate-500">
              <li>
                <span className="hover:text-blue-600">Dashboard</span>
              </li>
              <li>
                <span className="material-icons-round text-[14px]">chevron_right</span>
              </li>
              <li className="font-medium text-slate-900">Reportes Dinámicos</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight">Constructor de Reportes</h1>
          <p className="text-slate-500 mt-1">{activeSubtitle}</p>
        </div>
        <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <div
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeStep === 1 ? "bg-blue-50 text-blue-600" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                activeStep === 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              1
            </span>
            <span className="text-sm font-semibold">Configuración</span>
          </div>
          <div
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeStep === 2 ? "bg-blue-50 text-blue-600" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                activeStep === 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </span>
            <span className="text-sm font-medium">Refinar</span>
          </div>
          <div
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeStep === 3 ? "bg-blue-50 text-blue-600" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                activeStep === 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </span>
            <span className="text-sm font-medium">Vista Previa</span>
          </div>
          <div
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeStep === 4 ? "bg-blue-50 text-blue-600" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                activeStep === 4 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              4
            </span>
            <span className="text-sm font-medium">Exportar</span>
          </div>
        </div>
      </div>

      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <DatasetSelector
              datasets={datasets}
              selectedId={selectedDatasetId}
              onSelect={setSelectedDatasetId}
              showSearch={false}
            />
            <ColumnPicker
              dataset={selectedDataset}
              selectedColumns={selectedColumns}
              onChange={setSelectedColumns}
            />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActiveStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-500"
                disabled={!selectedDatasetId || selectedColumns.length === 0}
              >
                Siguiente Paso
                <span className="material-icons-round">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={resetSelections}
                className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round">delete_sweep</span>
                Limpiar selección
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex gap-3">
                <span className="material-icons-round text-blue-500 text-sm">info</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Para resultados más rápidos, define una empresa o un periodo de fecha específico.
                  Esto reducirá el tiempo de procesamiento de tu reporte.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Glosario rápido
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Dataset:</span> origen de datos
                  curado por el sistema.
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Gestión:</span> agrupación de
                  casos o periodos del servicio.
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Detalle:</span> registro individual
                  por trabajador o evento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                    Registros Estimados
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-blue-600">
                      {estimatedTotal.toLocaleString("es-CL")}
                    </span>
                    <span className="material-icons-round text-emerald-500 text-sm">check_circle</span>
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-icons-round text-blue-600">analytics</span>
                Resumen Actual
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Dataset</p>
                  <p className="text-sm font-medium mt-0.5">{selectedDataset?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Columnas</p>
                  <p className="text-sm font-medium mt-0.5">{columnSummary()}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Filtros Activos</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {summaryFilters.length ? (
                      summaryFilters.map((filter, index) => (
                        <span
                          key={`${filter.field}-${index}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium border border-slate-200"
                        >
                          {`${getColumnLabel(filter.field)}: ${formatFilterValue(filter)}`}
                          <button
                            onClick={() =>
                              setFilters(filters.filter((_, idx) => idx !== index))
                            }
                            className="material-icons-round text-[14px] hover:text-red-500"
                          >
                            close
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Sin filtros</span>
                    )}
                  </div>
                </div>
              </div>
            </section>
            <FiltersBuilder dataset={selectedDataset} filters={filters} onChange={setFilters} />
          </div>
          <div className="space-y-6">
            <SortBuilder dataset={selectedDataset} sort={sort} onChange={setSort} maxSorts={1} />
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActiveStep(3)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                Siguiente Paso
                <span className="material-icons-round">arrow_forward</span>
              </button>
              <button
                onClick={() => setActiveStep(1)}
                className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round">arrow_back</span>
                Volver
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex gap-3">
                <span className="material-icons-round text-blue-500 text-sm">info</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Para resultados más rápidos, define una empresa o un periodo de fecha específico.
                  Esto reducirá el tiempo de procesamiento de tu reporte.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="Buscar en resultados..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Auto-refrescar
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    className="sr-only peer"
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <span className="material-icons-round text-lg">view_column</span>
                Columnas
              </button>
              <button
                onClick={() => runPreview({ pagination: { limit, offset: 0 } })}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
              >
                <span className="material-icons-round text-lg">refresh</span>
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-500"
                disabled={!previewRan}
              >
                Siguiente
              </button>
            </div>
          </div>
          <PreviewTable
            dataset={selectedDataset}
            columns={selectedColumns}
            data={filteredPreviewData}
            total={preview.total || 0}
            pageIndex={pageIndex}
            limit={limit}
            onPageChange={setPageIndex}
            loading={loading}
          />
        </>
      )}

      {activeStep === 4 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ExportPanel
                format={exportFormat}
                setFormat={setExportFormat}
                onExport={handleExport}
                onEdit={() => setActiveStep(2)}
                status={exportJob?.status}
                rowCount={exportJob?.rowCount}
                errorMessage={exportJob?.errorMessage}
                downloadUrl={exportJob?.status === "done" ? exportJob.downloadUrl : null}
                disabled={!selectedDatasetId || selectedColumns.length === 0}
              />
              <ExportHistoryPanel
                exportsData={exportHistory.data}
                loading={historyLoading}
                onRefresh={loadExportHistory}
                onClear={clearExportHistory}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Resumen del Reporte
                    </p>
                    <h3 className="text-xl font-bold">Listo para procesar</h3>
                  </div>
                  <span className="material-icons-round absolute -bottom-4 -right-4 text-white/5 text-8xl transform rotate-12">
                    receipt_long
                  </span>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Dataset de origen
                    </span>
                    <p className="font-semibold text-slate-800 flex items-center gap-2 mt-1">
                      <span className="material-icons-round text-blue-600 text-sm">database</span>
                      {selectedDataset?.name || "-"}
                    </p>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Columnas seleccionadas
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedColumns.slice(0, 4).map((col) => (
                        <span
                          key={col}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                        >
                          {getColumnLabel(col)}
                        </span>
                      ))}
                      {selectedColumns.length > 4 && (
                        <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs">
                          +{selectedColumns.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Filtros Activos
                    </span>
                    <p className="text-sm text-slate-600 mt-1 italic">
                      {summaryFilters.length
                        ? summaryFilters
                            .map(
                              (f) =>
                                `${getColumnLabel(f.field)} ${OP_LABELS[f.op] || f.op} ${formatFilterValue(f)}`
                            )
                            .join(" · ")
                        : "Sin filtros"}
                    </p>
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Registros estimados:</span>
                      <span className="font-bold">~ {estimatedTotal} filas</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-slate-500">Tamaño estimado:</span>
                      <span className="font-bold">
                        {estimatedTotal
                          ? `${Math.max(1, Math.round((estimatedTotal * selectedColumns.length * 6) / 1024))} KB`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex gap-3">
                  <span className="material-icons-round text-blue-500">info</span>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">¿Necesitas ayuda?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Los reportes grandes pueden tardar unos minutos en procesarse. Te
                      notificaremos cuando esté listo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportesPage;
