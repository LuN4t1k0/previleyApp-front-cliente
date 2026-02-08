import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import Pagination from "@/utils/pagination";

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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Preview</h2>
        <span className="text-xs text-gray-500">Total: {total}</span>
      </div>
      <div className="overflow-auto">
        <Table className="min-w-full text-sm">
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableHeaderCell key={col.key}>{col.label}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length}>
                  <div className="py-6 text-center text-sm text-gray-500">Cargando...</div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length}>
                  <div className="py-6 text-center text-sm text-gray-500">Sin resultados</div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={`${row.id || idx}`}>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key}>{String(row[col.key] ?? "")}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination paginationCount={paginationCount} actualPage={pageIndex + 1} setPage={onPageChange} />
      </div>
    </div>
  );
};

export default PreviewTable;
