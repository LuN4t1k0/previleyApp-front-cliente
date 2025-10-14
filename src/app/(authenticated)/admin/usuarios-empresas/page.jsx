// NUEVO:TRABAJANDO:
// UsuariosEmpresaPageContent.jsx

"use client";

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
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
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import UsuarioEmpresaConfig from "@/config/module/usuariosEmpresa.config";
import apiService from "@/app/api/apiService";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useSession } from "next-auth/react";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import RealtimeNotices from "@/components/notifications/RealtimeNotices";

const UsuariosEmpresaPageContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  // console.log(role);
  const { filters, handleFilterChange } = useContext(FilterContext);

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;

  const canView = ["admin", "cliente", "previley", "trabajador"].includes(role);
  const canEdit = ["admin", "editor","trabajador"].includes(role);
  const canDelete = ["admin", "editor","trabajador"].includes(role);

  const [sorting, setSorting] = useState([]);

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
    modalsConfig,
  } = UsuarioEmpresaConfig;

  const {
    data,
    total,
    loading,
    error,
    fetchDetails,
    handleDelete,
    handleSubmit,
    fetchData,
    handleBulkDelete,
    handleBulkUpload,
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
    openModal("produccionForm", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  const handleEdit = useCallback(
    (item) => {
      openModal("produccionForm", {
        initialData: item,
        handleSubmit,
        fetchData,
        updatePath,
        createPath,
      });
    },
    [openModal, handleSubmit, fetchData, updatePath, createPath]
  );

  // NUEVO:
   // 1) Handler: Validar producción
   const handleValidateProduccion = useCallback(async (rowData) => {
    try {
      const { id } = rowData; 
      await apiService.post(`/produccion/${id}/validate`); 
      fetchData();
    } catch (error) {
      console.error("Error al validar producción", error);
    }
  }, [fetchData]);


  const handleRejectProduccion = useCallback((rowData) => {
    openModal("rejectProduccion", {
      initialData: rowData, // Enviamos la fila seleccionada
      fetchData, // Para actualizar la lista después del rechazo
    });
  }, [openModal, fetchData]);

  // 3) Handler: Revertir producción
  const handleRevertProduccion = useCallback(async (rowData) => {
    try {
      const { id } = rowData;
      // supongamos que tu userId lo saques del contexto 
      const userId = 123; 
      await apiService.post(`/produccion/${id}/revert`, { userId });
      await fetchData();
    } catch (error) {
      console.error("Error al revertir producción", error);
    }
  }, [fetchData]);

  // 4) Armar un objeto con todos



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

  const handleExportExcel = () => {
    openModal("selectWorker", {
      onConfirm: async (trabajadorRut) => {
        try {
          const response = await apiService.get(
            `/licencias-medicas/exportar-excel/${trabajadorRut}`,
            { responseType: "blob" }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `resumen_${trabajadorRut}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error("Error al exportar Excel:", error);
          showErrorAlert("Error", "No se pudo exportar el Excel.");
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
        const fetchedDetails = await fetchDetails(item.folio);
        if (fetchedDetails) {
          openModal("licenciaDetails", { licenseData: fetchedDetails });
        }
      } catch (error) {
        console.error("Error al obtener detalles de la licencia:", error);
      }
    },
    [fetchDetails, openModal]
  );

  const actionHandlers = {
    create: handleCreate,
    bulkUpload: handleBulkUploadModal,
    exportPDF: handleExportPDF,
    exportExcel: handleExportExcel,
    validateProduccion: handleValidateProduccion,
    rejectProduccion: handleRejectProduccion,
    revertProduccion: handleRevertProduccion,
  };

  const queryParams = { limit: 10, offset: 0 };

  const {
    uniqueValues,
    loading: loadingFilters,
    error: errorFilters,
  } = useFilters(filtersPath, queryParams, filterConfig);

  // Función para convertir los filtros en parámetros de consulta
  const convertFiltersToQueryParams = useCallback(
    (filters) => {
      const params = {};
      if (Array.isArray(UsuarioEmpresaConfig.filters)) {
        UsuarioEmpresaConfig.filters.forEach(({ key, type, field }) => {
          const value = filters[key]?.value;
          if (value) {
            if (type === "text") params[field] = value;
            else if (type === "multiselect") params[field] = value.join(",");
            else if (type === "dateRange") {
              const { from, to } = value;
              if (from) params["inicio"] = from.toISOString().split("T")[0];
              if (to) params["termino"] = to.toISOString().split("T")[0];
            }
          }
        });
      }
      return params;
    },
    []
  );

  // Función para convertir el estado de ordenamiento en parámetros de consulta
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
          ...convertFiltersToQueryParams(filters),
          ...convertSortingToQueryParams(sorting),
        },
      }),
    limit: 20,
    deps: [JSON.stringify(filters), JSON.stringify(sorting)],
  });

  // Paginación clásica si no se usa infinite scroll
  useEffect(() => {
    if (UsuarioEmpresaConfig.useInfiniteScroll) return;
    if (!loadingFilters) {
      const params = {
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters),
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
    convertFiltersToQueryParams,
    convertSortingToQueryParams,
  ]);

  // Realtime: usuarioEmpresa (created/deleted) → refrescar listado
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const refreshData = useCallback(async () => {
    const params = {
      limit,
      offset: pageIndex * limit,
      ...convertFiltersToQueryParams(filters),
      ...convertSortingToQueryParams(sorting),
    };
    await fetchData(params);
  }, [limit, pageIndex, filters, sorting, convertFiltersToQueryParams, convertSortingToQueryParams, fetchData]);
  const debouncedRefresh = useDebouncedCallback(async () => {
    if (UsuarioEmpresaConfig.useInfiniteScroll) await refetch(); else await refreshData();
  }, 600);
  useRealtimeEntity(socket, "usuarioEmpresa", {
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
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative">
      <RealtimeNotices socket={socket} />
      <div className="flex flex-row items-center space-x-2 flex-grow">
        <GenericFilter
          filters={filters}
          uniqueValues={uniqueValues}
          handleFilterChange={handleFilterChange}
          filterConfig={filterConfig}
        />
        <ActionButtons
          actionsConfig={actionsConfig}
          actionHandlers={actionHandlers}
        />
      </div>

      <GenericTableWithDetail
        data={UsuarioEmpresaConfig.useInfiniteScroll ? infData : data}
        total={UsuarioEmpresaConfig.useInfiniteScroll ? infTotal : total}
        loading={UsuarioEmpresaConfig.useInfiniteScroll ? infLoading : loading}
        error={error}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        limit={limit}
        excludeColumns={excludeColumns}
        title={title}
        subtitle={subtitle}
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
        columnOrder={UsuarioEmpresaConfig.columnOrder}
        scrollTriggerRef={UsuarioEmpresaConfig.useInfiniteScroll ? lastRowRef : undefined}
        useInfiniteScroll={UsuarioEmpresaConfig.useInfiniteScroll}
      />
    </div>
  );
};

const UsuariosEmpresaPage = () => (
  <FilterProvider>
    <ModalProvider modalsConfig={UsuarioEmpresaConfig.modalsConfig}>
      <UsuariosEmpresaPageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default UsuariosEmpresaPage;
