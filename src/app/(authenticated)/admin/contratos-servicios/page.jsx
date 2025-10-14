// "use client";

// import React, { useState, useEffect, useContext, useCallback } from "react";
// import { useRole } from "@/context/RoleContext";
// import { useFilters } from "@/hooks/useFilters";
// import { FilterContext, FilterProvider } from "@/context/FilterContext";
// import GenericFilter from "@/components/filters/GenericFilter";
// import GenericTableWithDetail from "@/components/table/GenericTableWithDetail";
// import { ModalProvider, useModal } from "@/context/ModalContext";
// import ModalManager from "@/components/modal/ModalManager";

// import ActionButtons from "@/components/actions/ActionButtons";
// import { useCrud } from "@/hooks/useCrud";

// import { convertFiltersToQueryParams } from "@/utils/filters";
// import Titulo from "@/components/title/Title";
// import ContratosServicios from "@/config/module/contratosServicios.config";

// const ContratosContent = () => {
//   const { openModal } = useModal();
//   const { role } = useRole();
//   const { filters, handleFilterChange } = useContext(FilterContext);

//   const [pageIndex, setPageIndex] = useState(0);
//   const limit = 10;
//   const [sorting, setSorting] = useState([]);

//   const canView = ["admin", "cliente", "previley", "trabajador"].includes(role);
//   const canEdit = ["admin", "editor", "trabajador"].includes(role);
//   const canDelete = ["admin", "editor", "trabajador"].includes(role);

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
//     updatePath,
//     bulkUploadPath,
//     dateColumns,
//     columnsConfig,
//     monetaryColumns,
//     badgesConfig,
//     actionsConfig,
//     bulkUploadParentIdField: parentIdField,
//   } = ContratosServicios;

//   const {
//     data,
//     total,
//     loading,
//     error,

//     handleDelete,
//     handleSubmit,
//     fetchData,
//     handleBulkDelete,
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

//   const handleCreate = useCallback(() => {
//     openModal("asignarServiciosForm", {
//       handleSubmit,
//       fetchData,
//       updatePath,
//       createPath,
//     });
//   }, [openModal, handleSubmit, fetchData, updatePath, createPath]);

//   const handleEdit = useCallback(
//     (item) => {
//       openModal("asignarServiciosForm", {
//         initialData: item,
//         handleSubmit,
//         fetchData,
//         updatePath,
//         createPath,
//       });
//     },
//     [openModal, handleSubmit, fetchData, updatePath, createPath]
//   );

//   const actionHandlers = {
//     create: handleCreate,
//     // editar: handleEdit,
//     eliminar: handleDelete,
//   };

//   const queryParams = { limit: 10, offset: 0 };
//   const { uniqueValues, loading: loadingFilters } = useFilters(
//     filtersPath,
//     queryParams,
//     filterConfig
//   );

//   const convertSortingToQueryParams = useCallback((sorting) => {
//     if (sorting.length === 0) return {};
//     const sortField = sorting[0].id;
//     const sortOrder = sorting[0].desc ? "desc" : "asc";
//     return { sortField, sortOrder };
//   }, []);

//   useEffect(() => {
//     if (!loadingFilters) {
//       const params = {
//         limit,
//         offset: pageIndex * limit,
//         ...convertFiltersToQueryParams(filters, filterConfig),
//         ...convertSortingToQueryParams(sorting),
//       };
//       fetchData(params);
//     }
//   }, [
//     loadingFilters,
//     limit,
//     pageIndex,
//     filters,
//     fetchData,
//     sorting,
//     convertSortingToQueryParams,
//   ]);

//   if (!canView) {
//     return (
//       <div className="text-center mt-10">
//         <h2 className="text-xl font-bold text-gray-700">
//           No tienes permiso para ver esta página.
//         </h2>
//         <p className="text-gray-500 mt-2">
//           Contacta al administrador si crees que esto es un error.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative space-y-4">
//       {/* 🔹 Título y botones de acción */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <Titulo title={title} subtitle={subtitle} />
//         </div>

//         <div className="mt-2 sm:mt-0 flex flex-row space-x-2 justify-end">
//           <ActionButtons
//             actionsConfig={actionsConfig}
//             actionHandlers={actionHandlers}
//           />
//         </div>
//       </div>

//       <div className="flex flex-row items-center space-x-2 flex-grow">
//         <GenericFilter
//           filters={filters}
//           uniqueValues={uniqueValues}
//           handleFilterChange={handleFilterChange}
//           filterConfig={filterConfig}
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
//         canEdit={canEdit}
//         canDelete={canDelete}
//         // handleEdit={canEdit ? handleEdit : null}
//         handleCreate={canEdit ? handleCreate : null}
//         handleDelete={canDelete ? handleDelete : null}
//         handleBulkDelete={handleBulkDelete}
//         monetaryColumns={monetaryColumns}
//         badgesConfig={badgesConfig}
//         dateColumns={dateColumns}
//         columnsConfig={columnsConfig}
//         sorting={sorting}
//         setSorting={setSorting}
//         convertFiltersToQueryParams={convertFiltersToQueryParams}
//         fetchData={fetchData}
//         filters={filters}
//         actionHandlers={actionHandlers}
//         role={role}
//         columnOrder={ContratosServicios.columnOrder}
//       />
//     </div>
//   );
// };

// const Contratos = () => (
//   <FilterProvider config={ContratosServicios}>
//     <ModalProvider modalsConfig={ContratosServicios.modalsConfig}>
//       <ContratosContent />
//       <ModalManager />
//     </ModalProvider>
//   </FilterProvider>
// );

// export default Contratos;


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

import configuracion from "@/config/module/contratos/contratosServicios.config";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useSocket from "@/hooks/useSocket";
import useRealtimeEntity from "@/hooks/useRealtimeEntity";
import apiService from "@/app/api/apiService";
import useActionFeedback from "@/hooks/useActionFeedback";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { showConfirmationAlert, showSuccessAlert, showErrorAlert } from "@/utils/alerts"; // Asegúrate de importar las alertas

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

  // Socket y realtime para 'servicio' (contratos)
  const { socket } = useSocket(session?.accessToken);
  useRealtimeEntity(socket, "servicio", {
    onCreated: async () => {
      if (isInfiniteScrollEnabled) {
        await refetch();
      } else {
        const params = {
          limit,
          offset: pageIndex * limit,
          ...convertFiltersToQueryParams(filters, filterConfig),
          // ...convertSortingToQueryParams(sorting), // si lo usas
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
          // ...convertSortingToQueryParams(sorting),
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
          // ...convertSortingToQueryParams(sorting),
        };
        await fetchData(params);
      }
    },
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


    // GENERAR DETALLE:
    const handleViewDetails = useCallback(
      async (item) => {
        try {
          const fetchedDetails = await fetchDetails(item.folio);
          console.log("Detalles obtenidos para la modal:", fetchedDetails);
          if (fetchedDetails) {
            openModal("detalle", { licenseData: fetchedDetails });
            console.log(licenseData);
          }
        } catch (error) {
          console.error("Error fetching license details:", error);
        }
      },
      [fetchDetails, openModal]
    );

  const actionHandlers = {
    create: handleCreate,
    editar: handleEdit,
    eliminar: handleDeleteAndRefresh, // Usamos la nueva función
  };

  // const convertSortingToQueryParams = useCallback((sorting) => {
  //   if (sorting.length === 0) return {};
  //   const sortField = sorting[0].id;
  //   const sortOrder = sorting[0].desc ? "desc" : "asc";
  //   return { sortField, sortOrder };
  // }, []);

  // Este useEffect es para paginación tradicional, podría no ser necesario con scroll infinito
  // useEffect(() => {
  //   if (!isInfiniteScrollEnabled && !loadingFilters) {
  //     const params = {
  //       limit,
  //       offset: pageIndex * limit,
  //       ...convertFiltersToQueryParams(filters, filterConfig),
  //       ...convertSortingToQueryParams(sorting),
  //     };
  //     // Aquí necesitarías una función que cargue datos paginados
  //     // fetchData(params); 
  //   }
  // }, [
  //   isInfiniteScrollEnabled,
  //   loadingFilters,
  //   limit,
  //   pageIndex,
  //   filters,
  //   sorting,
  //   convertSortingToQueryParams,
  //   filterConfig,
  // ]);

 if (!canView) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl font-bold text-gray-700">No tienes permiso para ver esta página.</h2>
        <p className="text-gray-500 mt-2">Contacta al administrador si crees que esto es un error.</p>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push('/dashboard')}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-6 lg:px-8 pt-4 relative space-y-4">
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
      />
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
