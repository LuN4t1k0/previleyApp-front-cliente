
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

import { convertFiltersToQueryParams } from "@/utils/filters";
import Titulo from "@/components/title/Title";


import Produccion from "@/config/module/produccion.config";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import RealtimeNotices from "@/components/notifications/RealtimeNotices";
import apiService from "@/app/api/apiService";
import useActionFeedback from "@/hooks/useActionFeedback";
import { useSession } from "next-auth/react";

const ProduccionContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);

  const { data: session } = useSession(); // 👈 obtener sesión

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;
  const [sorting, setSorting] = useState([]);

const { runWithFeedback } = useActionFeedback();

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
  } = Produccion;

  const {
    // data,
    // loading,
    // total,
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

const {
  data,
  loading,
  total,
  lastRowRef,
  refetch, // ✅ nuevo
} = useInfiniteScroll({
  fetchFn: ({ offset, limit }) =>
    fetchPage({
      offset,
      limit,
      extraParams: convertFiltersToQueryParams(filters, Produccion.filters),
    }),
  limit: 20,
  deps: [JSON.stringify(filters)],
});

  // Realtime se configura más abajo, luego de declarar refreshData

// NUEVO: necesario para el infinite scroll y para que funcione el refetch
// const refreshData = Produccion.useInfiniteScroll ? refetch : fetchData;

  const queryParams = { limit: 10, offset: 0 };


  const { uniqueValues, loading: loadingFilters, refetchFilters } = useFilters(
  filtersPath,
  queryParams,
  filterConfig
);


const refreshData = useCallback(async () => {
  if (Produccion.useInfiniteScroll) {
    await refetch();
  } else {
    await fetchData();
  }
  await refetchFilters(); // 👈 recarga las opciones del filtro
}, [refetch, fetchData, refetchFilters]);



  const handleCreate = useCallback(() => {
  openModal("crearEditar", {
    handleSubmit,
    refreshData, 
    updatePath,
    createPath,
  });
}, [openModal, handleSubmit, refreshData, updatePath, createPath]);

const handleEdit = useCallback(
  (item) => {
    openModal("crearEditar", {
      initialData: item,
      handleSubmit,
      refreshData,
      updatePath,
      createPath,
    });
  },
  [openModal, handleSubmit, refreshData, updatePath, createPath]
);


const handleValidateProduccion = useCallback(
  async (rowData) => {
    try {
      const { id } = rowData;
      await runWithFeedback({
        action: () => apiService.post(`/produccion/${id}/validate`),
        loadingMessage: "Validando producción...",
        errorMessage: "Error al validar la producción",
      });

      await refreshData();
    } catch (err) {
      console.error("Error al validar producción", error);
    }
  },
  [refreshData, runWithFeedback, error]
);

const handleRejectProduccion = useCallback((rowData) => {
  openModal("rejectProduccion", {
    initialData: rowData,
    fetchData: refreshData, // 👈 reemplazado
  });
}, [openModal, refreshData]);


const handleRevertProduccion = useCallback(
  async (rowData) => {
    const userId = session?.user?.id;

    if (!userId) {
      console.error("Usuario no autenticado");
      return;
    }

    try {
      const { id } = rowData;

      await runWithFeedback({
        action: () =>
          apiService.post(`/produccion/${id}/revert`, { userId }),
        loadingMessage: "Reabriendo producción...",
        errorMessage: "Error al reabrir la producción",
      });

      await refreshData();
    } catch (error) {
      console.error("Error al revertir producción", error);
    }
  },
  [refreshData, runWithFeedback, session]
);

 

  const actionHandlers = {
    create: handleCreate,
    editar: handleEdit,
    eliminar: handleDelete,
    validarProduccion: handleValidateProduccion,
    rechazarProduccion: handleRejectProduccion,
    revertirProduccion: handleRevertProduccion,
  };




  const convertSortingToQueryParams = useCallback((sorting) => {
    if (sorting.length === 0) return {};
    const sortField = sorting[0].id;
    const sortOrder = sorting[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, []);

  useEffect(() => {
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
]);

  // Realtime: produccion CRUD → refrescar listado (debounced)
  const { socket } = useSocket(session?.accessToken);
  const debouncedRefresh = useDebouncedCallback(refreshData, 600);
  useRealtimeEntity(socket, "produccion", {
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
        data={data}
        total={total}
        loading={loading}
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
        convertFiltersToQueryParams={convertFiltersToQueryParams}
        fetchData={fetchData}
        filters={filters}
        actionHandlers={actionHandlers}
        role={role}
        columnOrder={Produccion.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={lastRowRef}
        useInfiniteScroll={Produccion.useInfiniteScroll} // Habilitar infinite scroll
      />
    </div>
  );
};

const Producciones = () => (
  <FilterProvider config={Produccion}>
    <ModalProvider modalsConfig={Produccion.modalsConfig}>
      <ProduccionContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default Producciones;
