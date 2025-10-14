"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { generateColumns } from "../../utils/generateColumns";
import Pagination from "../../utils/pagination";
import BulkActions from "../modal/BulkActions";
import InitialSkeleton from "../skeleton/InitialSkeleton";
import { formatChileanPeso } from "@/utils/monetaryFormatUtils";
import { RiArrowDownLine, RiArrowUpLine } from "@remixicon/react";
import CustomBadge from "../badge/Badge";

const IndeterminateCheckbox = ({ indeterminate, className = "", ...rest }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={`${className} h-4 w-4 rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500`}
      {...rest}
    />
  );
};

const SkeletonRow = ({ columns }) => (
  <TableRow>
    {columns.map((column, index) => (
      <TableCell key={index}>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </TableCell>
    ))}
  </TableRow>
);

const GenericTableWithDetail = ({
  data,
  total,
  loading,
  error,
  pageIndex,
  setPageIndex,
  limit,
  excludeColumns,
  title,
  subtitle,
  canDelete,
  filters,
  convertFiltersToQueryParams,
  handleViewDetails,
  handleBulkDelete,
  fetchData,
  monetaryColumns = [],
  dateColumns = [],
  percentageColumns = [],
  badgesConfig = {},
  columnsConfig = [],
  sorting,
  setSorting,
  actionHandlers = {},
  role,
  columnOrder,
  revisarFechaVencimiento = [],
  scrollTriggerRef,
  useInfiniteScroll,
  periodoColumns = [],
}) => {
  const [rowSelection, setRowSelection] = useState({});
  const paginationCount = useInfiniteScroll ? 0 : Math.ceil(total / limit);

  const allFieldsSet = new Set([
    ...Object.keys(data[0] || {}),
    ...columnsConfig.map((c) => c.accessorKey),
  ]);
  const allFields = Array.from(allFieldsSet);

  const columns = useMemo(() => {
    return generateColumns(
      allFields,
      columnsConfig,
      excludeColumns,
      actionHandlers,
      role,
      columnOrder,
      dateColumns,
      monetaryColumns,
      percentageColumns,
      revisarFechaVencimiento,
      periodoColumns
    );
  }, [
    allFields,
    excludeColumns,
    columnsConfig,
    actionHandlers,
    role,
    columnOrder,
    dateColumns,
    monetaryColumns,
    percentageColumns,
    revisarFechaVencimiento,
    periodoColumns
  ]);

  const tableColumns = useMemo(() => {
    const cols = [...columns];
    if (canDelete) {
      cols.unshift({
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
              onClick: (e) => e.stopPropagation(),
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
              onClick: (e) => e.stopPropagation(),
            }}
          />
        ),
      });
    }
    return cols;
  }, [columns, canDelete]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  const convertSortingToQueryParams = useCallback(() => {
    if (!Array.isArray(sorting) || sorting.length === 0) return {};
    const sortField = sorting[0].id;
    const sortOrder = sorting[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, [sorting]);

  const handleBulkDeleteWithReset = useCallback(
    async (selectedIds) => {
      await handleBulkDelete(selectedIds);
      setRowSelection({});
      fetchData({
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters),
        ...convertSortingToQueryParams(),
      });
    },
    [
      handleBulkDelete,
      fetchData,
      limit,
      pageIndex,
      convertFiltersToQueryParams,
      filters,
      convertSortingToQueryParams,
    ]
  );

  const handleRowClick = useCallback(
    async (row) => {
      if (handleViewDetails) {
        await handleViewDetails(row.original);
      }
    },
    [handleViewDetails]
  );

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative">
      {loading && !useInfiniteScroll && pageIndex > 0
  ? Array.from({ length: limit }).map((_, index) => (
      <SkeletonRow key={index} columns={columns} />
    )): (
        <>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline">
                {error.message || "Ocurrió un error al cargar los datos."}
              </span>
            </div>
          )}

          <div className="relative overflow-x-auto max-h-[70vh] mt-1">
  <Table className="w-full text-sm sm:text-base">
             
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHeaderCell
                        key={header.id}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            header.column.getCanSort()
                          ) {
                            header.column.getToggleSortingHandler()(event);
                          }
                        }}
                        className={`${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        } group px-0.5 py-1.5
          sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm
          ${header.column.columnDef.meta?.headerAlign || "text-center"}`}
                        tabIndex={header.column.getCanSort() ? 0 : -1}
                        aria-sort={header.column.getIsSorted()}
                      >
                        <div
                          className={`${
                            header.column.getCanSort()
                              ? "flex items-center justify-between gap-2 hover:bg-gray-100"
                              : ""
                          } rounded px-3 py-2.5`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() ? (
                            header.column.getIsSorted() === "asc" ? (
                              <RiArrowUpLine className="size-4 text-tremor-content-strong dark:text-dark-tremor-content-strong" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <RiArrowDownLine className="size-4 text-tremor-content-strong dark:text-dark-tremor-content-strong" />
                            ) : (
                              <RiArrowUpLine className="size-4 text-tremor-content-strong dark:text-dark-tremor-content-strong" />
                            )
                          ) : null}
                        </div>
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>


              <TableBody>
  {/* {loading && pageIndex > 0 */}
  {loading && !useInfiniteScroll && pageIndex > 0
    ? Array.from({ length: limit }).map((_, index) => (
        <SkeletonRow key={index} columns={columns} />
      ))
    : table.getRowModel().rows.map((row, index) => {
        const isLastRow = index === table.getRowModel().rows.length - 1;

        return (
          <TableRow
            key={row.id}
            ref={isLastRow ? scrollTriggerRef : null}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => handleRowClick(row)}
          >
            {row.getVisibleCells().map((cell) => {
              const columnId = cell.column.id;
              const badgeConfig = badgesConfig[columnId];
              const value = cell.getValue();

              let cellContent = null;

              if (badgeConfig) {
                const textTransform = badgeConfig.textTransform ?? "uppercase";

                if (badgeConfig.type === "value") {
                  let variant = "neutral";
                  if (value > 0) {
                    variant = badgeConfig.variants?.positive || "success";
                  } else if (value < 0) {
                    variant = badgeConfig.variants?.negative || "error";
                  } else {
                    variant = badgeConfig.variants?.neutral || "neutral";
                  }

                  cellContent = (
                    <CustomBadge variant={variant} textTransform={textTransform}>
                      {formatChileanPeso(value)}
                    </CustomBadge>
                  );
                } else if (badgeConfig.type === "status") {
                  const variant = badgeConfig.variants?.[value] || "default";
                  cellContent = (
                    <CustomBadge variant={variant} textTransform={textTransform}>
                      {value}
                    </CustomBadge>
                  );
                } else {
                  cellContent = value;
                }
              } else {
                cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
              }

              return (
                <TableCell
                  key={cell.id}
                  className={`${cell.column.columnDef.meta?.align} text-xs sm:text-sm`}
                >
                  {cellContent}
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}

  {!loading && data.length === 0 && !error && (
    <TableRow>
      <TableCell colSpan={table.getAllColumns().length} className="text-center">
        No hay registros que cumplan con los filtros ingresados.
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
            {useInfiniteScroll && (
    <div className="text-center py-2 text-gray-500 text-sm">
      {loading
        ? `Cargando más registros... (${data.length}/${total})`
        : data.length < total
        ? `Desliza para cargar más... (${data.length}/${total})`
        : `Se cargaron todos los registros. (${total}/${total})`}
    </div>
  )}
</div>
         
{!useInfiniteScroll && (
     <Pagination
            paginationCount={paginationCount}
            actualPage={pageIndex + 1}
            setPage={setPageIndex}
          />
)}
     
          <BulkActions
            selectedIds={table.getSelectedRowModel().flatRows.map(r => r.original?.id).filter(Boolean)}
            filteredData={data}
            handleBulkDelete={handleBulkDeleteWithReset}
            canDelete={canDelete}
            onSendSelected={actionHandlers?.sendSelected}
            totalCount={total}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(GenericTableWithDetail);
