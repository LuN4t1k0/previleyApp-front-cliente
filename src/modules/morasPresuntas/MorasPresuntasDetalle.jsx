"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRole } from "@/context/RoleContext";
import { useFilters } from "@/hooks/useFilters";
import { FilterContext, FilterProvider } from "@/context/FilterContext";
import GenericFilter from "@/components/filters/GenericFilter";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import { ModalProvider, useModal } from "@/context/ModalContext";
import ModalManager from "@/components/modal/ModalManager";
import { showErrorAlert } from "@/utils/alerts";
import ActionButtons from "@/components/actions/ActionButtons";
import { useCrud } from "@/hooks/useCrud";
import MoraPresuntaDetalleConfig from "@/config/module/mora/moraPresuntaDetalle.config";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import { useSession } from "next-auth/react";
import apiService from "@/app/api/apiService";
import { convertFiltersToQueryParams } from "@/utils/filters";
import Titulo from "@/components/title/Title";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import RealtimeNotices from "@/components/notifications/RealtimeNotices";

const MoraPresuntaPageContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;
  const [sorting, setSorting] = useState([]);

  const canView = ["admin", "supervisor", "cliente", "previley", "trabajador"].includes(role);
  const canEdit = ["admin", "supervisor", "editor", "trabajador"].includes(role);
  const canDelete = ["admin", "supervisor", "editor", "trabajador"].includes(role);

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
  } = MoraPresuntaDetalleConfig;

  const {
 
    error,
    fetchDetails,
    handleDelete,
    handleSubmit,
    fetchData,
    handleBulkDelete,
    handleBulkUpload,
    fetchPage,
  total,
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

  // Realtime: Detalle Mora CRUD → refrescar listado
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const debouncedRefresh = useDebouncedCallback(() => refetch(), 600);
  useRealtimeEntity(socket, "detalleMora", {
    onCreated: () => debouncedRefresh(),
    onUpdated: () => debouncedRefresh(),
    onDeleted: () => debouncedRefresh(),
  });
  // Además, cuando la gestión cambia (p.ej., al rechazar producción), refrescamos
  useRealtimeEntity(socket, "gestionMora", {
    onUpdated: () => debouncedRefresh(),
  });

const {
  data,
  loading,
  lastRowRef,
  refetch,
} = useInfiniteScroll({
  fetchFn: ({ offset, limit }) =>
    fetchPage({
      offset,
      limit,
      extraParams: convertFiltersToQueryParams(filters, MoraPresuntaDetalleConfig.filters),
    }),
  limit: 20,
  deps: [JSON.stringify(filters)],
});

  const handleCreate = useCallback(() => {
    openModal("moraPresuntaForm", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  const handleEdit = useCallback(
    (item) => {
      openModal("moraPresuntaForm", {
        initialData: item,
        handleSubmit,
        fetchData,
        updatePath,
        createPath,
      });
    },
    [openModal, handleSubmit, fetchData, updatePath, createPath]
  );

  const handleValidateProduccion = useCallback(
    async (rowData) => {
      try {
        const { id } = rowData;
        await apiService.post(`/produccion/${id}/validate`);
        fetchData();
      } catch (error) {
        console.error("Error al validar producción", error);
      }
    },
    [fetchData]
  );

  const handleRejectProduccion = useCallback(
    (rowData) => {
      openModal("rejectProduccion", {
        initialData: rowData,
        fetchData,
      });
    },
    [openModal, fetchData]
  );

  const handleRevertProduccion = useCallback(
    async (rowData) => {
      try {
        const { id } = rowData;
        const userId = 123;
        await apiService.post(`/produccion/${id}/revert`, { userId });
        await fetchData();
      } catch (error) {
        console.error("Error al revertir producción", error);
      }
    },
    [fetchData]
  );

  const handleViewResumenTrabajador = () => {
    openModal("detalleTrabajador", {
      onConfirm: (trabajadorRut) => {
        openModal("resumenTrabajador", { trabajadorRut });
      },
    });
  };

  const handleExportExcel = () => {
    openModal("resumenEmpresa");
  };

  const handleExportPDF = () => {
    openModal("selectWorker", {
      onConfirm: async (trabajadorRut) => {
        try {
          const response = await apiService.get(
            `/licencias-medicas/exportar-pdf/${trabajadorRut}`,
            { responseType: "blob" }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `resumen_${trabajadorRut}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error("Error al exportar PDF:", error);
          showErrorAlert("Error", "No se pudo exportar el PDF.");
        }
      },
    });
  };

  const handleBulkUploadModal = useCallback(() => {
    openModal("bulkUpload", {
      handleBulkUpload,
      fetchData,
    });
  }, [openModal, handleBulkUpload, fetchData]);

  const handleViewDetails = useCallback(
    async (item) => {
      try {
        const fetchedDetails = await fetchDetails(item.id);
        if (fetchedDetails) {
          openModal("detalleGestionModal", {
            gestionId: item.id,
            estadoGestion: item.estado, // ⬅️ Aquí pasas el estado
          });
        }
      } catch (error) {
        console.error("Error al obtener detalles de la gestión:", error);
      }
    },
    [fetchDetails, openModal]
  );

  const actionHandlers = {
    create: handleCreate,
    bulkUpload: handleBulkUploadModal,
    exportPDF: handleExportPDF,
    validateProduccion: handleValidateProduccion,
    rejectProduccion: handleRejectProduccion,
    revertProduccion: handleRevertProduccion,
    viewResumenTrabajador: handleViewResumenTrabajador,
    viewResumenEmpresa: handleExportExcel,

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
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative">
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

      <div className="flex flex-row items-center pt-4 space-x-1 flex-grow">
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
        handleViewDetails={handleViewDetails}
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
        columnOrder={MoraPresuntaDetalleConfig.columnOrder}
        useInfiniteScroll={MoraPresuntaDetalleConfig.useInfiniteScroll}
        // NUEVOS:

  scrollTriggerRef={lastRowRef}
      />
    </div>
  );
};

const MorasPresuntasDetalle = () => (
  <FilterProvider config={MoraPresuntaDetalleConfig}>
    <ModalProvider modalsConfig={MoraPresuntaDetalleConfig.modalsConfig}>
      <MoraPresuntaPageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default MorasPresuntasDetalle;
