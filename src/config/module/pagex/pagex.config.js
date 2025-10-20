import CargaMasivaRealtime from "@/components/forms/CargaMasivaRealtime";
import GenericModal from "@/components/modal/GenericModal";

import MoraPresuntaFormModal from "@/components/modal/moraPresunta/MoraPresuntaFormModal";
import ResumenEmpresaModal from "@/components/modal/moraPresunta/ResumenEmpresaModal";
import ResumenTrabajadorModal from "@/components/modal/moraPresunta/ResumenTrabajadorModal";
import PagexDetalleModal from "@/components/modal/pagex/GestionPagexDetalleModal";
import GestionPagexDetalleModal from "@/components/modal/pagex/GestionPagexDetalleModal";
import GestionPagexFormModal from "@/components/modal/pagex/PagexFormModal";

import {
  RiFilePdf2Line,
  RiUpload2Line,
  RiLockLine,
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
} from "@remixicon/react";

const PagexConfig = {
  // Rutas de la API
  createPath: "/gestion-pagex",
  updatePath: "/gestion-pagex",
  resourcePath: "/gestion-pagex",
  deletePath: "/gestion-pagex",
  filtersPath: "/gestion-pagex/filters",
  detailPath: "/gestion-pagex/detalle",
  bulkUploadPath: "/detalle-pagex/bulk",
  bulkUploadParentIdField: "pagexId",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Pagos en excesos",
  subtitle: "Resumen de todas gestiones de pagos en exceso en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta

  filters: [
    {
    key: "folioInterno",
    type: "text",
    field: "folioInterno",
    placeholder: "Folio interno",
  },
  {
    key: "estado",
    type: "multiselect",
    field: "estado",
    placeholder: "Estado de gestión",
    optionsSource: "estado", // viene del backend
  },
  {
    key: "entidadId",
    type: "multiselect",
    field: "entidadId",
    placeholder: "Entidad",
    optionsSource: "entidades", // backend debe enviar entidades disponibles
  },
  {
  key: "fechaGestion",               
  field: "fechaGestion",             
  type: "dateRange",                 
}
  ],

  // Orden personalizado de las columnas
  columnOrder: [
    "empresaRut",
    "folioInterno",
    "createdAt",
    "periodoInicio",
    "periodoTermino",
    "entidad",
    "folio",
    "montoSolicitado",
    "montoRecibido",
    "fechaPago",
    "comprobantePago",
    "analista",
    "estado",
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["entidadId", "userId", "empresa", "id", "updatedAt"],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoSolicitado","montoRecibido"], 
  periodoColumns: ["periodoInicio", "periodoTermino"],
  dateColumns: ["createdAt", "updatedAt","fechaPago","fechaGestion"], 
  revisarFechaVencimiento: [],
 
  columnsConfig: [
    { header: "Folio", accessorKey: "folio" },
    { header: "Solicitado", accessorKey: "montoSolicitado" },
    { header: "Recibido", accessorKey: "montoRecibido" },
    { header: "fecha gestion", accessorKey: "createdAt" },
    { header: "inicio", accessorKey: "periodoInicio" },
    { header: "termino", accessorKey: "periodoTermino" },
    { header: "Empresa", accessorKey: "empresaRut" },
    { header: "fecha Pago", accessorKey: "fechaPago" },
    {header: "Analista", accessorKey: "analista" , rolesAllowed: ["admin"]},

    {
      header: "Comprobante",
      accessorKey: "comprobantePago",
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
          id: "editar",
          icon: RiEditLine,
          label: "Editar",
          iconClass: "text-blue-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
          visibleWhen: (row) => ["sin folio", "analisis"].includes(row.estado),
        },
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
          visibleWhen: (row) => ["sin folio", "analisis"].includes(row.estado),
        },
        {
          id: "cargarArchivo",
          icon: RiUpload2Line,
          label: "Cargar",
          iconClass: "text-blue-500",
          rolesAllowed: ["admin", "trabajador"],
          // visibleWhen: (row) => row.estado === "analisis",
          visibleWhen: (row) => ["sin folio", "analisis"].includes(row.estado),
        },
        {
          id: "cerrarGestion",
          icon: RiLockLine,
          label: "Cerrar",
          iconClass: "text-green-600",
          rolesAllowed: ["admin", "trabajador"],
          visibleWhen: (row) => !["sin folio", "cerrada" ].includes(row.estado),
        },
        {
          id: "reabrirGestion",
          icon: RiLockUnlockLine,
          label: "Reabrir",
          iconClass: "text-yellow-500",
          rolesAllowed: ["admin", "trabajador"],
          // visibleWhen: (row) => row.estado === "cerrada",
          visibleWhen: (row) => ["cerrada"].includes(row.estado),
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
    moraPresuntaForm: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: GestionPagexFormModal,
      rolesAllowed: ["admin", "trabajador"],
    },
detalleGestionModal: {
  component: GenericModal,
  title: "Detalle de Gestión Pagex",
  content: PagexDetalleModal,
  rolesAllowed: ["admin", "trabajador", "editor", "cliente"],
},
    resumenEmpresa: {
      component: GenericModal,
      title: "",
      content: ResumenEmpresaModal,
      rolesAllowed: ["admin", "cliente", "trabajador"],
    },
    bulkUpload: {
      component: GenericModal,
      title: "Cargar Archivo",
      content: CargaMasivaRealtime,
      rolesAllowed: ["trabajador", "admin"],
    },

    detalleTrabajador: {
      component: GenericModal,
      title: "",
      content: ResumenTrabajadorModal,
      rolesAllowed: ["admin", "trabajador", "editor"],
    },
  },
  actionsConfig: [
    {
      id: "nuevo",
      modalName: "licenciaForm",
      buttonText: "",
      rolesAllowed: ["admin", "trabajador"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddFill",
    },

    {
      id: "viewResumenTrabajador",
      modalName: "resumenTrabajador",
      buttonText: "",
      rolesAllowed: ["admin", "trabajador", "cliente"],
      actionType: "viewResumenTrabajador",
      color: "purple",
      icon: "RiUserSearchLine",
    },

    {
      id: "excelEmpresa",
      modalName: "resumenEmpresa",
      buttonText: "",
      rolesAllowed: ["admin", "trabajador", "cliente"],
      actionType: "viewResumenEmpresa",
      color: "green",
      icon: "RiFileExcel2Fill",
    },
  ],
};

export default PagexConfig;
