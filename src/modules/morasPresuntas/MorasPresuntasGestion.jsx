"use client";

import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
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
import MoraPresuntaConfig from "@/config/module/mora/moraPresunta.config";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useSession } from "next-auth/react";
import apiService from "@/app/api/apiService";
import { convertFiltersToQueryParams } from "@/utils/filters";
import Titulo from "@/components/title/Title";


import useActionFeedback from "@/hooks/useActionFeedback";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import RealtimeNotices from "@/components/notifications/RealtimeNotices";

const MoraPresuntaPageContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;
  const [sorting, setSorting] = useState([]);

  const { runWithFeedback } = useActionFeedback();

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
    modalsConfig,
    bulkUploadParentIdField: parentIdField,
  } = MoraPresuntaConfig;

  const {
    // data,
    // total,
    // loading,
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

  // Realtime: Gestion Mora CRUD → refrescar listado
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);

  // Sorting → query params
  const convertSortingToQueryParams = useCallback((sorting) => {
    if (sorting.length === 0) return {};
    const sortField = sorting[0].id;
    const sortOrder = sorting[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, []);

  // Infinite scroll basado en fetchPage de useCrud
  const {
    data,
    total,
    loading,
    lastRowRef,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ offset, limit: pageLimit }) =>
      fetchPage({
        offset,
        limit: pageLimit,
        extraParams: {
          ...convertFiltersToQueryParams(filters, filterConfig),
          ...convertSortingToQueryParams(sorting),
        },
      }),
    limit: 20,
    deps: [JSON.stringify(filters), JSON.stringify(sorting)],
  });

  const debouncedRefresh = useDebouncedCallback(refetch, 600);
  useRealtimeEntity(socket, "gestionMora", {
    onCreated: () => debouncedRefresh(),
    onUpdated: () => debouncedRefresh(),
    onDeleted: () => debouncedRefresh(),
  });

  const [prioridadesGestiones, setPrioridadesGestiones] = useState([]);

  useEffect(() => {
    const fetchPrioridades = async () => {
      try {
        const params = {
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        const res = await apiService.get(
          "/mora-dashboard/operativo/priorizacion-gestiones",
          { params }
        );
        setPrioridadesGestiones(res.data.data || []);
      } catch (error) {
        console.error("❌ Error cargando prioridades de gestiones:", error);
        setPrioridadesGestiones([]);
      }
    };

    fetchPrioridades();
  }, [filters, filterConfig]);

  const prioridadMap = useMemo(() => {
    const map = new Map();
    prioridadesGestiones.forEach((item) => {
      map.set(item.gestionMoraId, item);
    });
    return map;
  }, [prioridadesGestiones]);

  const dataDecorada = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => {
      const prioridad = prioridadMap.get(row.id);
      if (!prioridad) {
        return {
          ...row,
          prioridadRanking: null,
          prioridadNivel: "sin prioridad",
          deudaPendiente: row.deudaPendiente || 0,
          casosJudiciales: row.casosJudiciales || 0,
          montoJudicial: row.montoJudicial || 0,
          casosNoJudiciales: row.casosNoJudiciales || 0,
          montoNoJudicial: row.montoNoJudicial || 0,
        };
      }

      return {
        ...row,
        prioridadRanking: prioridad.prioridadRanking,
        prioridadNivel: prioridad.nivelRiesgo,
        deudaPendiente: prioridad.deudaPendiente,
        casosJudiciales: prioridad.casosJudiciales,
        montoJudicial: prioridad.montoJudicial,
        casosNoJudiciales: prioridad.casosNoJudiciales,
        montoNoJudicial: prioridad.montoNoJudicial,
      };
    });
  }, [data, prioridadMap]);

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

  const handleCargarArchivo = useCallback(
    (rowData) => {
      openModal("bulkUpload", {
        gestionId: rowData.id,
        fetchData,
        endpoint: bulkUploadPath,
        parentIdField,
      });
    },
    [openModal, fetchData, bulkUploadPath, parentIdField]
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

  // Exporta el estado del arte de una gestión específica en Excel
  const handleExportarExcelGestion = async (rowData) => {
    if (!rowData?.id) return;
    try {
      const response = await apiService.get(`/gestion-mora/${rowData.id}/export`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const folio = rowData?.folio ? `${rowData.folio}` : `${rowData.id}`;
      link.setAttribute("download", `gestion_${folio}_estado_arte.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar Excel de la gestión:", error);
      showErrorAlert("Error", "No se pudo descargar el Excel de la gestión.");
    }
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




const handleCerrarGestion = useCallback(
  async (rowData) => {
    try {
      await runWithFeedback({
        action: () => apiService.patch(`/gestion-mora/${rowData.id}/cerrar`),
        loadingMessage: "Cerrando gestión...",
        errorMessage: "No se pudo cerrar la gestión",
      });

      await fetchData();
    } catch (error) {
      console.error("Error al cerrar la gestión:", error);
    }
  },
  [fetchData, runWithFeedback]
);

  const handleReabrirGestion = useCallback(
  async (rowData) => {
    try {
      await runWithFeedback({
        action: () => apiService.patch(`/gestion-mora/${rowData.id}/reabrir`),
        loadingMessage: "Reabriendo gestión...",
        errorMessage: "No se pudo reabrir la gestión",
      });

      await fetchData();
    } catch (error) {
      console.error("Error al reabrir la gestión:", error);
    }
  },
  [fetchData, runWithFeedback]
);

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
    exportPDF: handleExportPDF,
    viewResumenTrabajador: handleViewResumenTrabajador,
    viewResumenEmpresa: handleExportExcel,
    exportarExcelGestion: handleExportarExcelGestion,
    cargarArchivo: handleCargarArchivo,
    cerrarGestion: handleCerrarGestion,
    reabrirGestion: handleReabrirGestion,
    editar: handleEdit,
    eliminar: handleDelete,
  };

  const queryParams = { limit: 10, offset: 0 };
  const { uniqueValues, loading: loadingFilters } = useFilters(
    filtersPath,
    queryParams,
    filterConfig
  );

  // Ya no se usa fetchData directo para listado; lo maneja useInfiniteScroll
  useEffect(() => {
    // no-op: mantenemos el efecto para coherencia si se quiere añadir lógica futura
  }, [loadingFilters]);

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
        data={dataDecorada}
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
        columnOrder={MoraPresuntaConfig.columnOrder}
        scrollTriggerRef={lastRowRef}
        useInfiniteScroll={true}
      />
    </div>
  );
};

const MoraPresuntaPage = () => (
  <FilterProvider config={MoraPresuntaConfig}>
    <ModalProvider modalsConfig={MoraPresuntaConfig.modalsConfig}>
      <MoraPresuntaPageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default MoraPresuntaPage;
