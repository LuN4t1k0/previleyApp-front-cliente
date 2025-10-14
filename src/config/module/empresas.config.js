// import BulkActions from "@/components/modal/BulkActions";
// import BulkUploadModal from "@/components/modal/BulkUploadModal";
// import EmpresaFormModal from "@/components/modal/empresa/EmpresaFormModal";
// import EmpresaDetailsContent from "@/components/modal/empresa/EmpresaDetailContent";
// import GenericModal from "@/components/modal/GenericModal";

// import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
// import TestModal from "@/components/modal/TestModal";


// const EmpresasConfig = {
//   // Rutas de la API
//   createPath: "/empresas/crear",
//   updatePath: "/empresas/actualizar",
//   resourcePath: "/empresas/",
//   deletePath: "/empresas/eliminar",
//   filtersPath: "/empresas/filters",
//   detailPath: "/empresas/detalle",
//   bulkDeletePath: "/empresas/bulk-delete",
//   bulkUploadPath: "/empresas/bulk-create",
//   buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

//   // Información de UI
//   title: "Directorio de Empresas",
//   subtitle: "Edita y administra todas las empresas registradas en PrevileyAPP.",

//   // Definición de los filtros y su mapeo a los parámetros de consulta
//   filters: [
//   {
//       key: "empresaRut",
//       type: "multiselect",
//       field: "empresaRut",
//       placeholder: "Empresa...",
//       options: "empresaRut", // 🟢 cambiar esto
//     },
//   {
//     key: "estado",
//     type: "multiselect",
//     field: "estado",
//     placeholder: "Estado...",
//     options: "estadoOptions", // este valor será poblado desde `customOptions`
//   },
//   {
//     key: "nombre",
//     type: "text",
//     field: "nombre",
//     placeholder: "Buscar por nombre...",
//   },
// ]
// ,

//   // Columnas a excluir en la visualización de tablas
//   excludeColumns: [
//     "createdAt", "updatedAt", "id","cuentaCorriente", "banco"
 
//   ],

//   // Columnas a formatear como moneda
//   monetaryColumns: ["montoAnticipo", "montoSubsidio", "montoDiferencia"],

//   // Columnas a formatear como fecha
//   dateColumns: ["fechaInicio", "fechaTermino"], // Añade las columnas que necesites

//   // Configuración de badges
//   badgesConfig: {
//     montoDiferencia: {
//       type: "value",
//       variants: {
//         positive: "success", // Mantener success
//         negative: "error",   // Cambiar danger a error
//         neutral: "neutral",  // Cambiar default a neutral
//       },
//     },
//     estado: {
//       type: "status",
//       variants: {
//         "activo": "success",
//         "Rechazado": "error",
//         "Aprobado": "success",
//         "Reducida": "warning", // Usar warning como aproximación
//         "Pagada": "success",   // Usar success como aproximación
//         "TRAMITADA POR EMPLEADOR PARA CCAF": "warning",
//         "TRAMITADA POR EMPLEADOR": "warning",
//         "EMITIDA POR PROFESIONAL":"success",


//       },
//     },
//   },

//   // Configuración de modales
//   modalsConfig: {
//     empresaForm: {
//       component: GenericModal,
//       title: "Agregar/Editar Licencia",
//       content: EmpresaFormModal,
//       rolesAllowed: ["admin"],
//     },
//     empresaDetails: {
//       component: GenericModal,
//       title: "Detalle Empresa",
//       content: EmpresaDetailsContent,
//       rolesAllowed: ["admin", "previley", "editor"],
//     },
//     bulkUpload: {
//       component: BulkUploadModal,
//       rolesAllowed: ["admin"],
//     },
//     bulkActions: {
//       component: BulkActions,
//       rolesAllowed: ["admin", "editor"],
//     },
//     testModal: {
//       component: TestModal,
//       rolesAllowed: ["admin", "previley", "editor"],
//     },
//     selectWorker: {
//       component: GenericModal,
//       title: "Seleccionar Trabajador",
//       content: SelectWorkerModal,
//       rolesAllowed: ["admin", "previley", "editor"],
//     }
//   },
//   actionsConfig: [
//     {
//       id: "nuevo",
//       modalName: "empresaForm",
//       buttonText: "",
//       rolesAllowed: ["admin"],
//       actionType: "create",
//       color: "blue",
//       icon: "RiFileAddFill",
//     },
//     {
//       id: "bullUpload",
//       modalName: "bulkUpload",
//       buttonText: "",
//       rolesAllowed: ["admin"],
//       actionType: "bulkUpload",
//       color: "yellow",
//       icon: "RiFileUploadFill",
//     },
//     {
//       id: "pdf",
//       modalName: "exportarPDF",
//       buttonText: "",
//       rolesAllowed: ["admin", "previley", "cliente"],
//       actionType: "exportPDF",
//       color: "red",
//       icon: "RiFilePdf2Fill",
//     },
//     {
//       id: "excel",
//       modalName: "exportarExcel",
//       buttonText: "",
//       rolesAllowed: ["admin", "previley", "cliente"],
//       actionType: "exportExcel",
//       color: "green",
//       icon: "RiFileExcel2Fill",
//     }
//   ],
// };

// export default EmpresasConfig;


// NUEVO:

import EmpresaDetailsContent from "@/components/modal/empresa/EmpresaDetailContent";
import EmpresaFormModal from "@/components/modal/empresa/EmpresaFormModal";
import GenericModal from "@/components/modal/GenericModal";

import AsignarUsuariosEmpresasModal from "@/components/modal/usuarios/AsignarUsuariosEmpresasModal";
import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";

const EmpresasConfig = {
  // Rutas de la API
  createPath: "/empresas/",
  updatePath: "/empresas",
  resourcePath: "/empresas/",
  deletePath: "/empresas/",
  filtersPath: "/empresas/filters",
  detailPath: "/empresas/detalle",
  bulkUploadPath: "/empresas/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Empresas",
  subtitle: "Administrar todas las empresas registradas en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta

  filters: [
  {
      key: "empresaRut",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa...",
      options: "empresaRut", // 🟢 cambiar esto
    },
  {
    key: "estado",
    type: "multiselect",
    field: "estado",
    placeholder: "Estado...",
    options: "estadoOptions", // este valor será poblado desde `customOptions`
  },
  {
    key: "nombre",
    type: "text",
    field: "nombre",
    placeholder: "Buscar por nombre...",
  },
]
,

  // Orden personalizado de las columnas
  columnOrder: [],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["id","updatedAt"],

  // Columnas a formatear como moneda
  monetaryColumns: [], // Añade las columnas que necesites

  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "editar",
          icon: RiEditLine,
          label: "Editar",
          iconClass: "text-blue-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
        },
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
        },
      ],
    },
  ],

  // Columnas a formatear como fecha
  dateColumns: ["createdAt",], // Añade las columnas que necesites
  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  badgesConfig: {
    estado: {
      type: "status",
      variants: {
        activo: "success",
        inactivo: "danger",
      },
    },
    rol: {
      type: "status",
      variants: {
        admin: "warning",
        previley: "default",
        cliente: "neutral",
      },
    },
  },

  // Configuración de modales
  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: EmpresaFormModal,
      rolesAllowed: ["admin", "trabajador"],
    },

    asignarEmpresa: {
      component: GenericModal,
      title: "Detalle Usuario",
      content: AsignarUsuariosEmpresasModal,
      rolesAllowed: ["admin", "previley", "editor"],
    },
    empresaDetails: {
      component: GenericModal,
      title: "Detalle Empresa",
      content: EmpresaDetailsContent,
      rolesAllowed: ["admin", "previley", "editor"],
    },
  },

  actionsConfig: [
    {
      id: "nuevo",
      modalName: "licenciaForm",
      buttonText: "Agregar",
      rolesAllowed: ["admin"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddFill",
    },
    {
      id: "asignarEmpresa",
      modalName: "asignarEmpresa", // ✅ ya está correcto
      buttonText: "Asignar",
      rolesAllowed: ["admin"],
      actionType: "asignarEmpresa", // ✅ este nombre debe coincidir con la clave del handler
      color: "purple",
      icon: "RiBuildingFill",
    },
  ],
  // Habilitar scroll infinito
  useInfiniteScroll: true,
};

export default EmpresasConfig;
