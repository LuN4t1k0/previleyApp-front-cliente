"use client";

import React, {
import Restricted from "@/components/restricted/Restricted";
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useRole } from "@/context/RoleContext";
import { useSession } from "next-auth/react";
import { useFilters } from "@/hooks/useFilters";
import { FilterContext, FilterProvider } from "@/context/FilterContext";
import GenericFilter from "@/components/filters/GenericFilter";
import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
import { ModalProvider, useModal } from "@/context/ModalContext";
import ModalManager from "@/components/modal/ModalManager";
import demoConfig from "@/config/demo/demo.config"; // Importamos demoConfig
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
} from "@/utils/alerts";
import ActionButtons from "@/components/actions/ActionButtons";
import { useCrud } from "@/hooks/useCrud";
import apiService from "../api/apiService";



const LicenciaMedicaPageContent = () => {
  const { openModal } = useModal();

  const { role } = useRole();
  const { data: session, status } = useSession();
  const { filters, handleFilterChange } = useContext(FilterContext);

  // Estado para la paginación
  const [pageIndex, setPageIndex] = useState(0);
  const limit = 10;

  const canView = ["admin", "editor", "previley"].includes(role);
  const canEdit = ["admin", "editor"].includes(role);
  const canDelete = ["admin", "editor"].includes(role);

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
    updatePath, // Asegúrate de pasarlo aquí
    bulkUploadPath
  } = demoConfig;

  // Usa useCrud con detailPath y buildDetailEndpoint
  const {
    data,
    total,
    loading,
    error,
    details,
    detailLoading,
    detailError,
    fetchDetails,
    handleDelete,
    handleSubmit,
    fetchData,
    handleBulkDelete,
    handleBulkUpload
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

  useEffect(() => {
    console.log(data); // Verifica que data contiene la columna `montoDiferencia` y sus valores correctos
  }, [data]);

  const handleCreate = useCallback(() => {
    console.log("handleSubmit en handleCreate:", handleSubmit);
    openModal("licenciaForm", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  const handleEdit = useCallback(
    (item) => {
      openModal("licenciaForm", {
        initialData: item,
        handleSubmit,
        fetchData,
        updatePath, // Agrega esta línea
        createPath, // Agrega esta línea también (aunque no siempre sea necesario en edición)
      });
    },
    [openModal, handleSubmit, fetchData, updatePath, createPath]
  );

  // NUEVO:
  const handleExportPDF = () => {
    openModal("selectWorker", {
      onConfirm: async (trabajadorRut) => {
        try {
          const response = await apiService.get(
            `/licencias-medicas/exportar-pdf/${trabajadorRut}`,
            {
              responseType: "blob",
            }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `resumen_${trabajadorRut}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error("Error al exportar a PDF:", error);
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
            {
              responseType: "blob",
            }
          );

          // Crear un enlace para descargar el archivo
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `resumen_${trabajadorRut}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error("Error al exportar a Excel:", error);
          showErrorAlert("Error", "No se pudo exportar el Excel.");
        }
      },
    });
  };


// NUEVO:
const handleBulkUploadModal = useCallback(() => {
  openModal("bulkUpload", {
    handleBulkUpload, // Pasar la función directamente desde useCrud
    fetchData, // Pasa fetchData si deseas actualizar los datos después de la carga
  });
}, [openModal, handleBulkUpload, fetchData]);

  const actionHandlers = {
    create: handleCreate,
    bulkUpload: handleBulkUploadModal, // Si tienes esta acción
    exportPDF: handleExportPDF,
    exportExcel: handleExportExcel,
  };

  const handleViewDetails = useCallback(
    async (item) => {
      try {
        const fetchedDetails = await fetchDetails(item.folio);
        console.log("Detalles obtenidos para la modal:", fetchedDetails);
        if (fetchedDetails) {
          openModal("licenciaDetails", { licenseData: fetchedDetails });
        }
      } catch (error) {
        console.error("Error fetching license details:", error);
      }
    },
    [fetchDetails, openModal]
  );

  const queryParams = {
    limit: 10,
    offset: 0,
    // Puedes agregar más parámetros aquí si es necesario
  };

  const {
    uniqueValues,
    loading: loadingFilters,
    error: errorFilters,
  } = useFilters(filtersPath, queryParams);

  useEffect(() => {
    if (errorFilters) {
      console.error("Error loading filters:", errorFilters);
    }
  }, [errorFilters]);

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      // console.log("Debounced filters:", filters);
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  const finalFilters = useMemo(
    () => ({
      ...debouncedFilters,
    }),
    [debouncedFilters]
  );

  useEffect(() => {
    // Cada vez que cambian los filtros, reiniciar el pageIndex a 0.
    setPageIndex(0);
  }, [finalFilters]);

  // Convertir filtros a parámetros de consulta
  const convertFiltersToQueryParams = useCallback(
    (filters) => {
      const params = {};

      demoConfig.filters.forEach((filterConfig) => {
        const { key, type, field } = filterConfig;
        const filterValue = filters[key]?.value;

        if (
          filterValue !== undefined &&
          filterValue !== null &&
          filterValue !== ""
        ) {
          if (type === "text") {
            params[field] = filterValue;
          } else if (type === "multiselect") {
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              params[field] = filterValue.join(",");
            }
          } else if (type === "dateRange" && filterValue) {
            const { from, to } = filterValue;
            const dateField = filterConfig.dateField || "fecha";
            const dateStartSuffix = filterConfig.dateStartSuffix || "Inicio";
            const dateEndSuffix = filterConfig.dateEndSuffix || "Fin";

            if (from) {
              params[`${dateField}${dateStartSuffix}`] = from
                .toISOString()
                .split("T")[0];
            }

            if (to) {
              params[`${dateField}${dateEndSuffix}`] = to
                .toISOString()
                .split("T")[0];
            }
          }
        }
      });

      return params;
    },
    [demoConfig.filters]
  );

  useEffect(() => {
    // console.log("useEffect triggered with pageIndex:", pageIndex, "finalFilters:", finalFilters);
    const params = {
      limit,
      offset: pageIndex * limit,
      ...convertFiltersToQueryParams(finalFilters),
    };
    fetchData(params);
  }, [limit, pageIndex, finalFilters, fetchData, convertFiltersToQueryParams]);

  if (!canView) {
    return <Restricted />;
  }

  if (loadingFilters) {
    return <div>Cargando filtros...</div>;
  }

  if (errorFilters) {
    return (
      <div className="text-red-500">Error cargando filtros: {errorFilters}</div>
    );
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
          actionsConfig={demoConfig.actionsConfig}
          actionHandlers={actionHandlers}
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
        details={details}
        detailLoading={detailLoading}
        detailError={detailError}
        handleViewDetails={handleViewDetails}
        handleBulkDelete={handleBulkDelete}
        resourcePath={resourcePath}
        deletePath={deletePath}
        detailPath={detailPath}
        buildDetailEndpoint={buildDetailEndpoint}
        excludeColumns={excludeColumns}
        title={title}
        subtitle={subtitle}
        canEdit={canEdit}
        canDelete={canDelete}
        filters={finalFilters}
        filterConfig={filterConfig}
        demoConfig={demoConfig}
        handleEdit={canEdit ? handleEdit : null} // Pasar handleEdit como prop
        handleCreate={canEdit ? handleCreate : null} // Pasar handleCreate como
        handleDelete={canDelete ? handleDelete : null} // Pasar handleDelete como prop
        fetchData={fetchData}
        convertFiltersToQueryParams={convertFiltersToQueryParams}
        monetaryColumns={demoConfig.monetaryColumns}
  badgesConfig={demoConfig.badgesConfig}
      />
    </div>
  );
};

// Envolver el contenido con ModalProvider
const LicenciaMedicaPage = () => (
  <FilterProvider>
    <ModalProvider modalsConfig={demoConfig.modalsConfig}>
      <LicenciaMedicaPageContent demoConfig={demoConfig} />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default LicenciaMedicaPage; // Exportamos el componente correcto
