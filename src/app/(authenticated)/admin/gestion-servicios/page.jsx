// "use client";
// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useMemo,
// } from "react";
// import { useRole } from "@/context/RoleContext";

// import { useFilters } from "@/hooks/useFilters";
// import { FilterContext, FilterProvider } from "@/context/FilterContext";
// import GenericFilter from "@/components/filters/GenericFilter";
// import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
// import { ModalProvider, useModal } from "@/context/ModalContext";
// import ModalManager from "@/components/modal/ModalManager";
// import demoConfig from "@/config/demo/demo.config"; // Importamos demoConfig
// import { showErrorAlert } from "@/utils/alerts";
// import ActionButtons from "@/components/actions/ActionButtons";
// import { useCrud } from "@/hooks/useCrud";

// import apiService from "@/app/api/apiService";
// import UsuariosConfig from "@/config/module/usuarios.config";
// import GestionServiciosConfig from "@/config/module/servicios.config";


// const GestionServiciosPageContent = () => {
//   const { openModal } = useModal();
//   const { role } = useRole();
//   const { filters, handleFilterChange } = useContext(FilterContext);

//   // Estado para la paginación
//   const [pageIndex, setPageIndex] = useState(0);
//   const limit = 10;

//   const canView = ["admin", "editor", "previley"].includes(role);
//   const canEdit = ["admin", "editor"].includes(role);
//   const canDelete = ["admin", "editor"].includes(role);

//   // CONFIGURACION MODULO:
//   const {
//     resourcePath,
//     deletePath,
//     filtersPath,
//     title,
//     subtitle,
//     excludeColumns,
//     buildDetailEndpoint,
//     filters: filterConfig,
//     detailPath,
//     createPath,
//     bulkDeletePath,
//     updatePath, // Asegúrate de pasarlo aquí
//     bulkUploadPath,
//     dateColumns,
//   } = GestionServiciosConfig;

//   // USECRUD:
//   // Usa useCrud con detailPath y buildDetailEndpoint
//   const {
//     data,
//     total,
//     loading,
//     error,
//     details,
//     detailLoading,
//     detailError,
//     fetchDetails,
//     handleDelete,
//     handleSubmit,
//     fetchData,
//     handleBulkDelete,
//     handleBulkUpload,
//   } = useCrud(
//     resourcePath,
//     deletePath,
//     detailPath,
//     buildDetailEndpoint,
//     createPath,
//     bulkDeletePath,
//     updatePath,
//     bulkUploadPath
//   );

//   // VERIFICAR QUE LA DATA ESTE LLEGANDO :
//   useEffect(() => {
//     console.log(data); // Verifica que data contiene la columna `montoDiferencia` y sus valores correctos
//   }, [data]);

//   // CREAR
//   const handleCreate = useCallback(() => {
//     console.log("handleSubmit en handleCreate:", handleSubmit);
//     openModal("servicioForm", {
//       handleSubmit,
//       fetchData,
//       updatePath,
//       createPath,
//     });
//   }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

//   // EDITAR
//   const handleEdit = useCallback(
//     (item) => {
//       openModal("servicioForm", {
//         initialData: item,
//         handleSubmit,
//         fetchData,
//         updatePath,
//         createPath,
//       });
//     },
//     [openModal, handleSubmit, fetchData, updatePath, createPath]
//   );

//   // EXPORTAR PDF
//   const handleExportPDF = () => {
//     openModal("selectWorker", {
//       onConfirm: async (trabajadorRut) => {
//         try {
//           const response = await apiService.get(
//             `/licencias-medicas/exportar-pdf/${trabajadorRut}`,
//             {
//               responseType: "blob",
//             }
//           );
//           const url = window.URL.createObjectURL(new Blob([response.data]));
//           const link = document.createElement("a");
//           link.href = url;
//           link.setAttribute("download", `resumen_${trabajadorRut}.pdf`);
//           document.body.appendChild(link);
//           link.click();
//           link.parentNode.removeChild(link);
//         } catch (error) {
//           console.error("Error al exportar a PDF:", error);
//           showErrorAlert("Error", "No se pudo exportar el PDF.");
//         }
//       },
//     });
//   };

//   // EXPORTAR EXCEL
//   const handleExportExcel = () => {
//     openModal("selectWorker", {
//       onConfirm: async (trabajadorRut) => {
//         try {
//           const response = await apiService.get(
//             `/licencias-medicas/exportar-excel/${trabajadorRut}`,
//             {
//               responseType: "blob",
//             }
//           );

//           // Crear un enlace para descargar el archivo
//           const url = window.URL.createObjectURL(new Blob([response.data]));
//           const link = document.createElement("a");
//           link.href = url;
//           link.setAttribute("download", `resumen_${trabajadorRut}.xlsx`);
//           document.body.appendChild(link);
//           link.click();
//           link.parentNode.removeChild(link);
//         } catch (error) {
//           console.error("Error al exportar a Excel:", error);
//           showErrorAlert("Error", "No se pudo exportar el Excel.");
//         }
//       },
//     });
//   };

//   // CARGA MASIVA
//   const handleBulkUploadModal = useCallback(() => {
//     openModal("bulkUpload", {
//       handleBulkUpload, // Pasar la función directamente desde useCrud
//       fetchData, // Pasa fetchData si deseas actualizar los datos después de la carga
//     });
//   }, [openModal, handleBulkUpload, fetchData]);

//   // GENERAR DETALLE:
//   const handleViewDetails = useCallback(
//     async (item) => {
//       try {
//         const fetchedDetails = await fetchDetails(item.empresaRut);
//         console.log("Detalles obtenidos para la modal:", fetchedDetails);
//         if (fetchedDetails) {
//           openModal("empresaDetails", { empresaData: fetchedDetails });
//         }
//       } catch (error) {
//         console.error("Error fetching license details:", error);
//       }
//     },
//     [fetchDetails, openModal]
//   );

//   // PASAMOS LAS ACCIONES :
//   const actionHandlers = {
//     create: handleCreate,

//     bulkUpload: handleBulkUploadModal,
//     exportPDF: handleExportPDF,
//     exportExcel: handleExportExcel,
//   };

//   // QUERY PARAMS
//   const queryParams = {
//     limit: 10,
//     offset: 0,
//   };

//   // DESESCRUTUCRA LOS VALORES PARA LOS FILTROS
//   const {
//     uniqueValues,
//     loading: loadingFilters,
//     error: errorFilters,
//   } = useFilters(filtersPath, queryParams, filterConfig);

//   // REVISA SI HAY ERRORES EN LOS FILTROS
//   useEffect(() => {
//     if (errorFilters) {
//       console.error("Error loading filters:", errorFilters);
//     }
//   }, [errorFilters]);

//   const [debouncedFilters, setDebouncedFilters] = useState(filters);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       // console.log("Debounced filters:", filters);
//       setDebouncedFilters(filters);
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [filters]);

//   const finalFilters = useMemo(
//     () => ({
//       ...debouncedFilters,
//     }),
//     [debouncedFilters]
//   );

//   useEffect(() => {
//     // Cada vez que cambian los filtros, reiniciar el pageIndex a 0.
//     setPageIndex(0);
//   }, [finalFilters]);

//   const convertFiltersToQueryParams = useCallback(
//     (filters) => {
//       const params = {};

//       UsuariosConfig.filters.forEach((filterConfig) => {
//         const { key, type } = filterConfig;
//         const filterValue = filters[key]?.value;

//         if (
//           filterValue !== undefined &&
//           filterValue !== null &&
//           filterValue !== ""
//         ) {
//           if (type === "text") {
//             params[filterConfig.field] = filterValue;
//           } else if (type === "multiselect") {
//             if (Array.isArray(filterValue) && filterValue.length > 0) {
//               params[filterConfig.field] = filterValue.join(",");
//             }
//           } else if (type === "dateRange" && filterValue) {
//             const { from, to } = filterValue;

//             if (from) {
//               params["inicio"] = from.toISOString().split("T")[0]; // Usar "inicio" como clave
//             }

//             if (to) {
//               params["termino"] = to.toISOString().split("T")[0]; // Usar "termino" como clave
//             }
//           }
//         }
//       });

//       return params;
//     },
//     [UsuariosConfig.filters]
//   );

//   useEffect(() => {
//     // console.log("useEffect triggered with pageIndex:", pageIndex, "finalFilters:", finalFilters);
//     const params = {
//       limit,
//       offset: pageIndex * limit,
//       ...convertFiltersToQueryParams(finalFilters),
//     };
//     fetchData(params);
//   }, [limit, pageIndex, finalFilters, fetchData, convertFiltersToQueryParams]);

//   if (!canView) {
//     return (
//       <div className="text-center mt-10">
//         <h2 className="text-xl font-bold text-gray-700">
//           No tienes permiso para ver esta página.
//         </h2>
//         <p className="text-gray-500 mt-2">
//           Contacta al administrador si crees que esto es un error.
//         </p>
//         <button
//           className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           onClick={() => navigate("/")}
//         >
//           Volver al inicio
//         </button>
//       </div>
//     );
//   }

//   if (loadingFilters) {
//     return <div>Cargando filtros...</div>;
//   }

//   if (errorFilters) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//         <strong className="font-bold">Error:</strong>
//         <span className="block sm:inline"> {errorFilters}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative">
//       <div className="flex flex-row items-center space-x-2 flex-grow">
//         <GenericFilter
//           filters={filters}
//           uniqueValues={uniqueValues}
//           handleFilterChange={handleFilterChange}
//           filterConfig={filterConfig}
//         />
//         <ActionButtons
//           actionsConfig={demoConfig.actionsConfig}
//           actionHandlers={actionHandlers}
//         />
//       </div>

//       <GenericTableWithDetail
//         data={data}
//         total={total}
//         loading={loading}
//         error={error}
//         pageIndex={pageIndex}
//         setPageIndex={setPageIndex}
//         limit={limit}
//         excludeColumns={excludeColumns}
//         title={title}
//         subtitle={subtitle}
//         canEdit={canEdit}
//         canDelete={canDelete}
//         filters={finalFilters}
//         handleEdit={canEdit ? handleEdit : null} // Pasar handleEdit como prop
//         handleCreate={canEdit ? handleCreate : null} // Pasar handleCreate como
//         handleDelete={canDelete ? handleDelete : null} // Pasar handleDelete como prop
//         handleViewDetails={handleViewDetails}
//         handleBulkDelete={handleBulkDelete}
//         convertFiltersToQueryParams={convertFiltersToQueryParams}
//         fetchData={fetchData}
//         monetaryColumns={GestionServiciosConfig.monetaryColumns}
//         badgesConfig={GestionServiciosConfig.badgesConfig}
//         dateColumns={GestionServiciosConfig.dateColumns} // Pasar las columnas de fecha
//       />
//     </div>
//   );
// };
// // Envolver el contenido con ModalProvider
// const GestionServiciosPage = () => (
//   <FilterProvider>
//     <ModalProvider modalsConfig={GestionServiciosConfig.modalsConfig}>
//       <GestionServiciosPageContent GestionServiciosConfig={GestionServiciosConfig} />
//       <ModalManager />
//     </ModalProvider>
//   </FilterProvider>
// );

// export default GestionServiciosPage;


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
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useSession } from "next-auth/react";

import { convertFiltersToQueryParams } from "@/utils/filters";
import Titulo from "@/components/title/Title";
// import Servicios from "@/config/module/empresasServicios.config";

import Servicios from "@/config/module/servicios.config";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

const ServiciosContent = () => {
  const { openModal } = useModal();
  const { role } = useRole();
  const { filters, handleFilterChange } = useContext(FilterContext);
  const { data: session } = useSession();

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
  } = Servicios;

  const {
    data,
    total,
    loading,
    error,

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

  // Socket y realtime para 'servicio'
  const { socket } = useSocket(session?.accessToken);
  useRealtimeEntity(socket, "servicio", {
    onCreated: () => {
      const params = {
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters, filterConfig),
        ...convertSortingToQueryParams(sorting),
      };
      fetchData(params);
    },
    onUpdated: () => {
      const params = {
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters, filterConfig),
        ...convertSortingToQueryParams(sorting),
      };
      fetchData(params);
    },
    onDeleted: () => {
      const params = {
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters, filterConfig),
        ...convertSortingToQueryParams(sorting),
      };
      fetchData(params);
    },
  });

  const handleCreate = useCallback(() => {
    openModal("crear", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  // const handleEdit = useCallback(
  //   (item) => {
  //     openModal("editar", {
  //       initialData: item,
  //       handleSubmit,
  //       fetchData,
  //       updatePath,
  //       createPath,
  //     });
  //   },
  //   [openModal, handleSubmit, fetchData, updatePath, createPath]
  // );

  const actionHandlers = {
    create: handleCreate,
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
          ...convertFiltersToQueryParams(filters, filterConfig),
          ...convertSortingToQueryParams(sorting),
        },
      }),
    limit: 20,
    deps: [JSON.stringify(filters), JSON.stringify(sorting)],
  });

  useEffect(() => {
    if (loadingFilters) return;
    if (Servicios.useInfiniteScroll) return; // lo maneja el hook
    const params = {
      limit,
      offset: pageIndex * limit,
      ...convertFiltersToQueryParams(filters, filterConfig),
      ...convertSortingToQueryParams(sorting),
    };
    fetchData(params);
  }, [loadingFilters, Servicios.useInfiniteScroll, limit, pageIndex, filters, fetchData, sorting, convertSortingToQueryParams, filterConfig]);

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
        data={Servicios.useInfiniteScroll ? infData : data}
        total={Servicios.useInfiniteScroll ? infTotal : total}
        loading={Servicios.useInfiniteScroll ? infLoading : loading}
        error={error}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        limit={limit}
        excludeColumns={excludeColumns}
        canEdit={canEdit}
        canDelete={canDelete}
        // handleEdit={canEdit ? handleEdit : null}
        handleCreate={canEdit ? handleCreate : null}
        handleDelete={canDelete ? handleDelete : null}
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
        columnOrder={Servicios.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={Servicios.useInfiniteScroll ? lastRowRef : undefined}
        useInfiniteScroll={Servicios.useInfiniteScroll}
      />
    </div>
  );
};

const ServiciosEmpresa = () => (
  <FilterProvider config={Servicios}>
    <ModalProvider modalsConfig={Servicios.modalsConfig}>
      <ServiciosContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default ServiciosEmpresa;
