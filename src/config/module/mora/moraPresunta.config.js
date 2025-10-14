import GenericModal from "@/components/modal/GenericModal";
import CargaMasivaRealtime from "@/components/forms/CargaMasivaRealtime";

import GestionMoraDetalleModal from "@/components/modal/moraPresunta/GestionMoraDetalleModal";

import MoraPresuntaFormModal from "@/components/modal/moraPresunta/MoraPresuntaFormModal";
import ResumenEmpresaModal from "@/components/modal/moraPresunta/ResumenEmpresaModal";
import ResumenTrabajadorModal from "@/components/modal/moraPresunta/ResumenTrabajadorModal";

import {
  RiFilePdf2Line,
  RiFileExcel2Fill,
  RiUpload2Line,
  RiLockLine,
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
} from "@remixicon/react";

const MoraPresuntaConfig = {
  // Rutas de la API
  createPath: "/gestion-mora",
  updatePath: "/gestion-mora",
  resourcePath: "/gestion-mora",
  deletePath: "/gestion-mora",
  filtersPath: "/gestion-mora/filters",
  detailPath: "/detalle-mora/gestion",
  bulkUploadPath: "/detalle-mora/bulk",
  bulkUploadParentIdField: "gestionMoraId",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}/detalles`,

  // Información de UI
  title: "Todas las Producciones",
  subtitle: "Resumen de todas las Producciones registradas en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta

  filters: [
    {
      key: "folio",
      type: "text",
      field: "folio",
      placeholder: "Buscar por folio...",
    },
    {
      key: "estado",
      type: "multiselect",
      field: "estado",
      placeholder: "Estado...",
      options: "estadoOptions",
    },
    {
      key: "empresaRut",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa...",
      options: "empresaRut", // 🟢 cambiar esto
    },
    {
      key: "entidadId",
      type: "multiselect",
      field: "entidadId",
      placeholder: "Entidad...",
      options: "entidades",
    },
    {
      key: "fechaGestion",
      type: "dateRange",
      field: "fechaGestion",
      placeholder: "Fecha de Gestión...",
    },
    {
      key: "fechaPago",
      type: "dateRange",
      field: "fechaPago",
      placeholder: "Fecha de Pago...",
    },
  ],

  // Orden personalizado de las columnas
  columnOrder: [
    "prioridadRanking",
    "prioridadNivel",
    "folio",
    "empresaRut",
    "entidad",
    "fechaGestion",
    "deudaPendiente",
    "casosJudiciales",
    "montoJudicial",
    "casosNoJudiciales",
    "montoNoJudicial",
    "certificadoInicial",
    "certificadoFinal",
    "montoRegularizado",
    "montoPago",
    "comprobantePago",
    "fechaPago",
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["createdAt", "updatedAt", "id", "entidadId", "empresa"],

  // Columnas a formatear como moneda
  monetaryColumns: [
    "montoPago",
    "montoRegularizado",
    "deudaPendiente",
    "montoJudicial",
    "montoNoJudicial",
  ],

  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    { header: "Regularizado", accessorKey: "montoRegularizado" },
    { header: "Pagado", accessorKey: "montoPago" },
    { header: "Gestion", accessorKey: "fechaGestion" },
    {
      header: "Prioridad",
      accessorKey: "prioridadRanking",
      meta: { align: "text-center" },
    },
    {
      header: "Nivel riesgo",
      accessorKey: "prioridadNivel",
      meta: { align: "text-center" },
    },
    {
      header: "Deuda pendiente",
      accessorKey: "deudaPendiente",
      meta: { align: "text-right" },
    },
    {
      header: "Casos judiciales",
      accessorKey: "casosJudiciales",
      meta: { align: "text-right" },
    },
    {
      header: "Monto judicial",
      accessorKey: "montoJudicial",
      meta: { align: "text-right" },
    },
    {
      header: "Casos no judiciales",
      accessorKey: "casosNoJudiciales",
      meta: { align: "text-right" },
    },
    {
      header: "Monto no judicial",
      accessorKey: "montoNoJudicial",
      meta: { align: "text-right" },
    },
    {
      header: "Analista",
      accessorKey: "analista",
      rolesAllowed: ["admin"], // solo admins
    },
    {
      header: "Comprobante",
      accessorKey: "comprobantePago",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },

    {
      header: "Certificado",
      accessorKey: "certificadoInicial",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },
    {
      header: "Certificado 2",
      accessorKey: "certificadoFinal",
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
        },
        {
          id: "exportarExcelGestion",
          icon: RiFileExcel2Fill,
          label: "Exportar Excel",
          iconClass: "text-green-600",
          rolesAllowed: ["admin", "trabajador", "cliente"],
        },
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
        },
        {
          id: "cargarArchivo",
          icon: RiUpload2Line,
          label: "Cargar",
          iconClass: "text-blue-500",
          rolesAllowed: ["admin", "trabajador"],
          visibleWhen: (row) => row.estado === "analisis",
        },
        {
          id: "cerrarGestion",
          icon: RiLockLine,
          label: "Cerrar",
          iconClass: "text-green-600",
          rolesAllowed: ["admin", "trabajador"],
          visibleWhen: (row) =>
            row.estado === "analisis" || row.estado === "pendiente",
        },
        {
          id: "reabrirGestion",
          icon: RiLockUnlockLine,
          label: "Reabrir",
          iconClass: "text-yellow-500",
          rolesAllowed: ["admin","trabajador"],
          // visibleWhen: (row) => row.estado === "cerrada",
          visibleWhen: (row) => ["cerrada", "rechazada"].includes(row.estado)
        },
      ],
    },

    //   ],
    //   meta: {
    //     align: "text-center", // opcional, para centrar
    //   },
    // },
  ],

  // Columnas a formatear como fecha
  dateColumns: [], // Añade las columnas que necesites
// revisarFechaVencimiento
  revisarFechaVencimiento: [],

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
    prioridadNivel: {
      type: "status",
      variants: {
        alto: "red",
        medio: "orange",
        bajo: "green",
        "sin prioridad": "gray",
      },
    },
  },

  // Configuración de modales
  modalsConfig: {
    moraPresuntaForm: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: MoraPresuntaFormModal,
      rolesAllowed: ["admin", "trabajador"],
    },
    detalleGestionModal: {
      component: GenericModal,
      title: "Detalles de Licencia",
      content: GestionMoraDetalleModal,
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

export default MoraPresuntaConfig;
