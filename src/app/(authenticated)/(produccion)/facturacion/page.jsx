
"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRole } from "@/context/RoleContext";
import { useFilters } from "@/hooks/useFilters";
import { FilterContext, FilterProvider } from "@/context/FilterContext";
import GenericFilter from "@/components/filters/GenericFilter";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import { ModalProvider, useModal } from "@/context/ModalContext";
import ModalManager from "@/components/modal/ModalManager";
import { showConfirmationAlert, showErrorAlert } from "@/utils/alerts";
import ActionButtons from "@/components/actions/ActionButtons";
import { useCrud } from "@/hooks/useCrud";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import FacturaConfig from "@/config/module/factura.config";
import apiService from "@/app/api/apiService";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useSession } from "next-auth/react";
import Restricted from "@/components/restricted/Restricted";

const ProduccionPageContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  // console.log(role);
  const { filters, handleFilterChange } = useContext(FilterContext);

  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;

  const canView = ["admin", "cliente", "previley", "trabajador"].includes(role);
  const canEdit = ["admin", "editor", "trabajador"].includes(role);
  const canDelete = ["admin", "editor", "trabajador"].includes(role);

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
  } = FacturaConfig;

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

  // Realtime: Factura CRUD → refrescar listado
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  // Infinite scroll (si está habilitado en config)
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

  useRealtimeEntity(socket, "factura", {
    onCreated: async () => {
      if (FacturaConfig.useInfiniteScroll) await refetch(); else fetchData();
    },
    onUpdated: async () => {
      if (FacturaConfig.useInfiniteScroll) await refetch(); else fetchData();
    },
    onDeleted: async () => {
      if (FacturaConfig.useInfiniteScroll) await refetch(); else fetchData();
    },
  });

  const handleCreate = useCallback(() => {
    openModal("createFactura", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  const handleEdit = useCallback(
    (item) => {
      console.log(item);
      openModal("createFactura", {
        initialData: item,
        handleSubmit,
        fetchData,
        updatePath,
        createPath,
      });
    },
    [openModal, handleSubmit, fetchData, updatePath, createPath]
  );

  const handleMarkAsPaid = useCallback(
    async (factura) => {
      try {
        const confirm = await showConfirmationAlert(
          "Marcar como Pagada",
          "¿Estás seguro de que deseas marcar esta factura como pagada?"
        );
        if (!confirm) return;
  
        await apiService.patch(`/facturas/${factura.id}/pagada`); // 🔥 No enviamos `userId`
  
        fetchData(); // 🔄 Recargar datos después de actualizar
      } catch (error) {
        console.error("❌ Error al marcar como pagada:", error);
        showErrorAlert("Error", "No se pudo marcar la factura como pagada.");
      }
    },
    [fetchData]
  );
  
  const handleMarkAsCancelled = useCallback(
    async (factura) => {
      openModal("cancelFactura", {
        initialData: factura,
        onConfirm: async (motivo) => {
          try {
            await apiService.patch(`/facturas/${factura.id}/anulada`, { motivo }); // 🔥 Solo enviamos el motivo
  
            fetchData(); // 🔄 Recargar datos después de actualizar
          } catch (error) {
            console.error("❌ Error al anular factura:", error);
            showErrorAlert("Error", "No se pudo anular la factura.");
          }
        },
      });
    },
    [openModal, fetchData]
  );

  // const handleRevertirPago = useCallback(
  //   async (rowData) => {
  //     try {
  //       const { id } = rowData;
  //       await apiService.patch(`/facturas/${id}/revertir-pago`);
  //       fetchData();
  //     } catch (error) {
  //       console.error("Error al revertir pago de factura", error);
  //     }
  //   },
  //   [fetchData]
  // );
  

  const handleRevertirPago = useCallback(
    async (factura) => {
      try {
        const confirm = await showConfirmationAlert(
          "Revertir Pago",
          "¿Estás seguro de que deseas revertir el pago de esta factura? Esta acción también cambiará el estado de la prefactura y sus producciones asociadas."
        );
        if (!confirm) return;
  
        await apiService.patch(`/facturas/${factura.id}/revertir-pago`); // 🔥 No enviamos `userId`
  
        fetchData(); // 🔄 Recargar datos después de actualizar
      } catch (error) {
        console.error("❌ Error al revertir el pago de la factura:", error);
        showErrorAlert("Error", "No se pudo revertir el pago de la factura.");
      }
    },
    [fetchData]
  );
  

  const handleDeleteFactura = useCallback(
    async (factura) => {
      try {
        const confirm = await showConfirmationAlert(
          "Eliminar Factura",
          "¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer."
        );
        if (!confirm) return;
  
        await apiService.delete(`/facturas/${factura.id}`);
  
        fetchData(); // 🔄 Recargar datos después de eliminar
      } catch (error) {
        console.error("❌ Error al eliminar factura:", error);
        showErrorAlert("Error", "No se pudo eliminar la factura.");
      }
    },
    [fetchData]
  );
  
  // const handleDownloadFactura = useCallback(async (factura) => {
  //   try {
  //     if (!factura.factura) {
  //       showErrorAlert("Error", "No hay archivo disponible para descargar.");
  //       return;
  //     }
  
  //     window.open(factura.factura, "_blank");
  //   } catch (error) {
  //     console.error("❌ Error al descargar la factura:", error);
  //     showErrorAlert("Error", "No se pudo descargar la factura.");
  //   }
  // }, []);
 
  
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



  const actionHandlers = {
    create: handleCreate,
    bulkUpload: handleBulkUploadModal,
    exportPDF: handleExportPDF,
    exportExcel: handleExportExcel,
    markAsPaid: handleMarkAsPaid,
    markAsCancelled: handleMarkAsCancelled,
    deleteFactura: handleDeleteFactura,
    revertirPago: handleRevertirPago
    // downloadFactura: handleDownloadFactura,
   
  };

  const queryParams = { limit: 10, offset: 0 };

  const {
    uniqueValues,
    loading: loadingFilters,
    error: errorFilters,
  } = useFilters(filtersPath, queryParams, filterConfig);

  // Función para convertir los filtros en parámetros de consulta
  const convertFiltersToQueryParams = useCallback((filters) => {
    const params = {};
    if (Array.isArray(FacturaConfig.filters)) {
      FacturaConfig.filters.forEach(({ key, type, field }) => {
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
  }, []);

  // Función para convertir el estado de ordenamiento en parámetros de consulta
  const convertSortingToQueryParams = useCallback((sorting) => {
    if (sorting.length === 0) return {};
    const sortField = sorting[0].id;
    const sortOrder = sorting[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, []);

  // Efecto para cargar los datos cuando cambian los filtros o el ordenamiento
  useEffect(() => {
    if (FacturaConfig.useInfiniteScroll) return; // lo maneja el hook
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

  if (!canView) {
    return <Restricted />;
  }

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative">
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
        data={FacturaConfig.useInfiniteScroll ? infData : data}
        total={FacturaConfig.useInfiniteScroll ? infTotal : total}
        loading={FacturaConfig.useInfiniteScroll ? infLoading : loading}
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
        // handleViewDetails={handleViewDetails}
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
        columnOrder={FacturaConfig.columnOrder}
        scrollTriggerRef={FacturaConfig.useInfiniteScroll ? lastRowRef : undefined}
        useInfiniteScroll={FacturaConfig.useInfiniteScroll}
      />
    </div>
  );
};

const FacturasPage = () => (
  <FilterProvider>
    <ModalProvider modalsConfig={FacturaConfig.modalsConfig}>
      <ProduccionPageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default FacturasPage;
