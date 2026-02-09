"use client";

import React, { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import DatasetSelector from "@/components/reporting/DatasetSelector";
import ColumnPicker from "@/components/reporting/ColumnPicker";
import FiltersBuilder from "@/components/reporting/FiltersBuilder";
import SortBuilder from "@/components/reporting/SortBuilder";
import PreviewTable from "@/components/reporting/PreviewTable";
import ExportPanel from "@/components/reporting/ExportPanel";
import toast from "react-hot-toast";

const DEFAULT_LIMIT = 25;

const ReportesPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [datasetSchema, setDatasetSchema] = useState(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState([]);
  const [preview, setPreview] = useState({ data: [], total: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportJob, setExportJob] = useState(null);
  const [exportElapsed, setExportElapsed] = useState("");

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
    } catch (error) {
      toast.error("Error al generar preview.");
    } finally {
      setLoading(false);
    }
  };

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
          errorMessage: data.errorMessage,
          downloadUrl: data.downloadUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
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
          <p className="text-slate-500 mt-1">
            Sigue los pasos para generar un informe personalizado.
          </p>
        </div>
        <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center space-x-2">
            <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-[10px] font-bold">
              1
            </span>
            <span className="text-sm font-semibold">Configuración</span>
          </div>
          <div className="px-4 py-2 text-slate-400 flex items-center space-x-2">
            <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-bold">
              2
            </span>
            <span className="text-sm font-medium">Vista Previa</span>
          </div>
          <div className="px-4 py-2 text-slate-400 flex items-center space-x-2">
            <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-[10px] font-bold">
              3
            </span>
            <span className="text-sm font-medium">Exportar</span>
          </div>
        </div>
      </div>

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
          <FiltersBuilder dataset={selectedDataset} filters={filters} onChange={setFilters} />
          <SortBuilder dataset={selectedDataset} sort={sort} onChange={setSort} maxSorts={1} />
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="text-xs bg-slate-50 border-slate-200 rounded-lg py-2 px-3"
              >
                {[25, 50, 100, 200].map((size) => (
                  <option key={size} value={size}>
                    {size} filas
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => runPreview({ pagination: { limit, offset: 0 } })}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition active:scale-95 flex items-center justify-center space-x-2"
              disabled={!selectedDatasetId || selectedColumns.length === 0}
            >
              <span className="material-icons-round">play_circle_filled</span>
              <span>Ejecutar Previsualización</span>
            </button>
          </div>
        </div>
      </div>

      <PreviewTable
        dataset={selectedDataset}
        columns={selectedColumns}
        data={preview.data}
        total={preview.total || 0}
        pageIndex={pageIndex}
        limit={limit}
        onPageChange={setPageIndex}
        loading={loading}
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-6">
        <ExportPanel
          format={exportFormat}
          setFormat={setExportFormat}
          onExport={handleExport}
          status={exportJob?.status}
          elapsed={exportElapsed}
          updatedAt={exportJob?.updatedAt}
          rowCount={exportJob?.rowCount}
          errorMessage={exportJob?.errorMessage}
          downloadUrl={exportJob?.status === "done" ? exportJob.downloadUrl : null}
          disabled={!selectedDatasetId || selectedColumns.length === 0}
        />
      </div>
    </div>
  );
};

export default ReportesPage;
