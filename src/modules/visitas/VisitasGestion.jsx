
"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRole } from "@/context/RoleContext";
import { FilterContext, FilterProvider } from "@/context/FilterContext";
import { ModalProvider, useModal } from "@/context/ModalContext";
import ModalManager from "@/components/modal/ModalManager";
import GenericFilter from "@/components/filters/GenericFilter";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import ActionButtons from "@/components/actions/ActionButtons";
import Titulo from "@/components/title/Title";
import { useFilters } from "@/hooks/useFilters";
import { useCrud } from "@/hooks/useCrud";
import { convertFiltersToQueryParams } from "@/utils/filters";
import GestionVisitaConfig from "@/config/module/visitas/gestionVisita.config";
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from "@/utils/alerts";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import apiService from "@/app/api/apiService";
import Restricted from "@/components/restricted/Restricted";

const GestionVisitasContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { socket } = useSocket(session?.accessToken);
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);

  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState([]);
  const limit = 20;

  const {
    resourcePath,
    deletePath,
    filtersPath,
    title,
    subtitle,
    excludeColumns,
    filters: filterConfig,
    createPath,
    updatePath,
    columnsConfig,
    monetaryColumns,
    badgesConfig,
    dateColumns,
    actionsConfig,
    modalsConfig,
    columnOrder,
  } = GestionVisitaConfig;

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
    createPath,
    null,
    updatePath,
    null
  );

  const { uniqueValues } = useFilters(filtersPath, {}, filterConfig);

  const canView = ["admin", "supervisor", "trabajador", "cliente"].includes(role);
  const canEdit = ["admin", "supervisor", "trabajador"].includes(role);
  const canDelete = ["admin", "supervisor"].includes(role);

  const convertSorting = useCallback((sortingState) => {
    if (!sortingState.length) return {};
    const sortField = sortingState[0].id;
    const sortOrder = sortingState[0].desc ? "desc" : "asc";
    return { sortField, sortOrder };
  }, []);

  const buildListParams = useCallback(() => ({
    limit,
    offset: pageIndex * limit,
    ...convertFiltersToQueryParams(filters, filterConfig),
    ...convertSorting(sorting),
  }), [filters, filterConfig, convertSorting, sorting, pageIndex]);

  useEffect(() => {
    fetchData(buildListParams());
  }, [buildListParams, fetchData]);

  useEffect(() => {
    setPageIndex(0);
  }, [JSON.stringify(filters)]);

  const decoratedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      ...row,
      fechaGestion: row.fechaGestion ? row.fechaGestion : null,
      fechaCierre: row.fechaCierre ? row.fechaCierre : null,
      progresoLabel:
        row.totalPlanificadas > 0
          ? `${Math.round((row.totalRealizadas / row.totalPlanificadas) * 100)}%`
          : "0%",
    }));
  }, [data]);

  const refreshData = useCallback(() => {
    fetchData(buildListParams());
  }, [fetchData, buildListParams]);

  useRealtimeEntity(socket, "gestionVisita", {
    onCreated: refreshData,
    onUpdated: refreshData,
    onDeleted: refreshData,
  });

  useRealtimeEntity(socket, "detalleVisita", {
    onCreated: refreshData,
    onUpdated: refreshData,
    onDeleted: refreshData,
  });

  const handleCreate = useCallback(() => {
    openModal("visitaGestionForm", {
      handleSubmit: async (formData, modalData) => {
        await handleSubmit(formData, modalData);
        refreshData();
      },
    });
  }, [handleSubmit, openModal, refreshData]);

  const handleEdit = useCallback(
    (item) => {
      openModal("visitaGestionForm", {
        initialData: item,
        handleSubmit: async (formData, modalData) => {
          await handleSubmit(formData, modalData);
          refreshData();
        },
      });
    },
    [handleSubmit, openModal, refreshData]
  );

  const handleImport = useCallback(
    (item) => {
      openModal("visitaDetalleImport", {
        gestionId: item.id,
        onImported: refreshData,
      });
    },
    [openModal, refreshData]
  );

  const handleRemove = useCallback(
    async (item) => {
      const confirm = await showConfirmationAlert(
        "¿Eliminar gestión?",
        "Esta acción eliminará todas las visitas asociadas."
      );
      if (!confirm) return;
      try {
        await handleDelete(item);
        refreshData();
      } catch (error) {
        console.error("Error eliminando gestión de visitas", error);
        showErrorAlert("Error", "No se pudo eliminar la gestión seleccionada.");
      }
    },
    [handleDelete, refreshData]
  );

  const handleViewDetail = useCallback((item) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("gestionVisitaId", item.id);
    router.replace(`?${params.toString()}`);

    openModal("visitaGestionDetalle", {
      gestionId: item.id,
      gestion: item,
      onUpdated: refreshData,
    });
  }, [openModal, refreshData, router, searchParams]);

  const handleCerrarGestion = useCallback(
    async (item) => {
      try {
        await apiService.patch(`/gestion-visita/${item.id}/cerrar`);
        showSuccessAlert("Gestión cerrada", `La gestión ${item.folio || item.id} fue cerrada correctamente.`);
        refreshData();
      } catch (error) {
        console.error("Error cerrando gestión de visitas", error);
        showErrorAlert("Error", error?.response?.data?.message || "No se pudo cerrar la gestión.");
      }
    },
    [refreshData]
  );

  const handleReabrirGestion = useCallback(
    async (item) => {
      try {
        await apiService.patch(`/gestion-visita/${item.id}/reabrir`);
        showSuccessAlert("Gestión reabierta", `La gestión ${item.folio || item.id} fue reabierta correctamente.`);
        refreshData();
      } catch (error) {
        console.error("Error reabriendo gestión de visitas", error);
        showErrorAlert("Error", error?.response?.data?.message || "No se pudo reabrir la gestión.");
      }
    },
    [refreshData]
  );

  const actionHandlers = {
    create: handleCreate,
    editar: handleEdit,
    eliminar: handleRemove,
    importar: handleImport,
    verDetalle: handleViewDetail,
    cerrarGestion: handleCerrarGestion,
    reabrirGestion: handleReabrirGestion,
  };

  if (!canView) {
    return <Restricted />;
  }

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <Titulo title={title} subtitle={subtitle} />
        <div className="mt-2 sm:mt-0 flex flex-row space-x-2 justify-end">
          <ActionButtons actionsConfig={actionsConfig} actionHandlers={actionHandlers} />
        </div>
      </div>

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
        handleDelete={canDelete ? handleRemove : null}
        handleCreate={canEdit ? handleCreate : null}
        handleViewDetails={handleViewDetail}
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

const VisitasGestion = () => (
  <FilterProvider config={GestionVisitaConfig}>
    <ModalProvider modalsConfig={GestionVisitaConfig.modalsConfig}>
      <GestionVisitasContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default VisitasGestion;
