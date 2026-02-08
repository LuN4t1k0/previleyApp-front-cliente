import React from "react";

const ExportPanel = ({
  format,
  setFormat,
  onExport,
  status,
  rowCount,
  errorMessage,
  downloadUrl,
  disabled,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Export</h2>
        {status && <span className="text-xs text-gray-500">Estado: {status}</span>}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Formato</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
        </div>
        <button
          onClick={onExport}
          disabled={disabled}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generar Export
        </button>
      </div>
      {rowCount !== null && rowCount !== undefined && (
        <p className="mt-2 text-xs text-gray-600">Filas exportadas: {rowCount}</p>
      )}
      {errorMessage && (
        <p className="mt-2 text-xs text-red-500">Error: {errorMessage}</p>
      )}
      {downloadUrl && (
        <a
          href={downloadUrl}
          className="mt-3 inline-block text-sm text-blue-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          Descargar archivo
        </a>
      )}
    </div>
  );
};

export default ExportPanel;
