import React from "react";

const ExportPanel = ({
  format,
  setFormat,
  onExport,
  onEdit,
  status,
  rowCount,
  errorMessage,
  downloadUrl,
  disabled,
}) => {
  const isGenerating = status === "queued" || status === "processing";

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
          <span className="material-icons-round">file_download</span>
        </div>
        <h2 className="text-xl font-bold">Configuración de Exportación</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <label
          className={`relative flex flex-col items-center p-6 rounded-2xl cursor-pointer group transition-all border-2 ${
            format === "csv"
              ? "border-blue-600 bg-blue-50/50"
              : "border-slate-100 hover:border-blue-200"
          }`}
        >
          <input
            checked={format === "csv"}
            className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4"
            name="format"
            type="radio"
            value="csv"
            onChange={() => setFormat("csv")}
          />
          <span
            className={`material-icons-round text-4xl mb-2 ${
              format === "csv" ? "text-primary" : "text-slate-400 group-hover:text-primary"
            }`}
          >
            description
          </span>
          <span className="font-bold">Formato CSV</span>
          <span className="text-xs text-slate-500 mt-1 text-center">
            Compatible con Excel y bases de datos.
          </span>
        </label>
        <label
          className={`relative flex flex-col items-center p-6 rounded-2xl cursor-pointer group transition-all border-2 ${
            format === "xlsx"
              ? "border-blue-600 bg-blue-50/50"
              : "border-slate-100 hover:border-blue-200"
          }`}
        >
          <input
            checked={format === "xlsx"}
            className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4"
            name="format"
            type="radio"
            value="xlsx"
            onChange={() => setFormat("xlsx")}
          />
          <span
            className={`material-icons-round text-4xl mb-2 ${
              format === "xlsx" ? "text-primary" : "text-slate-400 group-hover:text-primary"
            }`}
          >
            table_view
          </span>
          <span className="font-bold">Formato XLSX</span>
          <span className="text-xs text-slate-500 mt-1 text-center">
            Formato nativo de Microsoft Excel.
          </span>
        </label>
        <label className="relative flex flex-col items-center p-6 rounded-2xl border-2 border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed">
          <input
            className="absolute top-4 right-4 text-primary focus:ring-primary h-4 w-4"
            name="format"
            type="radio"
            value="pdf"
            disabled
          />
          <span className="material-icons-round text-4xl mb-2">picture_as_pdf</span>
          <span className="font-bold">Formato PDF</span>
          <span className="text-xs mt-1 text-center">Documento listo para imprimir.</span>
          <span className="text-[10px] mt-2 font-semibold text-slate-400">Próximamente</span>
        </label>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onExport}
          disabled={disabled}
          className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
        >
          <span className="material-icons-round">cloud_download</span>
          {isGenerating ? "Generando..." : "Generar y Exportar Reporte"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="w-full sm:w-auto px-10 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-icons-round text-lg">undo</span>
          Volver a Editar
        </button>
      </div>
      {errorMessage && <p className="text-xs text-red-500 mt-4">Error: {errorMessage}</p>}
      {downloadUrl && (
        <a
          href={downloadUrl}
          className="text-xs text-blue-600 underline mt-3 inline-flex"
          target="_blank"
          rel="noreferrer"
        >
          Descargar archivo
        </a>
      )}
      {rowCount !== null && rowCount !== undefined && (
        <p className="text-xs text-slate-500 mt-2">Filas exportadas: {rowCount}</p>
      )}
    </div>
  );
};

export default ExportPanel;
