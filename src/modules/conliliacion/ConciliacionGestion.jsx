

// NUEVO:

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

import configuracion from "@/config/module/conciliacion/conciliacion.config";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import apiService from "@/app/api/apiService";
import useActionFeedback from "@/hooks/useActionFeedback";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from "@/utils/alerts"; // Asegúrate de importar las alertas
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import Restricted from "@/components/restricted/Restricted";
import { RiFileSearchLine } from "@remixicon/react";

const LicenciasContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);
  const router = useRouter();

  const { data: session } = useSession();

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;
  const [sorting, setSorting] = useState([]);

  const { runWithFeedback } = useActionFeedback();

  const {
    resourcePath,
    deletePath,
    filtersPath,
    title,
    subtitle,
    excludeColumns,
    buildDetailEndpoint,
    filters: filterConfig,
    modalsConfig: modals,
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
    useInfiniteScroll: isInfiniteScrollEnabled,
    columnOrder,
    permissions
  } = configuracion; 

  const canView = permissions.view.includes(role);
  const canCreate = permissions.create.includes(role);
  const canEdit = permissions.edit.includes(role);
  const canDelete = permissions.delete.includes(role);

  const {
    error,
    handleSubmit,
    fetchData, // Lo mantenemos por si es usado en otro lugar
    handleBulkDelete,
    fetchPage,
    fetchDetails
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
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ offset, limit }) =>
      fetchPage({
        offset,
        limit,
        extraParams: convertFiltersToQueryParams(filters, filterConfig),
      }),
    limit: 20,
    deps: [JSON.stringify(filters)],
  });

  const queryParams = { limit: 10, offset: 0 };

  const {
    uniqueValues,
    loading: loadingFilters,
    refetchFilters,
  } = useFilters(filtersPath, queryParams, filterConfig);

  const refreshData = useCallback(async () => {
    if (isInfiniteScrollEnabled) {
      await refetch();
    } else {
      // Si no usas scroll infinito, necesitarías una función de fetchData aquí
      // que actualice los datos de la tabla.
    }
    await refetchFilters();
  }, [refetch, isInfiniteScrollEnabled, refetchFilters]);

  // Realtime: Gestion Licencia CRUD → refrescar listado (debounced via refreshData which refetches)
  const { socket } = useSocket(session?.accessToken);
  const debouncedRefresh = useDebouncedCallback(refreshData, 600);
  useRealtimeEntity(socket, "gestionLicencia", {
    onCreated: () => debouncedRefresh(),
    onUpdated: () => debouncedRefresh(),
    onDeleted: () => debouncedRefresh(),
  });

  // --- IMPLEMENTACIÓN DE LA OPCIÓN A ---
  // 1. Creamos la función que orquesta la eliminación y el refresco.
  const handleDeleteAndRefresh = useCallback(async (item) => {
    const confirm = await showConfirmationAlert(
      "¿Está seguro de que desea eliminar este registro?",
      "¡No podrás revertir esto!"
    );

    if (confirm) {
      try {
        const id = typeof item === "object" ? item.id : item;
        if (!id) {
          throw new Error("ID inválido para eliminar el registro.");
        }
        await apiService.delete(`${deletePath}/${id}`);
        showSuccessAlert("¡Eliminado!", "Tu registro ha sido eliminado.");
        
        // Llamamos a la función de refresco correcta.
        await refreshData();

      } catch (err) {
        console.error("Error deleting record:", err);
        showErrorAlert("Error", "No se pudo eliminar el registro.");
      }
    }
  }, [deletePath, refreshData]);

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





// const handleViewDetails = useCallback((item) => {
//     openModal("detalleGestion", {
//         gestionData: item,
//         refreshData: refreshData, // Le pasamos la función para que los modales internos puedan refrescar la tabla principal
//     });
//   }, [openModal, refreshData]);

const handleViewDetails = useCallback((item) => {
        // Ya no abre un modal, ahora navega a la página del expediente
        // La URL se construye a partir de tu estructura de carpetas
        router.push(`/licencia-medica/conciliacion/gestiones/${item.id}`);
    }, [router]);

  const actionHandlers = {
    create: handleCreate,
    editar: handleEdit,
    eliminar: handleDeleteAndRefresh, // Usamos la nueva función
    verDetalle: handleViewDetails, // Conectamos la acción
  };


 if (!canView) {
    return <Restricted />;
  }

  return (
    <div className="min-h-dvh w-full bg-slate-50 px-3 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-5">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
            Licencias médicas · Gestiones
          </div>
          <Titulo title={title} subtitle={subtitle} />
        </div>
        <div className="mt-2 sm:mt-0 flex flex-row space-x-2 justify-end">
          <ActionButtons
            actionsConfig={actionsConfig}
            actionHandlers={actionHandlers}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
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
        handleCreate={canCreate ? handleCreate : null}
        // 2. Pasamos la nueva función a la tabla.
        handleDelete={canDelete ? handleDeleteAndRefresh : null}
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
        columnOrder={columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={lastRowRef}
        useInfiniteScroll={isInfiniteScrollEnabled} 
        handleViewDetails={handleViewDetails}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <RiFileSearchLine className="h-5 w-5" />
            </span>
            <p className="font-semibold text-slate-700">No hay gestiones de licencias para mostrar</p>
            <p className="max-w-md text-sm text-slate-500">
              Prueba cambiando los filtros o revisa nuevamente cuando existan nuevas conciliaciones.
            </p>
          </div>
        }
      />
    </div>
    </div>
  );
};

const { modalsConfig } = configuracion;
const Licencias = () => (
  <FilterProvider config={configuracion}>
    <ModalProvider modalsConfig={modalsConfig}>
      <LicenciasContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default Licencias;
