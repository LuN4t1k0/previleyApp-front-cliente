"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRole } from "@/context/RoleContext";
import { useFilters } from "@/hooks/useFilters";
import { FilterContext, FilterProvider } from "@/context/FilterContext";
import GenericFilter from "@/components/filters/GenericFilter";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import { ModalProvider, useModal } from "@/context/ModalContext";
import ModalManager from "@/components/modal/ModalManager";

import ActionButtons from "@/components/actions/ActionButtons";
import { useCrud } from "@/hooks/useCrud";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

import { convertFiltersToQueryParams } from "@/utils/filters";
import Titulo from "@/components/title/Title";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useSession } from "next-auth/react";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import RealtimeNotices from "@/components/notifications/RealtimeNotices";
import Documentos from "@/config/module/empresasDocumentos.config";

const DocumentosEmpresaContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;
  const [sorting, setSorting] = useState([]);

  const canView = ["admin", "cliente", "previley", "trabajador"].includes(role);
  const canEdit = ["admin", "editor", "trabajador"].includes(role);
  const canDelete = ["admin", "editor", "trabajador"].includes(role);

  const {
    resourcePath,
    deletePath,
    filtersPath,
    title,
    subtitle,
    excludeColumns,
    buildDetailEndpoint,
    filters: filterConfig,
    detailPath,
    createPath,
    bulkDeletePath,
    updatePath,
    bulkUploadPath,
    dateColumns,
    columnsConfig,
    monetaryColumns,
    badgesConfig,
    actionsConfig,
    bulkUploadParentIdField: parentIdField,
    revisarFechaVencimiento
  } = Documentos;

  const {
    data,
    total,
    loading,
    error,

    handleDelete,
    handleSubmit,
    fetchData,
    handleBulkDelete,
    fetchPage,
  } = useCrud(
    resourcePath,
    deletePath,
    detailPath,
    buildDetailEndpoint,
    createPath,
    bulkDeletePath,
    updatePath,
    bulkUploadPath
  );

  const handleCreate = useCallback(() => {
    openModal("crearDocumento", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  // const handleEdit = useCallback(
  //   (item) => {
  //     openModal("editarDocumento", {
  //       initialData: item,
  //       handleSubmit,
  //       fetchData,
  //       updatePath,
  //       createPath,
  //     });
  //   },
  //   [openModal, handleSubmit, fetchData, updatePath, createPath]
  // );

  const actionHandlers = {
    create: handleCreate,
    // editar: handleEdit,
    eliminar: handleDelete,
  };

  const queryParams = { limit: 10, offset: 0 };
  const { uniqueValues, loading: loadingFilters } = useFilters(
    filtersPath,
    queryParams,
    filterConfig
  );

  const convertSortingToQueryParams = useCallback((sorting) => {
    if (sorting.length === 0) return {};
    const sortField = sorting[0].id;
    const sortOrder = sorting[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, []);

  // Infinite scroll
  const {
    data: infData,
    loading: infLoading,
    total: infTotal,
    lastRowRef,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ offset, limit }) =>
      fetchPage({
        offset,
        limit,
        extraParams: {
          ...convertFiltersToQueryParams(filters, filterConfig),
          ...convertSortingToQueryParams(sorting),
        },
      }),
    limit: 20,
    deps: [JSON.stringify(filters), JSON.stringify(sorting)],
  });

  useEffect(() => {
    if (Documentos.useInfiniteScroll) return;
    if (!loadingFilters) {
      const params = {
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters, filterConfig),
        ...convertSortingToQueryParams(sorting),
      };
      fetchData(params);
    }
  }, [
    loadingFilters,
    limit,
    pageIndex,
    filters,
    fetchData,
    sorting,
    convertSortingToQueryParams,
    filterConfig,
  ]);

  // Realtime: empresaDocumento (created/updated/deleted) → refrescar listado
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const refreshData = useCallback(async () => {
    const params = {
      limit,
      offset: pageIndex * limit,
      ...convertFiltersToQueryParams(filters, filterConfig),
      ...convertSortingToQueryParams(sorting),
    };
    await fetchData(params);
  }, [limit, pageIndex, filters, filterConfig, sorting, convertSortingToQueryParams, fetchData]);
  const debouncedRefresh = useDebouncedCallback(async () => {
    if (Documentos.useInfiniteScroll) await refetch(); else await refreshData();
  }, 600);
  useRealtimeEntity(socket, "empresaDocumento", {
    onCreated: () => debouncedRefresh(),
    onUpdated: () => debouncedRefresh(),
    onDeleted: () => debouncedRefresh(),
  });

  if (!canView) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-bold text-gray-700">
          No tienes permiso para ver esta página.
        </h2>
        <p className="text-gray-500 mt-2">
          Contacta al administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative space-y-4">
      <RealtimeNotices socket={socket} />
      {/* 🔹 Título y botones de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Titulo title={title} subtitle={subtitle} />
        </div>

        <div className="mt-2 sm:mt-0 flex flex-row space-x-2 justify-end">
          <ActionButtons
            actionsConfig={actionsConfig}
            actionHandlers={actionHandlers}
          />
        </div>
      </div>

      <div className="flex flex-row items-center space-x-2 flex-grow">
        <GenericFilter
          filters={filters}
          uniqueValues={uniqueValues}
          handleFilterChange={handleFilterChange}
          filterConfig={filterConfig}
        />
      </div>

      <GenericTableWithDetail
        data={Documentos.useInfiniteScroll ? infData : data}
        total={Documentos.useInfiniteScroll ? infTotal : total}
        loading={Documentos.useInfiniteScroll ? infLoading : loading}
        error={error}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        limit={limit}
        excludeColumns={excludeColumns}
        canEdit={canEdit}
        canDelete={canDelete}
        // handleEdit={canEdit ? handleEdit : null}
        handleCreate={canEdit ? handleCreate : null}
        handleDelete={canDelete ? handleDelete : null}
        handleBulkDelete={handleBulkDelete}
        monetaryColumns={monetaryColumns}
        badgesConfig={badgesConfig}
        dateColumns={dateColumns}
        columnsConfig={columnsConfig}
        sorting={sorting}
        setSorting={setSorting}
        convertFiltersToQueryParams={convertFiltersToQueryParams}
        fetchData={fetchData}
        filters={filters}
        actionHandlers={actionHandlers}
        role={role}
        columnOrder={Documentos.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={Documentos.useInfiniteScroll ? lastRowRef : undefined}
        useInfiniteScroll={Documentos.useInfiniteScroll}
      />
    </div>
  );
};

const DocumentosEmpresa = () => (
  <FilterProvider config={Documentos}>
    <ModalProvider modalsConfig={Documentos.modalsConfig}>
      <DocumentosEmpresaContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default DocumentosEmpresa;
