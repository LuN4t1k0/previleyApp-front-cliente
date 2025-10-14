// import BulkActions from "@/components/modal/BulkActions";
// import BulkUploadModal from "@/components/modal/BulkUploadModal";
// import GenericModal from "@/components/modal/GenericModal";
// import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
// import TestModal from "@/components/modal/TestModal";
// import UserDetailsContent from "@/components/modal/UserDetailContent";
// import AsignarUsuariosEmpresasModal from "@/components/modal/usuarios/AsignarUsuariosEmpresasModal";
// import UsuarioFormContent from "@/components/modal/usuarios/UsuarioFormContent";

// const UsuariosConfig = {
//   // Rutas de la API
//   createPath: "/usuarios/crear",
//   updatePath: "/usuarios/actualizar",
//   resourcePath: "/usuarios/get-usuarios",
//   deletePath: "/usuarios/eliminar",
//   filtersPath: "/usuarios/filters",
//   detailPath: "/usuarios/detalle",
//   bulkDeletePath: "/usuarios/bulk-delete",
//   bulkUploadPath: "/usuarios/bulk-create",
//   buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

//   // Información de UI
//   title: "Usuarios Registrados",
//   subtitle: "Revisa el estado de los usuarios registrados en PrevileyAPP.",

//   // Definición de los filtros y su mapeo a los parámetros de consulta
//   filters: [
//     {
//       key: "filter1",
//       type: "text",
//       field: "rut",
//       placeholder: "Buscar por folio...",
//     },
//     {
//       key: "filter2",
//       type: "multiselect",
//       field: "estadoLicencia",
//       placeholder: "Estado Licencia...",
//       options: "filter2",
//     },
//     {
//       key: "filter3",
//       type: "multiselect",
//       field: "empresaRut",
//       placeholder: "Empresa Rut...",
//       options: "filter3",
//     },
//     {
//       key: "filter4",
//       type: "multiselect",
//       field: "trabajadorRut",
//       placeholder: "Trabajador Rut...",
//       options: "filter4",
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

//   // Columnas a excluir en la visualización de tablas
//   excludeColumns: [
//     "createdAt", "updatedAt","fechaIngreso","direccion","empresaRut","fechaNacimiento","id"
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
//       },
//     },
//     rol: {
//       type: "status",
//       variants: {
//         "admin": "warning",
//         "previley": "default",
//         "cliente": "neutral",

//       },
//     },
//   },

//   // Configuración de modales
//   modalsConfig: {
//     licenciaForm: {
//       component: GenericModal,
//       title: "Agregar/Editar Licencia",
//       content: UsuarioFormContent,
//       rolesAllowed: ["admin"],
//     },
//     licenciaDetails: {
//       component: GenericModal,
//       title: "Detalle Usuario",
//       content: UserDetailsContent,
//       rolesAllowed: ["admin", "previley", "editor"],
//     },
//     addEmpresa: {
//       component: GenericModal,
//       title: "Detalle Usuario",
//       content: AsignarUsuariosEmpresasModal,
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
//       modalName: "licenciaForm",
//       buttonText: "",
//       rolesAllowed: ["admin"],
//       actionType: "create",
//       color: "blue",
//       icon: "RiFileAddFill",
//     },
//     {
//       id: "asignarEmpresa",
//       modalName: "addEmpresa",
//       buttonText: "Asignar Empresa",
//       rolesAllowed: ["admin"],  // Solo administradores pueden verla
//       actionType: "assignEmpresa",
//       color: "purple",
//       icon: "RiBuildingFill", // Puedes cambiar el icono
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

// export default UsuariosConfig;

// NUEVO:

import GenericModal from "@/components/modal/GenericModal";

import AsignarUsuariosEmpresasModal from "@/components/modal/usuarios/AsignarUsuariosEmpresasModal";

import UsuarioFormModal from "@/components/modal/usuarios/UsuarioFormContent";

import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";

const UsuariosConfig = {
  // Rutas de la API
  createPath: "/usuarios/",
  updatePath: "/usuarios",
  resourcePath: "/usuarios/",
  deletePath: "/usuarios/",
  filtersPath: "/usuarios/filters",
  detailPath: "/usuarios/detalle/",
  bulkUploadPath: "/usuarios/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Usuarios",
  subtitle: "Administra los usuarios registrados en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta

  filters: [
    {
      key: "nombre",
      type: "text",
      field: "nombre",
      placeholder: "Buscar por nombre...",
    },
    {
      key: "email",
      type: "text",
      field: "email",
      placeholder: "Buscar por email...",
    },
    {
      key: "rol",
      type: "multiselect",
      field: "rol",
      placeholder: "Rol...",
      options: "rol", // debe coincidir con el key del backend
    },
    {
      key: "estado",
      type: "multiselect",
      field: "estado",
      placeholder: "Estado...",
      options: "estado",
    },
  ],

  // Orden personalizado de las columnas
  columnOrder: [],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["id"],

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
  dateColumns: [], // Añade las columnas que necesites
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
      content: UsuarioFormModal,
      rolesAllowed: ["admin", "trabajador"],
    },

    asignarEmpresa: {
      component: GenericModal,
      title: "Detalle Usuario",
      content: AsignarUsuariosEmpresasModal,
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
  // Habilitar scroll infinito para el listado
  useInfiniteScroll: true,
};

export default UsuariosConfig;
