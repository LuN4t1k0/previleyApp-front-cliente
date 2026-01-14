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
// import { showErrorAlert } from "@/utils/alerts";
// import ActionButtons from "@/components/actions/ActionButtons";
// import { useCrud } from "@/hooks/useCrud";

// import apiService from "@/app/api/apiService";
// import UsuariosConfig from "@/config/module/usuarios.config";

// const UsuariosPageContent = () => {
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
//     createPath,
//     updatePath, // Asegúrate de pasarlo aquí
//     resourcePath,
//     deletePath,
//     filtersPath,
//     filters: filterConfig,
//     bulkDeletePath,
//     detailPath,
//     bulkUploadPath,
//     title,
//     subtitle,
//     excludeColumns,
//     buildDetailEndpoint,
//     actionsConfig
//   } = UsuariosConfig;

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
//     openModal("licenciaForm", {
//       handleSubmit,
//       fetchData,
//       updatePath,
//       createPath,
//     });
//   }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

//   // EDITAR
//   const handleEdit = useCallback(
//     (item) => {
//       openModal("licenciaForm", {
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
//         const fetchedDetails = await fetchDetails(item.id);
//         console.log("Detalles obtenidos para la modal:", fetchedDetails);
//         if (fetchedDetails) {
//           openModal("licenciaDetails", { userData: fetchedDetails });
//         }
//       } catch (error) {
//         console.error("Error fetching license details:", error);
//       }
//     },
//     [fetchDetails, openModal]
//   );


//     const handleAssignEmpresa = useCallback(() => {
//       openModal("addEmpresa", {
//         fetchData,
//       });
//     }, [openModal, fetchData]);

  

//   // PASAMOS LAS ACCIONES :
//   const actionHandlers = {
//     create: handleCreate,
//     bulkUpload: handleBulkUploadModal,
//     exportPDF: handleExportPDF,
//     exportExcel: handleExportExcel,
//     assignEmpresa: handleAssignEmpresa, // <-- Agregar esta acción
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
//   } = useFilters(filtersPath, queryParams,filterConfig);

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
  
//         if (filterValue !== undefined && filterValue !== null && filterValue !== "") {
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
//         <h2 className="text-xl font-bold text-gray-700">No tienes permiso para ver esta página.</h2>
//         <p className="text-gray-500 mt-2">Contacta al administrador si crees que esto es un error.</p>
//         <button
//           className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           onClick={() => navigate('/')}
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
//           actionsConfig={actionsConfig}
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
//         monetaryColumns={UsuariosConfig.monetaryColumns}
//         badgesConfig={UsuariosConfig.badgesConfig}
//         dateColumns={UsuariosConfig.dateColumns} // Pasar las columnas de fecha
        
//       />
//     </div>
//   );
// };
// // Envolver el contenido con ModalProvider
// const UsuariosPage = () => (
//   <FilterProvider>
//     <ModalProvider modalsConfig={UsuariosConfig.modalsConfig}>
//       <UsuariosPageContent/>
//       <ModalManager />
//     </ModalProvider>
//   </FilterProvider>
// );

// export default UsuariosPage;


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
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import apiService from "@/app/api/apiService";
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from "@/utils/alerts";

import { convertFiltersToQueryParams } from "@/utils/filters";
import Titulo from "@/components/title/Title";
import Restricted from "@/components/restricted/Restricted";
// import UsuariosConfig from "@/config/module/empresasUsuariosConfig.config";
import UsuariosConfig from "@/config/module/usuarios.config";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import { useSession } from "next-auth/react";

const UsuariosPageContent = () => {
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
    revisarFechaVencimiento,
    useInfiniteScroll: isInfiniteScrollEnabled
  } = UsuariosConfig;

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

  // Scroll infinito (si está habilitado en la config)
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
        extraParams: convertFiltersToQueryParams(filters, filterConfig),
      }),
    limit: 20,
    deps: [JSON.stringify(filters), JSON.stringify(sorting)],
  });

  // Socket y realtime para usuarios
  const { socket } = useSocket(session?.accessToken);
  useRealtimeEntity(socket, "usuario", {
    onCreated: async () => {
      if (isInfiniteScrollEnabled) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        await fetchData(params);
      }
    },
    onUpdated: async () => {
      if (isInfiniteScrollEnabled) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        await fetchData(params);
      }
    },
    onDeleted: async () => {
      if (isInfiniteScrollEnabled) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
        };
        await fetchData(params);
      }
    },
  });

  const handleCreate = useCallback(() => {
    openModal("crearEditar", {
      handleSubmit,
      fetchData,
      updatePath,
      createPath,
    });
  }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

  const handleEdit = useCallback(
    (item) => {
      openModal("crearEditar", {
        initialData: item,
        handleSubmit,
        fetchData,
        updatePath,
        createPath,
      });
    },
    [openModal, handleSubmit, fetchData, updatePath, createPath]
  );

const handleAssignEmpresa = useCallback(() => {
  openModal("asignarEmpresa", { fetchData });
}, [openModal, fetchData]);


// Eliminar y refrescar según el modo (scroll/paginación)
const handleDeleteAndRefresh = useCallback(async (item) => {
  const confirm = await showConfirmationAlert(
    "¿Está seguro de que desea eliminar este registro?",
    "¡No podrás revertir esto!"
  );
  if (!confirm) return;
  try {
    const id = typeof item === "object" ? item.id : item;
    if (!id) throw new Error("ID inválido para eliminar el registro.");
    await apiService.delete(`${deletePath}/${id}`);
    showSuccessAlert("¡Eliminado!", "Tu registro ha sido eliminado.");
    if (isInfiniteScrollEnabled) {
      await refetch();
    } else {
      const params = {
        limit,
        offset: pageIndex * limit,
        ...convertFiltersToQueryParams(filters, filterConfig),
      };
      await fetchData(params);
    }
  } catch (err) {
    console.error("Error deleting record:", err);
    showErrorAlert("Error", "No se pudo eliminar el registro.");
  }
}, [deletePath, isInfiniteScrollEnabled, refetch, fetchData, pageIndex, limit, filters, filterConfig]);

const actionHandlers = {
  create: handleCreate,
  editar: handleEdit,
  eliminar: handleDeleteAndRefresh,
  asignarEmpresa: handleAssignEmpresa,
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
    if (isInfiniteScrollEnabled) return; // Lo maneja el hook
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
    isInfiniteScrollEnabled,
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
        data={isInfiniteScrollEnabled ? infData : data}
        total={isInfiniteScrollEnabled ? infTotal : total}
        loading={isInfiniteScrollEnabled ? infLoading : loading}
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
        columnOrder={UsuariosConfig.columnOrder}
        revisarFechaVencimiento={revisarFechaVencimiento}
        scrollTriggerRef={isInfiniteScrollEnabled ? lastRowRef : undefined}
        useInfiniteScroll={isInfiniteScrollEnabled}
      />
    </div>
  );
};

const Usuarios = () => (
  <FilterProvider config={UsuariosConfig}>
    <ModalProvider modalsConfig={UsuariosConfig.modalsConfig}>
      <UsuariosPageContent />
      <ModalManager />
    </ModalProvider>
  </FilterProvider>
);

export default Usuarios;
