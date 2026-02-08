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

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">Vista Previa</h2>
          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wide">
            Actualizado ahora
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-bold text-slate-900">
              {Math.min(limit, total || 0)}
            </span>{" "}
            resultados
          </span>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex space-x-1">
            <button
              className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-30"
              disabled={pageIndex === 0}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <span className="material-icons-round text-lg">chevron_left</span>
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page - 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold ${
                  page === pageIndex + 1
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              className="p-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-30"
              disabled={pageIndex + 1 >= paginationCount}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              <span className="material-icons-round text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-6 py-10 text-center text-sm text-slate-500">
                    Cargando...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-6 py-10 text-center text-sm text-slate-500">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={`${row.id || idx}`} className="hover:bg-slate-50 transition">
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                        {String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreviewTable;
