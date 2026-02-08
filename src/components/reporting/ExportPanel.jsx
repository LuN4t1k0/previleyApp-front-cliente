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
    <div className="bg-slate-50 px-6 py-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Formato:</span>
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFormat("csv")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md ${
                format === "csv"
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => setFormat("xlsx")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md ${
                format === "xlsx"
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              XLSX
            </button>
            <button
              disabled
              className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-300 cursor-not-allowed"
            >
              PDF
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Delimitador:</span>
          <select
            disabled
            className="text-[10px] py-1 bg-white border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
          >
            <option>Coma (,)</option>
            <option>Punto y coma (;)</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          disabled={disabled}
          className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 px-8 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generar y Exportar Reporte
        </button>
        {status && <span className="text-xs text-slate-500">Estado: {status}</span>}
      </div>
      {rowCount !== null && rowCount !== undefined && (
        <p className="text-xs text-slate-600">Filas exportadas: {rowCount}</p>
      )}
      {errorMessage && <p className="text-xs text-red-500">Error: {errorMessage}</p>}
      {downloadUrl && (
        <a
          href={downloadUrl}
          className="text-xs text-blue-600 underline"
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
