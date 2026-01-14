

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

import EmpresasConfig from "@/config/module/empresas.config";
import Restricted from "@/components/restricted/Restricted";

const EmpresasPageContent = () => {
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
  } = EmpresasConfig;

  const {
    data,
    total,
    loading,
    error,

    handleDelete,
    handleSubmit,
    fetchData,
    fetchDetails,
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
    openModal("crearEditar", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  const handleEdit = useCallback(
    (item) => {
      openModal("crearEditar", {
        initialData: item,
        handleSubmit,
        fetchData,
        updatePath,
        createPath,
      });
    },
    [openModal, handleSubmit, fetchData, updatePath, createPath]
  );

const handleAssignEmpresa = useCallback(() => {
  openModal("asignarEmpresa", { fetchData });
}, [openModal, fetchData]);

  // GENERAR DETALLE:
  const handleViewDetails = useCallback(
    async (item) => {
      try {
        const fetchedDetails = await fetchDetails(item.empresaRut);
        console.log("Detalles obtenidos para la modal:", fetchedDetails);
        if (fetchedDetails) {
          openModal("empresaDetails", { empresaData: fetchedDetails });
        }
      } catch (error) {
        console.error("Error fetching license details:", error);
      }
    },
    [fetchDetails, openModal]
  );


const actionHandlers = {
  create: handleCreate,
  editar: handleEdit,
  eliminar: handleDelete,
  asignarEmpresa: handleAssignEmpresa,
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
    if (EmpresasConfig.useInfiniteScroll) return;
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

  // Realtime: empresas (created/updated/deleted) → refrescar listado automáticamente
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
  const debouncedRefresh = useDebouncedCallback(refreshData, 600);
  useRealtimeEntity(socket, "empresa", {
    onCreated: () => debouncedRefresh(),
    onUpdated: () => debouncedRefresh(),
    onDeleted: () => debouncedRefresh(),
  });

  if (!canView) {
    return <Restricted />;
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
        data={EmpresasConfig.useInfiniteScroll ? infData : data}
        total={EmpresasConfig.useInfiniteScroll ? infTotal : total}
        loading={EmpresasConfig.useInfiniteScroll ? infLoading : loading}
        error={error}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        limit={limit}
        excludeColumns={excludeColumns}
        canEdit={canEdit}
        canDelete={canDelete}
        handleEdit={canEdit ? handleEdit : null}
        handleCreate={canEdit ? handleCreate : null}
        handleDelete={canDelete ? handleDelete : null}
        handleBulkDelete={handleBulkDelete}
        monetaryColumns={monetaryColumns}
        badgesConfig={badgesConfig}
        dateColumns={dateColumns}
        columnsConfig={columnsConfig}
        sorting={sorting}
        setSorting={setSorting}
        handleViewDetails={handleViewDetails}
        convertFiltersToQueryParams={convertFiltersToQueryParams}
        fetchData={fetchData}
        filters={filters}
        actionHandlers={actionHandlers}
        role={role}
        columnOrder={EmpresasConfig.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={EmpresasConfig.useInfiniteScroll ? lastRowRef : undefined}
        useInfiniteScroll={EmpresasConfig.useInfiniteScroll}
      />
    </div>
  );
};

const Empresas = () => (
  <FilterProvider config={EmpresasConfig}>
    <ModalProvider modalsConfig={EmpresasConfig.modalsConfig}>
      <EmpresasPageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default Empresas;
