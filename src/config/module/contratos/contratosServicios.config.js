// import GenericModal from "@/components/modal/GenericModal";
// import AsignarServiciosEmpresasModal from "@/components/modal/servicios/AsignarServiciosFormContent";

// import { RiDeleteBinLine, RiEditLine } from "@remixicon/react";

// const ContratosServicios = {
//   // Rutas de la API
//   createPath: "/servicios-empresas",
//   updatePath: "/servicios-empresas",
//   resourcePath: "/servicios-empresas",
//   deletePath: "/servicios-empresas",
//   filtersPath: "/servicios-empresas/filters",
//   detailPath: "/servicios-empresas/detalle",
//   bulkUploadPath: "",
//   bulkUploadParentIdField: "",
//   buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

//   // Información de UI
//   title: "Contratos de Servicios",
//   subtitle: "Crea nuevos contratos de servicios para empresas en PrevileyAPP.",

//   // Definición de los filtros y su mapeo a los parámetros de consulta

//   filters: [
//     {
//       key: "empresaRut",
//       type: "multiselect",
//       field: "empresaRut",
//       placeholder: "Empresa...",
//       options: "empresaRut", // 🟢 cambiar esto
//     },
//     {
//       key: "servicioId",
//       type: "multiselect",
//       field: "servicioId",
//       placeholder: "Servicio...",
//       options: "servicioId",
//     },
//     {
//       key: "porcentajeCobro",
//       type: "text",
//       field: "porcentajeCobro",
//       placeholder: "Buscar por porcentaje...",
//     },
//   ],

//   // Orden personalizado de las columnas
//   columnOrder: [],

//   // Columnas a excluir en la visualización de tablas
//   excludeColumns: ["id", "servicioId"],

//   // Columnas a formatear como moneda
//   monetaryColumns: [], // Añade las columnas que necesites

  

//   // Añadir configuración de las columnas ordenables:
//   columnsConfig: [
//     { header: "Fecha Creacion", accessorKey: "createdAt" },
//     { header: "Fecha Actualizacion", accessorKey: "updatedAt" },
//     {
//       header: "Acciones",
//       accessorKey: "acciones",
//       type: "actions",
//       actions: [
//         {
//           id: "editar",
//           icon: RiEditLine,
//           label: "Editar",
//           iconClass: "text-blue-600",
//           rolesAllowed: ["admin", "editor", "trabajador"],
//         },
//         {
//           id: "eliminar",
//           icon: RiDeleteBinLine,
//           label: "Eliminar",
//           iconClass: "text-red-600",
//           rolesAllowed: ["admin", "editor", "trabajador"],
//         },
//       ],
      
//     },
//   ],

//   // Columnas a formatear como fecha
//   dateColumns: ["createdAt", "updatedAt"], // Añade las columnas que necesites

//   // Configuración de badges
//   badgesConfig: {},

//   // Configuración de modales
//   modalsConfig: {
//     asignarServiciosForm: {
//       component: GenericModal,
//       title: "Agregar/Editar Producion",
//       content: AsignarServiciosEmpresasModal,
//       rolesAllowed: ["admin",],
//     },
//   },
//   actionsConfig: [
//     {
//       id: "nuevo",
//       buttonText: " Nuevo Contrato",
//       rolesAllowed: ["admin",],
//       actionType: "create",
//       color: "blue",
//       icon: "RiFileAddFill",
//     },

    
//   ],
// };

// export default ContratosServicios;


// NUEVO:
// NUEVO:
import LicenciasFormModal from "@/components/forms/LicenciasForm";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import AsignarServiciosEmpresasModal from "@/components/modal/servicios/AsignarServiciosFormContent";

import {
  RiFilePdf2Line,
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileExcel2Line,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";

const ESTADOS_TERMINALES = ["pre-facturada", "validado", "facturada", "pagada"];
const ESTADOS_INICIALES = ["pendiente"]; // Para acciones como validar/rechazar
const ESTADOS_REVERTIBLES = ["validado", "rechazada"]; // Para la acción de reabrir

const ContratosConfig = {
  // Rutas de la API
  createPath: "/servicios-empresas",
  updatePath: "/servicios-empresas",
  resourcePath: "/servicios-empresas",
  deletePath: "/servicios-empresas",
  filtersPath: "/servicios-empresas/filters",
  detailPath: "/servicios-empresas/detalle",
  bulkUploadPath: "/servicios-empresas/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  //  Centralizamos los permisos del módulo aquí
  permissions: {
    view: ["admin", "cliente", "previley", "trabajador"],
    create: ["admin", "trabajador"],
    edit: ["admin", "editor", "trabajador"],
    delete: ["admin", "editor", "trabajador"],
  },

  // Información de UI
  title: "Contratos de Servicios",
  subtitle: "Administra los porcentajes de cobro por servicio para cada empresa.",

  // useInfiniteScroll: true, // Habilitar scroll infinito
  useInfiniteScroll: true,
  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    // {
    //   key: "empresaRut",
    //   type: "multiselect",
    //   field: "empresaRut",
    //   placeholder: "Empresa...",
    //   options: "empresaRut",
    //   // ⬆️ Debe coincidir con la propiedad en /filters
    //   // Si tu backend devuelve "empresas", usa "empresas"
    // },
   
    {
      key: "empresaRut",
      type: "text",
      field: "empresaRut",
      placeholder: "RUT empresa...",
      options: null, // text no necesita
    },
    {
      key: "servicioId",
      type: "multiselect",
      field: "servicioId",
      placeholder: "Servicio...",
      options: "servicioId",
    },


    
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["id", "servicioId"],

  // Columnas a formatear como moneda
  monetaryColumns: [], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["createdAt", "updatedAt"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [

        { header: "Contrato", accessorKey: "createdAt" },
    { header: "Actualizacion", accessorKey: "updatedAt" },
    // {
    //   header: "Anticipo",
    //   accessorKey: "montoAnticipo",
    // },
    



    // {
    //   header: "Acciones",
    //   accessorKey: "acciones",
    //   type: "actions",
    //   actions: [
    //     {
    //       id: "editar",
    //       icon: RiEditLine,
    //       label: "editar",
    //       iconClass: "text-blue-600",
    //       rolesAllowed: ["admin", "editor", "trabajador"],
 
    //     },
    //     {
    //       id: "eliminar",
    //       icon: RiDeleteBinLine,
    //       label: "Eliminar",
    //       iconClass: "text-red-600",
    //       rolesAllowed: ["admin", "editor", "trabajador"],
      
    //     },
    //   ],
    // },
  ],

  // Orden personalizado de las columnas
  columnOrder: ["gestionLicenciaId", "folio"],

  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  // Configuración de modales
  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Agregar/Editar Producción",
      content: AsignarServiciosEmpresasModal,
      rolesAllowed: ["trabajador", "admin"],
    },

    detalle: {
      component: GenericModal,
      title: "Detalle",
      content: LicenciaDetailsContent,
      rolesAllowed: ["admin", "trabajador", "editor"],
    },

    // rejectProduccion: {
    //   component: GenericModal,
    //   title: "Rechazar Producción",
    //   content: LicenciaForm,
    //   rolesAllowed: ["admin", "editor"],
    // },
  },

  actionsConfig: [
    {
      id: "nuevo",
      modalName: "crearEditar",
      buttonText: "Agregar / Editar",
      rolesAllowed: ["trabajador", "admin"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddLine", // más liviano que `Fill`
    },
  ],

  badgesConfig: {
    // estado de la licencia: coincide con accessorKey: "estadoLicencia"
    estadoLicencia: {
      type: "status",
      variants: {
        // contempla ambas variantes de casing por si el backend varía
        validado: "indigo",
        VALIDADO: "indigo",
        pendiente: "warning",
        PENDIENTE: "warning",
        rechazada: "error",
        RECHAZADA: "error",
        corregida: "info",
        CORREGIDA: "info",
        facturada: "success",
        FACTURADA: "success",
        TRAMITE: "info",
        tramite: "info",
        "pre-facturada": "orange",
        "PRE-FACTURADA": "orange",
      },
    },

    // montos: coincide con accessorKey

    montoDiferencia: {
      type: "value",
      variants: { positive: "success", negative: "error", neutral: "neutral" },
    },

    // si REALMENTE tienes una columna 'rol' visible en esta tabla, déjala;
    // si no, puedes quitarla sin afectar otros módulos.
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

export default ContratosConfig;
