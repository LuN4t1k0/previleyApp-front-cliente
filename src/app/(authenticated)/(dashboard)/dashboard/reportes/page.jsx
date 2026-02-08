"use client";

import React, { useEffect, useMemo, useState } from "react";
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

  const buildPayload = (override = {}) => ({
    datasetId: selectedDatasetId,
    columns: selectedColumns,
    filters,
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
        filters,
        sort,
        format: exportFormat,
      });
      setExportJob({ id: data.id, status: data.status });
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
        });
      } catch (_) {}
    };
    poll();
    timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [exportJob?.id]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-lg font-semibold text-gray-900">Reportes Dinámicos</h1>
      <DatasetSelector
        datasets={datasets}
        selectedId={selectedDatasetId}
        onSelect={setSelectedDatasetId}
      />
      <ColumnPicker
        dataset={selectedDataset}
        selectedColumns={selectedColumns}
        onChange={setSelectedColumns}
      />
      <FiltersBuilder dataset={selectedDataset} filters={filters} onChange={setFilters} />
      <SortBuilder dataset={selectedDataset} sort={sort} onChange={setSort} />

      <div className="flex items-center gap-2">
        <button
          onClick={() => runPreview({ pagination: { limit, offset: 0 } })}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          disabled={!selectedDatasetId || selectedColumns.length === 0}
        >
          Ejecutar preview
        </button>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="rounded border px-2 py-1 text-sm"
        >
          {[25, 50, 100, 200].map((size) => (
            <option key={size} value={size}>
              {size} filas
            </option>
          ))}
        </select>
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

      <ExportPanel
        format={exportFormat}
        setFormat={setExportFormat}
        onExport={handleExport}
        status={exportJob?.status}
        rowCount={exportJob?.rowCount}
        errorMessage={exportJob?.errorMessage}
        downloadUrl={exportJob?.status === "done" ? exportJob.downloadUrl : null}
        disabled={!selectedDatasetId || selectedColumns.length === 0}
      />
    </div>
  );
};

export default ReportesPage;
