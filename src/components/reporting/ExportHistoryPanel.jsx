import React from "react";

const STATUS_META = {
  queued: { label: "En cola", tone: "bg-amber-100 text-amber-700" },
  processing: { label: "Procesando", tone: "bg-blue-100 text-blue-700" },
  done: { label: "Listo", tone: "bg-green-100 text-green-700" },
  failed: { label: "Falló", tone: "bg-red-100 text-red-700" },
};

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch (_) {
    return "-";
  }
};

const ExportHistoryPanel = ({ exportsData, loading, onRefresh, onClear }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="material-icons-round text-slate-400">history</span>
          <h2 className="text-lg font-bold">Mis Exportaciones Recientes</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-slate-500 text-sm font-semibold hover:text-red-600 flex items-center gap-1"
            disabled={loading}
          >
            <span className="material-icons-round text-sm">delete_outline</span>
            Eliminar
          </button>
          <button
            onClick={onRefresh}
            className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
            disabled={loading}
          >
            <span className="material-icons-round text-sm">refresh</span>
            Actualizar
          </button>
        </div>
      </div>
      {loading ? (
        <p className="px-8 py-6 text-xs text-slate-400">Cargando exportaciones...</p>
      ) : exportsData?.length ? (
        <div className="divide-y divide-slate-100">
          {exportsData.map((item) => {
            const meta = STATUS_META[item.status] || {
              label: item.status,
              tone: "bg-slate-100 text-slate-600",
            };
            return (
              <div
                key={item.id}
                className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      item.format === "xlsx"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    <span className="material-icons-round">
                      {item.format === "xlsx" ? "table_view" : "description"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.datasetName}</h3>
                    <p className="text-sm text-slate-500">
                      Generado el {formatDateTime(item.createdAt)} •{" "}
                      <span className="text-slate-400">
                        {item.estimatedRows ?? "-"} filas estimadas
                      </span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>
                        {meta.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {item.format?.toUpperCase() || "CSV"}
                      </span>
                    </div>
                    {item.errorMessage && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Error: {item.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="material-icons-round text-lg">download</span>
                    Descargar
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-8 py-6 text-xs text-slate-400">Aún no hay exportaciones.</p>
      )}
    </div>
  );
};

export default ExportHistoryPanel;
