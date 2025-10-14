"use client";

import React, { useState, useContext, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import Titulo from "@/components/title/Title";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import EmpresaCorreosConfig from "@/config/module/empresaCorreos.config";

const PageContent = () => {
  const { role } = useRole();
  const { openModal } = useModal();
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const { filters, handleFilterChange } = useContext(FilterContext);

  const canView = ["admin"].includes(role);
  const canEdit = ["admin"].includes(role);
  const canDelete = ["admin"].includes(role);

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
    dateColumns,
    columnsConfig,
    monetaryColumns,
    badgesConfig,
    actionsConfig,
  } = EmpresaCorreosConfig;

  const {
    data,
    total,
    loading,
    error,
    handleDelete,
    handleSubmit,
    fetchData,
    fetchPage,
    handleBulkDelete,
  } = useCrud(
    resourcePath,
    deletePath,
    detailPath,
    buildDetailEndpoint,
    createPath,
    bulkDeletePath,
    updatePath,
  );

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 20;
  const { uniqueValues, loading: loadingFilters, refetchFilters } = useFilters(
    filtersPath,
    { limit: 10, offset: 0 },
    filterConfig
  );

  // No early return with hooks below; render guard handled in JSX

  const convertFiltersToQueryParams = useCallback(
    (currentFilters) => {
      const params = {};
      EmpresaCorreosConfig.filters.forEach(({ key, type, field }) => {
        const value = currentFilters?.[key]?.value;
        if (!value || (Array.isArray(value) && value.length === 0)) return;
        if (type === "text") params[field] = value;
        else if (type === "multiselect") params[field] = value.join(",");
      });
      return params;
    },
    []
  );

  const {
    data: infiniteData,
    loading: infiniteLoading,
    total: infiniteTotal,
    lastRowRef,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ offset, limit }) =>
      fetchPage({
        offset,
        limit,
        extraParams: convertFiltersToQueryParams(filters),
      }),
    limit,
    deps: [JSON.stringify(filters)],
  });

  const refreshData = useCallback(async () => {
    await refetch();
    await refetchFilters();
  }, [refetch, refetchFilters]);

  useRealtimeEntity(socket, "empresaCorreo", {
    onCreated: refreshData,
    onUpdated: refreshData,
    onDeleted: refreshData,
  });

  const handleCreate = useCallback(() => {
    openModal("crearEditar", {
      handleSubmit,
      fetchData: refreshData,
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
        fetchData: refreshData,
        refreshData,
        updatePath,
        createPath,
      });
    },
    [openModal, handleSubmit, refreshData, updatePath, createPath]
  );

  useEffect(() => {
    if (!loadingFilters && !EmpresaCorreosConfig.useInfiniteScroll) {
      fetchData({
        ...convertFiltersToQueryParams(filters),
        limit,
        offset: pageIndex * limit,
      });
    }
  }, [loadingFilters, filters, pageIndex, fetchData, convertFiltersToQueryParams]);

  const actionHandlers = {
    create: handleCreate,
    editar: handleEdit,
    eliminar: handleDelete,
  };

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative">
      {!canView && (
        <div className="text-center mt-10">
          <h2 className="text-xl font-bold text-gray-700">No tienes permiso para ver esta página.</h2>
          <p className="text-gray-500 mt-2">Contacta al administrador si crees que esto es un error.</p>
        </div>
      )}
      {canView && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Titulo title={title} subtitle={subtitle} />
        </div>
        <div className="mt-2 sm:mt-0 flex flex-row space-x-2 justify-end">
          <ActionButtons actionsConfig={actionsConfig} actionHandlers={actionHandlers} />
        </div>
      </div>
      )}

      {canView && (
      <div className="flex flex-row items-center space-x-2 flex-grow mt-3">
        <GenericFilter
          filters={filters}
          uniqueValues={uniqueValues}
          handleFilterChange={handleFilterChange}
          filterConfig={filterConfig}
        />
      </div>
      )}

      {canView && (
      <GenericTableWithDetail
        data={EmpresaCorreosConfig.useInfiniteScroll ? infiniteData : data}
        total={EmpresaCorreosConfig.useInfiniteScroll ? infiniteTotal : total}
        loading={EmpresaCorreosConfig.useInfiniteScroll ? infiniteLoading : loading}
        error={error}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        limit={EmpresaCorreosConfig.useInfiniteScroll ? 20 : 10}
        excludeColumns={excludeColumns}
        title={title}
        subtitle={subtitle}
        canEdit={canEdit}
        canDelete={canDelete}
        handleEdit={canEdit ? handleEdit : null}
        handleCreate={canEdit ? handleCreate : null}
        handleDelete={canDelete ? handleDelete : null}
        handleBulkDelete={canDelete ? handleBulkDelete : null}
        monetaryColumns={monetaryColumns}
        badgesConfig={badgesConfig}
        dateColumns={dateColumns}
        columnsConfig={columnsConfig}
        scrollTriggerRef={EmpresaCorreosConfig.useInfiniteScroll ? lastRowRef : undefined}
        useInfiniteScroll={EmpresaCorreosConfig.useInfiniteScroll}
        convertFiltersToQueryParams={convertFiltersToQueryParams}
        fetchData={EmpresaCorreosConfig.useInfiniteScroll ? refreshData : fetchData}
        filters={filters}
        role={role}
        columnOrder={EmpresaCorreosConfig.columnOrder}
        actionHandlers={actionHandlers}
      />
      )}
    </div>
  );
};

const EmpresaCorreosPage = () => (
  <FilterProvider config={EmpresaCorreosConfig}>
    <ModalProvider modalsConfig={EmpresaCorreosConfig.modalsConfig}>
      <PageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default EmpresaCorreosPage;
