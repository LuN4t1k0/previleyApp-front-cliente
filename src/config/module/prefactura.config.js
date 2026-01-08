// import GenericModal from "@/components/modal/GenericModal";
// import RejectProduccionContent from "@/components/modal/producciones/RejectProduccionContent";
// import PrefacturaDetailsContent from "@/components/modal/prefactura/PrefacturaDetailsContent";
// import {RiCheckLine, RiCloseLine,RiFilePdf2Line, RiArticleLine, RiResetLeftLine} from "@remixicon/react";
// import PrefacturaContent from "@/components/modal/prefactura/PrefacturaDetailsContent";
// import CreatePrefacturaEmpresaContent from "@/components/modal/prefactura/CreatePrefacturaEmpresaContent";
// import CreatePrefacturaAllEmpresasContent from "@/components/modal/prefactura/CreatePrefacturaAllEmpresasContent";

// import CreateFacturaModal from "@/components/modal/factura/CreateFacturaModal";
// import RevertPrefacturaContent from "@/components/modal/prefactura/RevertPrefacturaContent";

// const PrefacturaConfig = {
//   // Rutas de la API
//   createPath: "/produccion/crear",
//   updatePath: "/produccion/actualizar",
//   resourcePath: "/prefacturas/prefacturas",
//   deletePath: "/produccion/eliminar",
//   filtersPath: "/produccion/filters",
//   detailPath: "/prefacturas/detalle",

//   buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

//   // Información de UI
//   title: "Pre-Facturas",
//   subtitle: "Resumen de todas las Pre-Facturas registradas en PrevileyAPP.",

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

//    // Orden personalizado de las columnas
//    columnOrder: [
//     "empresaRut",
//     "empresa",
//     "servicio",
//     "montoRegularizado",
//     "entidad",
//     "certificadoInicial",
//     "certificadoFinal",
//     "detalle",

//   ],

//   // Columnas a excluir en la visualización de tablas
//   excludeColumns: [
//     "createdAt", "updatedAt", "id"
//   ],

//   // Columnas a formatear como moneda
//   monetaryColumns: ["totalFacturado"],

//   // Añadir configuración de las columnas ordenables:
//   columnsConfig: [
//     {
//       header: "Factura",
//       accessorKey: "factura",
//       type: "link", // Enlace
//       Icono: RiFilePdf2Line, // Ícono para el enlace
//       label: "", // Texto para el enlace
//       iconClass: "mr-2 text-red-500", // Clases para el ícono
//     },
//     {
//       header: "Estado",
//       accessorKey: "accionesEstado", // campo "falso", no existe en la DB
//       type: "actions",  // usamos un "type" personalizado
//       actions: [

//         {
//           id: "createFactura",
//           icon: RiArticleLine,
//           label: "Agregar Factura",
//           iconClass: "text-green-500",
//           rolesAllowed: ["admin", "editor"],
//           visibleWhen: (rowData) => rowData.estado === "pendiente",
//         },
//         {
//           id: "revertPrefactura",
//           icon: RiResetLeftLine,
//           label: "Revertir",
//           iconClass: "text-yellow-500",
//           rolesAllowed: ["admin"],
//           visibleWhen: (rowData) => rowData.estado === "pendiente",
//         },
//         // {
//         //   id: "rejectProduccion",
//         //   icon: RiCloseLine,
//         //   label: "Rechazar",
//         //   iconClass: "text-red-500",
//         //   rolesAllowed: ["admin", "editor"],
//         //   visibleWhen: (rowData) => rowData.estado === "pendiente",
//         // },
//       ],
//       meta: {
//         align: "text-center", // opcional, para centrar
//       },
//     },

//   ],

//   // Columnas a formatear como fecha
//   dateColumns: ["fechaProduccion"], // Añade las columnas que necesites

//   // Configuración de badges
//   badgesConfig: {
//     estado: {
//       type: "status",
//       variants: {
//         "validado": "success",
//         "pendiente": "warning",
//         "rechazada": "error",

//       },
//     },
//   },

//   // Configuración de modales
//   modalsConfig: {
//     produccionForm: {
//       component: GenericModal,
//       title: "Agregar/Editar Factura",
//       content: PrefacturaContent,
//       rolesAllowed: ["admin","trabajador"],
//     },

//     createFactura:{
//        component: GenericModal,
//       title: "Modal Prueba",
//       content: CreateFacturaModal,
//       rolesAllowed: ["admin", "editor"],
//     },

//     revertPrefactura: {
//       component: GenericModal,
//       title: "Revertir Prefactura",
//       content: RevertPrefacturaContent,
//       rolesAllowed: ["admin"],
//     },

//     rejectProduccion: { // 👈 Nueva Modal
//       component: GenericModal,
//       title: "Rechazar Producción",
//       content: RejectProduccionContent,
//       rolesAllowed: ["admin", "editor"],
//     },
//     prefacturaDetalle: {
//       component: GenericModal,
//       title: "PRE-FACTURA",
//       content: PrefacturaDetailsContent,
//       rolesAllowed: ["admin", "previley", "editor","cliente"],
//     },
//     createForEmpresa: {
//       component: GenericModal,
//       title: "Crear Prefactura para una Empresa",
//       content: CreatePrefacturaEmpresaContent,
//       rolesAllowed: ["admin"],
//     },
//     createForAllEmpresas: {
//       component: GenericModal,
//       title: "Crear Prefacturas para Todas las Empresas",
//       content: CreatePrefacturaAllEmpresasContent,
//       rolesAllowed: ["admin"],
//     },
//   },
//   actionsConfig: [
//     {
//       id: "createForEmpresa",
//       modalName: "createForEmpresa",
//       buttonText: "Prefactura Empresa",
//       rolesAllowed: ["admin"],
//       actionType: "createForEmpresa",
//       color: "blue",
//       icon: "RiFileAddFill",
//     },
//     {
//       id: "createForAllEmpresas",
//       modalName: "createForAllEmpresas",
//       buttonText: "Prefacturas Todas",
//       rolesAllowed: ["admin"],
//       actionType: "createForAllEmpresas",
//       color: "purple",
//       icon: "RiBuilding2Fill",
//     },

//      {
//   id: "prefacturaEmpresa",
//   modalName: "crearPrefactura",
//   buttonText: "Empresa",
//   rolesAllowed: ["admin"],
//   actionType: "crearPrefacturaEmpresa",
//   color: "indigo", // diferente al otro
//   icon: "RiBuildingLine",
// },
//        {
//   id: "prefacturaMasiva",
//   modalName: "crearPrefactura",
//   buttonText: "Todas",
//   rolesAllowed: ["admin"],
//   actionType: "crearPrefacturaTodas",
//   color: "purple", // conserva el original
//   icon: "RiCommunityLine",
// }
//   ],
// };

// export default PrefacturaConfig;

// VIEJAS

import PrefacturaDetailsContent from "@/components/modal/prefactura/PrefacturaDetailsContent";
import {
  RiCheckLine,
  RiCloseLine,
  RiFilePdf2Line,
  RiArticleLine,
  RiResetLeftLine,
  RiAlarmWarningLine,
  RiMailSendLine,
} from "@remixicon/react";
import PrefacturaContent from "@/components/modal/prefactura/PrefacturaDetailsContent";
import CreatePrefacturaEmpresaContent from "@/components/modal/prefactura/CreatePrefacturaEmpresaContent";
import CreatePrefacturaAllEmpresasContent from "@/components/modal/prefactura/CreatePrefacturaAllEmpresasContent";
import PrefacturaSendEmailModal from "@/components/modal/prefactura/PrefacturaSendEmailModal";
import PrefacturaEmailHistoryModal from "@/components/modal/prefactura/PrefacturaEmailHistoryModal";

import GenericModal from "@/components/modal/GenericModal";

import ProduccionFormContent from "@/components/modal/producciones/ProduccionFormContent";
import RejectProduccionContent from "@/components/modal/producciones/RejectProduccionContent";

import {
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileExcel2Line,
} from "@remixicon/react";
import CreateFacturaModal from "@/components/modal/factura/CreateFacturaModal";
import RevertPrefacturaContent from "@/components/modal/prefactura/RevertPrefacturaContent";

const PrefacturaConfig = {
  // Rutas de la API
  createPath: "/produccion/crear",
  updatePath: "/produccion/actualizar",
  resourcePath: "/prefacturas/prefacturas",
  deletePath: "/produccion/eliminar",
  filtersPath: "/prefacturas/filters",
  detailPath: "/prefacturas/detalle",
  bulkUploadPath: "/produccion/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Pre-Facturas",
  subtitle: "Administra las pre-facturas generadas.",

  // useInfiniteScroll: true, // Habilitar scroll infinito
  useInfiniteScroll: true,
  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "empresaRut",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa...",
      options: "empresas", // backend: empresas: [{ value, label }]
    },
    {
      key: "estado",
      type: "multiselect",
      field: "estado",
      placeholder: "Estado...",
      options: "estado", // backend: estado: ["pendiente", "aprobada", ...]
    },
    {
      key: "folio",
      type: "text",
      field: "folio",
      placeholder: "Buscar por folio...",
    },
    {
      key: "fechaGeneracion",
      type: "dateRange",
      field: "fechaGeneracion",
      placeholder: "Fecha de generación...",
    },
  ],

  // Orden personalizado de las columnas
  columnOrder: [],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["id"],

  // Columnas a formatear como moneda
  monetaryColumns: ["totalFacturado"], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaGeneracion"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "total",
      accessorKey: "totalFacturado",
      rolesAllowed: ["admin"], // solo admins
    },
    {
      header: "Envío",
      accessorKey: "envioEstado",
      type: "emailStatus",
    },
    {
      header: "Factura",
      accessorKey: "factura",
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
          id: "sendEmail",
          icon: RiArticleLine,
          label: "Enviar correo",
          iconClass: "text-blue-500",
          rolesAllowed: ["admin"],
          visibleWhen: () => true,
        },
        {
          id: "sendFollowUp",
          icon: RiMailSendLine,
          label: "Recordar OC / HES",
          iconClass: "text-orange-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) =>
            rowData.estado === "pendiente" || rowData.estado === "aprobada",
        },
        {
          id: "viewEmailHistory",
          icon: RiArticleLine,
          label: "Ver historial",
          iconClass: "text-gray-500",
          rolesAllowed: ["admin"],
          visibleWhen: () => true,
        },
        {
          id: "sendFacturaReminder",
          icon: RiAlarmWarningLine,
          label: "Recordar pago",
          iconClass: "text-red-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado === "facturada",
        },
        {
          id: "createFactura",
          icon: RiArticleLine,
          label: "Agregar Factura",
          iconClass: "text-green-500",
          rolesAllowed: ["admin", "editor"],
          visibleWhen: (rowData) => rowData.estado === "pendiente",
        },

        {
          id: "revertPrefactura",
          icon: RiResetLeftLine,
          label: "Revertir",
          iconClass: "text-yellow-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado === "pendiente",
        },
      ],
    },
  ],

  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  // Configuración de modales
  modalsConfig: {
    sendEmail: {
      component: GenericModal,
      title: "Enviar Prefactura",
      content: PrefacturaSendEmailModal,
      rolesAllowed: ["admin"],
    },
    emailHistory: {
      component: GenericModal,
      title: "Historial de Envíos",
      content: PrefacturaEmailHistoryModal,
      rolesAllowed: ["admin"],
    },
    createFactura: {
      component: GenericModal,
      title: "Agregar Factura",
      content: CreateFacturaModal,
      rolesAllowed: ["admin", "editor"],
    },

    revertPrefactura: {
      component: GenericModal,
      title: "Revertir Prefactura",
      content: RevertPrefacturaContent,
      rolesAllowed: ["admin"],
    },

    prefacturaDetalle: {
      component: GenericModal,
      title: "PRE-FACTURA",
      content: PrefacturaDetailsContent,
      rolesAllowed: ["admin", "previley", "editor", "cliente"],
    },
    createForEmpresa: {
      component: GenericModal,
      title: "Crear Prefactura para una Empresa",
      content: CreatePrefacturaEmpresaContent,
      rolesAllowed: ["admin"],
    },
    createForAllEmpresas: {
      component: GenericModal,
      title: "Crear Prefacturas para Todas las Empresas",
      content: CreatePrefacturaAllEmpresasContent,
      rolesAllowed: ["admin"],
    },
  },

  actionsConfig: [
    {
      id: "prefacturaEmpresa",
      modalName: "crearPrefactura",
      buttonText: "Empresa",
      rolesAllowed: ["admin"],
      actionType: "createForEmpresa",
      color: "indigo", // diferente al otro
      icon: "RiBuildingLine",
    },
    {
      id: "prefacturaMasiva",
      modalName: "crearPrefactura",
      buttonText: "Todas",
      rolesAllowed: ["admin"],
      actionType: "createForAllEmpresas",
      color: "purple", // conserva el original
      icon: "RiCommunityLine",
    },
    {
      id: "enviarVisibles",
      modalName: null,
      buttonText: "Enviar visibles (filtro actual)",
      rolesAllowed: ["admin"],
      actionType: "sendBulk",
      color: "blue",
      icon: "RiMailLine",
    },
    {
      id: "exportPrefacturas",
      modalName: null,
      buttonText: "Exportar Excel",
      rolesAllowed: ["admin", "previley"],
      actionType: "exportExcel",
      color: "green",
      icon: "RiFileExcel2Line",
    },
  ],

  badgesConfig: {
    estado: {
      type: "status",
      variants: {
        facturada: "success",
        pendiente: "warning",
      },
    },
    envioEstado: {
      type: "status",
      variants: {
        queued: "warning",
        sent: "success",
        failed: "error",
        null: "neutral",
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
};

export default PrefacturaConfig;
