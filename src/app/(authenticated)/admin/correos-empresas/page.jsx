
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
import Restricted from "@/components/restricted/Restricted";

// import EmpresaCorreos from "@/config/module/EmpresaCorreos.config";
import EmpresaCorreos from "@/config/module/empresaCorreos.config";

import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";

import useActionFeedback from "@/hooks/useActionFeedback";
import { useSession } from "next-auth/react";

const EmpresaCorreosContent = () => {
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
    revisarFechaVencimiento,
  } = EmpresaCorreos;

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
        extraParams: convertFiltersToQueryParams(
          filters,
          EmpresaCorreos.filters
        ),
      }),
    limit: 20,
    deps: [JSON.stringify(filters)],
  });

  // Socket y realtime para empresaCorreo
  const { socket } = useSocket(session?.accessToken);
  useRealtimeEntity(socket, "empresaCorreo", {
    onCreated: async () => {
      if (EmpresaCorreos.useInfiniteScroll) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        await fetchData(params);
      }
    },
    onUpdated: async () => {
      if (EmpresaCorreos.useInfiniteScroll) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        await fetchData(params);
      }
    },
    onDeleted: async () => {
      if (EmpresaCorreos.useInfiniteScroll) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        await fetchData(params);
      }
    },
  });

  // NUEVO: necesario para el infinite scroll y para que funcione el

  const queryParams = { limit: 10, offset: 0 };

  const {
    uniqueValues,
    loading: loadingFilters,
    refetchFilters,
  } = useFilters(filtersPath, queryParams, filterConfig);

  const refreshData = useCallback(async () => {
    if (EmpresaCorreos.useInfiniteScroll) {
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

  const actionHandlers = {
    create: handleCreate,
    editar: handleEdit,
    eliminar: handleDelete,
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

  if (!canView) {
    return <Restricted />;
  }

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative space-y-4">
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
        columnOrder={EmpresaCorreos.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={lastRowRef}
        useInfiniteScroll={EmpresaCorreos.useInfiniteScroll} // Habilitar infinite scroll
      />
    </div>
  );
};

const CorreosEmpresas = () => (
  <FilterProvider config={EmpresaCorreos}>
    <ModalProvider modalsConfig={EmpresaCorreos.modalsConfig}>
      <EmpresaCorreosContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default CorreosEmpresas;
