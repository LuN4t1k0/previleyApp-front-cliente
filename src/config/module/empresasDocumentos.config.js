// import BulkActions from "@/components/modal/BulkActions";
// import BulkUploadModal from "@/components/modal/BulkUploadModal";
// import EmpresaDocumentosModal from "@/components/modal/documentos/EmpresaDocumentosModal";
// import GenericModal from "@/components/modal/GenericModal";
// import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";

// import RejectProduccionContent from "@/components/modal/producciones/RejectProduccionContent";
// import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
// import TestModal from "@/components/modal/TestModal";

// import { RiFilePdf2Line } from "@remixicon/react";

// const EmpresasDocumentosConfig = {
//   // Rutas de la API
//   createPath: "/produccion/crear",
//   updatePath: "/produccion/actualizar",
//   resourcePath: "/empresa-documentos",
//   deletePath: "/empresa-documentos/eliminar",
//   filtersPath: "/produccion/filters",
//   // detailPath: "/produccion/detalle",
//   // bulkDeletePath: "/produccion/bulk-delete",
//   // bulkUploadPath: "/produccion/bulk-create",
//   buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

//   // Información de UI
//   title: "Todos los Documentos",
//   subtitle: "Resumen de todas las Producciones registradas en PrevileyAPP.",

//   // Definición de los filtros y su mapeo a los parámetros de consulta
//   filters: [
//     {
//       key: "filter6",
//       type: "multiselect",
//       field: "servicioId",
//       placeholder: "Servicio...",
//       options: "servicios",
//     },
//     {
//       key: "filter2",
//       type: "multiselect",
//       field: "estado",
//       placeholder: "Estado produccion...",
//       options: "filter2",
//     },

//     {
//       key: "trabajadores",
//       type: "multiselect",
//       field: "trabajadorId", // Nombre del campo que será enviado al backend
//       placeholder: "Seleccionar trabajador...",
//       options: "trabajadores", // Campo en la respuesta del backend
//     },
//     {
//       key: "dateRange",
//       type: "dateRange",
//       dateField: "fechaInicio",
//       dateStartSuffix: "inicio",
//       dateEndSuffix: "termino",
//       placeholder: "Fecha de Depósito...",
//       predefinedRanges: [
//         // ... tus rangos predefinidos
//       ],
//     },
//   ],

//   // Orden personalizado de las columnas
//   columnOrder: [],

//   // Columnas a excluir en la visualización de tablas
//   excludeColumns: ["s3Key"],

//   // Columnas a formatear como moneda
//   monetaryColumns: [],
//   // Columnas a formatear como fecha
//   dateColumns: ["fechaVencimiento",""],
//   // revisarFechaVencimiento
//   revisarFechaVencimiento: ["fechaVencimiento"],
//   // Añadir configuración de las columnas ordenables:
  // columnsConfig: [
  //   { header: "Regularizado", accessorKey: "montoRegularizado" },
  //   {
  //     header: "Documento",
  //     accessorKey: "url",
  //     type: "link", // Enlace
  //     Icono: RiFilePdf2Line, // Ícono para el enlace
  //     label: "", // Texto para el enlace
  //     iconClass: "mr-2 text-red-500", // Clases para el ícono
  //   },
  // ],

//   // Configuración de badges
//   badgesConfig: {
//     montoDiferencia: {
//       type: "value",
//       variants: {
//         positive: "success", // Mantener success
//         negative: "error", // Cambiar danger a error
//         neutral: "neutral", // Cambiar default a neutral
//       },
//     },
//     estado: {
//       type: "status",
//       variants: {
//         validado: "success",
//         pendiente: "warning",
//         rechazada: "error",
//       },
//     },
//   },

//   // Configuración de modales
//   modalsConfig: {
//     documentosForm: {
//       component: GenericModal,
//       title: "Agregar/Editar Producion",
//       content: EmpresaDocumentosModal,
//       rolesAllowed: ["admin", "trabajador"],
//     },
//     rejectProduccion: {
//       // 👈 Nueva Modal
//       component: GenericModal,
//       title: "Rechazar Producción",
//       content: RejectProduccionContent,
//       rolesAllowed: ["admin", "editor"],
//     },
//     licenciaDetails: {
//       component: GenericModal,
//       title: "Detalles de Licencia",
//       content: LicenciaDetailsContent,
//       rolesAllowed: ["admin", "previley", "editor", "cliente"],
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
//     },
//   },
//   actionsConfig: [
//     {
//       id: "nuevo",
//       modalName: "licenciaForm",
//       buttonText: "",
//       rolesAllowed: ["admin", "trabajador"],
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
//     },
//   ],
// };

// export default EmpresasDocumentosConfig;


// NUEVO:

import EmpresaDocumentosModal from "@/components/modal/documentos/EmpresaDocumentosModal";
import GenericModal from "@/components/modal/GenericModal";


import {
  RiFilePdf2Line,

  RiDeleteBinLine,

} from "@remixicon/react";

const EmpresaDocuentosConfig = {
  // Rutas de la API
  createPath: "/empresa-documentos/",
  updatePath: "/empresa-documentos/",
  resourcePath: "/empresa-documentos/",
  deletePath: "/empresa-documentos/",
  filtersPath: "/empresa-documentos/filters",
  detailPath: "/empresa-documentos/detalle",
  bulkUploadPath: "",
  bulkUploadParentIdField: "",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Documentos",
  subtitle: "Administre todos los documentos registrados en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta

  filters: [
  {
    key: "empresaRut",
    type: "multiselect",
    field: "empresaRut",
    placeholder: "Empresa...",
    options: "empresaRut", // ← coincidirá con el key del backend
  },
  {
    key: "tipo",
    type: "multiselect",
    field: "tipo",
    placeholder: "Tipo de documento...",
    options: "tipo", // ← viene desde customOptions del backend
  },
  {
    key: "fechaVencimiento",
    type: "dateRange",
    field: "fecha_vencimiento", // Sequelize espera snake_case
    placeholder: "Fecha de vencimiento...",
  },
{
  key: "estadoVencimiento",
  type: "multiselect",
  placeholder: "Estado de vencimiento",
  options: [
    { label: "Vigente", value: "vigente" },
    { label: "Vencido", value: "vencido" },
  ],
}


],

  // Orden personalizado de las columnas
  columnOrder: [
   
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["s3Key", "id", "createdAt", "updatedAt"],

  // Columnas a formatear como moneda
  monetaryColumns: [], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaVencimiento"], // Añade las columnas que necesites
// revisarFechaVencimiento
  revisarFechaVencimiento: ["fechaVencimiento"],

  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Documento",
      accessorKey: "url",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },

    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
        },
        
        
      ],
    },

    //   ],
    //   meta: {
    //     align: "text-center", // opcional, para centrar
    //   },
    // },
  ],

  

  // Configuración de badges
  badgesConfig: {
    montoDiferencia: {
      type: "value",
      variants: {
        positive: "success", // Mantener success
        negative: "error", // Cambiar danger a error
        neutral: "neutral", // Cambiar default a neutral
      },
    },
    estado: {
      type: "status",
      variants: {
        resuelto: "success",
        analisis: "warning",
        rechazada: "error",
      },
    },
  },

  // Configuración de modales
  modalsConfig: {
    crearDocumento: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: EmpresaDocumentosModal,
      rolesAllowed: ["admin", "trabajador"],
    },
   
  },
  actionsConfig: [
    {
      id: "nuevo",
      modalName: "crearDocumento",
      buttonText: "Nuevo",
      rolesAllowed: ["admin", "trabajador"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddFill",
    },

    
  ],
  // Habilitar scroll infinito
  useInfiniteScroll: true,
};

export default EmpresaDocuentosConfig;
