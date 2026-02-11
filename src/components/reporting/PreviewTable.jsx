import React, { useMemo } from "react";

const PreviewTable = ({
  dataset,
  columns,
  data,
  total,
  pageIndex,
  limit,
  onPageChange,
  loading,
}) => {
  const columnMeta = dataset?.columns || [];
  const visibleColumns = columnMeta.filter((c) => columns.includes(c.key));

  const paginationCount = Math.max(1, Math.ceil(total / limit));
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 3;
    const current = pageIndex + 1;
    let start = Math.max(1, current - 1);
    let end = Math.min(paginationCount, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [pageIndex, paginationCount]);

  const renderValue = (col, value) => {
    if (col.label.toLowerCase().includes("estado") && typeof value === "string") {
      const upper = value.toUpperCase();
      const tone =
        upper.includes("APROB")
          ? "bg-green-100 text-green-700"
          : upper.includes("RECHAZ")
            ? "bg-red-100 text-red-700"
            : upper.includes("REDUC")
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-700";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${tone}`}>
          {upper}
        </span>
      );
    }
    return String(value ?? "");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h2 className="font-bold">Vista Previa</h2>
          <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            Actualizado ahora
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">
            Mostrando{" "}
            <strong className="text-slate-900">{Math.min(limit, total || 0)}</strong> de{" "}
            {total} resultados
          </span>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-400 disabled:opacity-50"
              disabled={pageIndex === 0}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <span className="material-icons-round text-sm">chevron_left</span>
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page - 1)}
                className={`px-3 py-1 text-xs font-bold ${
                  page === pageIndex + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-slate-50 text-slate-600 border-x border-slate-200"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-600"
              disabled={pageIndex + 1 >= paginationCount}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              <span className="material-icons-round text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <span className="material-icons-round text-xs text-slate-400">unfold_more</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  Sin resultados
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={`${row.id || idx}`} className="hover:bg-slate-50/50 transition-colors">
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                      {renderValue(col, row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-sm">info</span>
          <span>Esta es una muestra de los datos que se incluirán en el reporte final.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-sm">storage</span>
          <span>Dataset: {dataset?.name || "-"}</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewTable;
