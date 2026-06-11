
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


// import Prefactura from "@/config/module/Prefactura.config";
import Prefactura from "@/config/module/prefactura.config";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import apiService from "@/app/api/apiService";
import { showConfirm, showSuccessAlert, showErrorAlert } from "@/utils/alerts";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useSession } from "next-auth/react";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import RealtimeNotices from "@/components/notifications/RealtimeNotices";
import useBulkProgress from "@/hooks/useBulkProgress";
import useActionFeedback from "@/hooks/useActionFeedback";

const PrefacturaContent = () => {
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
  } = Prefactura;

  const {
    // data,
    // loading,
    // total,
    error,
    fetchDetails,
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
      extraParams: convertFiltersToQueryParams(filters, Prefactura.filters),
    }),
  limit: 20,
  deps: [JSON.stringify(filters)],
});

// NUEVO: necesario para el infinite scroll y para que funcione el refetch
// const refreshData = Prefactura.useInfiniteScroll ? refetch : fetchData;

  const queryParams = { limit: 10, offset: 0 };


  const { uniqueValues, loading: loadingFilters, refetchFilters } = useFilters(
  filtersPath,
  queryParams,
  filterConfig
);


const refreshData = useCallback(async () => {
  if (Prefactura.useInfiniteScroll) {
    await refetch();
  } else {
    await fetchData();
  }
  await refetchFilters(); // 👈 recarga las opciones del filtro
}, [refetch, fetchData, refetchFilters]);

  // Realtime: Prefacturas (CRUD) → refrescar listado automáticamente
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const debouncedRefresh = useDebouncedCallback(refreshData, 600);
  const { jobs } = useBulkProgress(socket);
  const { runWithFeedback } = useActionFeedback();
  useRealtimeEntity(socket, "prefactura", {
    onCreated: () => debouncedRefresh(),
    onUpdated: () => debouncedRefresh(),
    onDeleted: () => debouncedRefresh(),
  });

  const handleCreateFactura = useCallback((rowData) => {
    openModal("createFactura", {
      initialData: rowData, // Enviamos la fila seleccionada (Prefactura)
      fetchData, // Para actualizar la lista después de la creación
    });
  }, [openModal, fetchData]);

  const handleViewDetails = useCallback(
    async (item) => {
      console.log(item);
      try {
        const fetchedDetails = await fetchDetails(item.id);
        if (fetchedDetails) {
          openModal("prefacturaDetalle", { prefacturaData: fetchedDetails });
        }
      } catch (error) {
        console.error("Error al obtener detalles de la licencia:", error);
      }
    },
    [fetchDetails, openModal]
  );

  const handleCreateForEmpresa = useCallback(() => {
    openModal("createForEmpresa", {
      fetchData,
    });
  }, [openModal, fetchData]);
  
  const handleCreateForAllEmpresas = useCallback(() => {
    openModal("createForAllEmpresas", {
      fetchData,
    });
  }, [openModal, fetchData]);

  const handleSendEmail = useCallback(async (rowData) => {
    // Pre-confirmación si ya fue enviada
    try {
      if (rowData?.envioEstado === 'sent' && rowData?.envioFecha) {
        const dt = new Date(rowData.envioFecha).toLocaleString();
        const proceed = await showConfirm({
          title: 'Esta prefactura ya fue enviada',
          text: `Se registró un envío el ${dt}. ¿Deseas continuar?`,
          confirmText: 'Continuar',
          cancelText: 'Cancelar',
        });
        if (!proceed) return;
      }
      openModal("sendEmail", { initialData: rowData });
    } catch (e) {
      showErrorAlert('Error', e?.message || 'No se pudo abrir el envío');
    }
  }, [openModal]);

  const handleViewEmailHistory = useCallback((rowData) => {
    openModal("emailHistory", {
      initialData: rowData,
    });
  }, [openModal]);

  const handleSendFollowUp = useCallback(async (rowData) => {
    try {
      const proceed = await showConfirm({
        title: "Enviar recordatorio de OC / HES",
        text: `Se volverá a solicitar la orden de compra y HES para la prefactura ${rowData.folio || rowData.id}.`,
        confirmText: "Enviar",
        cancelText: "Cancelar",
      });
      if (!proceed) return;

      await apiService.post(`/prefacturas/followup/${rowData.id}`, { force: true });
      showSuccessAlert("Recordatorio enviado", "Se solicitó nuevamente la documentación al cliente.");
      await refreshData();
    } catch (error) {
      console.error("Error enviando seguimiento de prefactura", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo enviar el recordatorio.";
      showErrorAlert("Error", message);
    }
  }, [refreshData]);

  const handleSendFacturaReminder = useCallback(async (rowData) => {
    try {
      const details = await fetchDetails(rowData.id);
      const factura = details?.factura;
      if (!factura) {
        showErrorAlert("Sin factura", "Esta prefactura aún no tiene una factura asociada.");
        return;
      }
      if (factura.estado === "pagada") {
        showErrorAlert("Factura pagada", "La factura asociada ya está pagada, no se envió el recordatorio.");
        return;
      }

      const proceed = await showConfirm({
        title: "Enviar recordatorio de pago",
        text: `Se notificará nuevamente el pago de la factura ${factura.numeroFactura}.`,
        confirmText: "Enviar",
        cancelText: "Cancelar",
      });
      if (!proceed) return;

      await apiService.post(`/facturas/${factura.id}/enviar-recordatorio`, { force: true });
      showSuccessAlert("Aviso enviado", "Se envió el recordatorio de pago al cliente.");
      await refreshData();
    } catch (error) {
      console.error("Error enviando recordatorio de factura", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo enviar el aviso de vencimiento.";
      showErrorAlert("Error", message);
    }
  }, [fetchDetails, refreshData]);

  const handleSendBulk = useCallback(async () => {
    try {
      const ids = (data || []).map((d) => d.id);
      if (!ids.length) return;
      await apiService.post(`/prefacturas/enviar-bulk`, { ids, strategy: 'onlyNotSentThisVersion' });
      showSuccessAlert('Envío masivo encolado', `${ids.length} prefacturas preparadas para envío.`);
    } catch (error) {
      console.error("Error al encolar envío masivo", error);
      showErrorAlert('Error', 'No se pudo encolar el envío masivo.');
    }
  }, [data]);

  const handleSendSelected = useCallback(async (ids) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) return;
      await apiService.post(`/prefacturas/enviar-bulk`, { ids, strategy: 'onlyNotSentThisVersion' });
      showSuccessAlert('Envío encolado', `${ids.length} prefacturas seleccionadas preparadas para envío.`);
    } catch (error) {
      console.error("Error al encolar envío seleccionado", error);
      showErrorAlert('Error', 'No se pudo encolar el envío de seleccionadas.');
    }
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      await runWithFeedback({
        action: async () => {
          const params = convertFiltersToQueryParams(filters, filterConfig);
          const response = await apiService.get(`/prefacturas/prefacturas/exportar`, {
            params,
            responseType: "blob",
          });

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          const disposition = response.headers["content-disposition"];
          let filename = "prefacturas.xlsx";
          if (disposition) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match?.[1]) {
              filename = match[1].replace(/['"]/g, "");
            }
          }
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        },
        loadingMessage: "Generando Excel...",
        successMessage: "Descarga iniciada",
        errorMessage: "No se pudo exportar el Excel",
      });
    } catch (error) {
      console.error("Error exportando prefacturas", error);
    }
  }, [filters, filterConfig, runWithFeedback]);

  const handleExportDetalleExcel = useCallback(async () => {
    try {
      await runWithFeedback({
        action: async () => {
          const params = convertFiltersToQueryParams(filters, filterConfig);
          const response = await apiService.get(`/prefacturas/prefacturas/exportar-detalle`, {
            params,
            responseType: "blob",
          });

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          const disposition = response.headers["content-disposition"];
          let filename = "prefacturas_detalle.xlsx";
          if (disposition) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match?.[1]) {
              filename = match[1].replace(/['"]/g, "");
            }
          }
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        },
        loadingMessage: "Generando Excel...",
        successMessage: "Descarga iniciada",
        errorMessage: "No se pudo exportar el Excel de detalle",
      });
    } catch (error) {
      console.error("Error exportando detalle de prefacturas", error);
    }
  }, [filters, filterConfig, runWithFeedback]);

  const handleRejectPrefactura = useCallback((rowData) => {
    console.log(rowData);
      openModal("rejectPrefactura", {
        initialData: rowData, // Enviamos la fila seleccionada
        fetchData, // Para actualizar la lista después del rechazo
      });
    }, [openModal, fetchData]);

const handleRevertPrefactura = useCallback((rowData) => {
  openModal("revertPrefactura", {
    initialData: rowData, // Pasamos la prefactura seleccionada
    fetchData, // Para actualizar la lista después de la reversión
  });
}, [openModal, fetchData]);








  const actionHandlers = {
    createFactura: handleCreateFactura,
    createForEmpresa: handleCreateForEmpresa,
    createForAllEmpresas: handleCreateForAllEmpresas,
    rejectPrefactura: handleRejectPrefactura,
    revertPrefactura: handleRevertPrefactura,
    sendEmail: handleSendEmail,
    viewEmailHistory: handleViewEmailHistory,
    sendFollowUp: handleSendFollowUp,
    sendFacturaReminder: handleSendFacturaReminder,
    sendBulk: handleSendBulk,
    sendSelected: handleSendSelected,
    exportExcel: handleExportExcel,
    exportDetalleExcel: handleExportDetalleExcel,
    
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
      <RealtimeNotices socket={socket} />
      {/* Bulk progress banner */}
      {Object.values(jobs).length > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9998] w-[min(92vw,36rem)] bg-white border rounded shadow p-3">
          {Object.values(jobs).map((j) => (
            <div key={j.jobId} className="mb-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Envío masivo</span>
                <span>{j.percent ?? 0}% ({j.completed ?? 0}/{j.total ?? 0})</span>
              </div>
              <div className="h-2 bg-gray-200 rounded mt-1">
                <div className="h-2 bg-blue-600 rounded" style={{ width: `${j.percent ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
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
        columnOrder={Prefactura.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={lastRowRef}
        useInfiniteScroll={Prefactura.useInfiniteScroll} // Habilitar infinite scroll
      />
    </div>
  );
};

const Prefacturas = () => (
  <FilterProvider config={Prefactura}>
    <ModalProvider modalsConfig={Prefactura.modalsConfig}>
      <PrefacturaContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default Prefacturas;
