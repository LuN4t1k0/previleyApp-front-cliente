"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRole } from "@/context/RoleContext";
import { FilterContext, FilterProvider } from "@/context/FilterContext";
import { ModalProvider, useModal } from "@/context/ModalContext";
import ModalManager from "@/components/modal/ModalManager";
import GenericFilter from "@/components/filters/GenericFilter";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import Titulo from "@/components/title/Title";
import { useFilters } from "@/hooks/useFilters";
import { useCrud } from "@/hooks/useCrud";
import { convertFiltersToQueryParams } from "@/utils/filters";
import DetalleVisitaConfig from "@/config/module/visitas/detalleVisita.config";
import { showErrorAlert } from "@/utils/alerts";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";

const VisitasDetalleContent = () => {
  const searchParams = useSearchParams();
  const gestionVisitaId = searchParams.get("gestionVisitaId");
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);

  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState([]);
  const limit = 50;

  const {
    resourcePath,
    deletePath,
    filtersPath,
    title,
    subtitle,
    excludeColumns,
    filters: filterConfig,
    updatePath,
    columnsConfig,
    monetaryColumns,
    badgesConfig,
    dateColumns,
    modalsConfig,
    columnOrder,
  } = DetalleVisitaConfig;

  const {
    data,
    total,
    loading,
    error,
    handleDelete,
    handleSubmit,
    fetchData,
  } = useCrud(
    resourcePath,
    deletePath,
    null,
    null,
    null,
    null,
    updatePath,
    null
  );

  const { uniqueValues } = useFilters(filtersPath, {}, filterConfig);

  const canEdit = ["admin", "supervisor", "trabajador"].includes(role);
  const canDelete = ["admin", "supervisor"].includes(role);

  const convertSorting = useCallback((sortingState) => {
    if (!sortingState.length) return {};
    const sortField = sortingState[0].id;
    const sortOrder = sortingState[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, []);

  const buildListParams = useCallback(() => {
    const base = {
      limit,
      offset: pageIndex * limit,
      ...convertFiltersToQueryParams(filters, filterConfig),
      ...convertSorting(sorting),
    };
    if (gestionVisitaId) {
      base.gestionVisitaId = gestionVisitaId;
    }
    return base;
  }, [filters, filterConfig, convertSorting, sorting, pageIndex, gestionVisitaId]);

  useEffect(() => {
    fetchData(buildListParams());
  }, [buildListParams, fetchData]);

  useEffect(() => {
    setPageIndex(0);
  }, [JSON.stringify(filters), gestionVisitaId]);

  const decoratedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      ...row,
      nombreTrabajador: [row.nombreTrabajador, row.apellidoTrabajador]
        .filter(Boolean)
        .join(" "),
      nombreVisitador: [row.nombreVisitador, row.apellidoVisitador]
        .filter(Boolean)
        .join(" "),
    }));
  }, [data]);

  const refreshData = useCallback(() => {
    fetchData(buildListParams());
  }, [fetchData, buildListParams]);

  useRealtimeEntity(socket, "detalleVisita", {
    onCreated: refreshData,
    onUpdated: refreshData,
    onDeleted: refreshData,
  });

  const handleEdit = useCallback(
    (item) => {
      openModal("visitaDetalleForm", {
        initialData: item,
        handleSubmit: async (formData, modalData) => {
          await handleSubmit(formData, modalData);
          refreshData();
        },
      });
    },
    [handleSubmit, openModal, refreshData]
  );

  const handleRemove = useCallback(
    async (item) => {
      try {
        await handleDelete(item);
        refreshData();
      } catch (error) {
        console.error("Error eliminando visita", error);
        showErrorAlert("Error", "No se pudo eliminar la visita seleccionada.");
      }
    },
    [handleDelete, refreshData]
  );

  const actionHandlers = {
    editar: handleEdit,
    eliminar: handleRemove,
  };

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 space-y-4">
      <Titulo
        title={title}
        subtitle={
          gestionVisitaId
            ? `${subtitle} (Gestión #${gestionVisitaId})`
            : subtitle
        }
      />

      <div className="flex flex-row items-center space-x-2">
        <GenericFilter
          filters={filters}
          uniqueValues={uniqueValues}
          handleFilterChange={handleFilterChange}
          filterConfig={filterConfig}
        />
      </div>

      <GenericTableWithDetail
        data={decoratedData}
        total={total}
        loading={loading}
        error={error}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        limit={limit}
        excludeColumns={excludeColumns}
        canEdit={canEdit}
        canDelete={false}
        handleEdit={canEdit ? handleEdit : null}
        handleDelete={null}
        handleCreate={null}
        handleViewDetails={null}
        handleBulkDelete={null}
        monetaryColumns={monetaryColumns}
        badgesConfig={badgesConfig}
        dateColumns={dateColumns}
        columnsConfig={columnsConfig}
        sorting={sorting}
        setSorting={setSorting}
        convertFiltersToQueryParams={() =>
          convertFiltersToQueryParams(filters, filterConfig)
        }
        fetchData={fetchData}
        filters={filters}
        actionHandlers={actionHandlers}
        role={role}
        columnOrder={columnOrder}
        scrollTriggerRef={null}
        useInfiniteScroll={false}
      />
    </div>
  );
};

const VisitasDetalle = () => (
  <FilterProvider config={DetalleVisitaConfig}>
    <ModalProvider modalsConfig={DetalleVisitaConfig.modalsConfig}>
      <VisitasDetalleContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default VisitasDetalle;
