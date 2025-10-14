import GenericModal from "@/components/modal/GenericModal";
import CargaMasivaRealtime from "@/components/forms/CargaMasivaRealtime";

import GestionMoraDetalleModal from "@/components/modal/moraPresunta/GestionMoraDetalleModal";

import MoraPresuntaFormModal from "@/components/modal/moraPresunta/MoraPresuntaFormModal";
import ResumenEmpresaModal from "@/components/modal/moraPresunta/ResumenEmpresaModal";
import ResumenTrabajadorModal from "@/components/modal/moraPresunta/ResumenTrabajadorModal";

import TestModal from "@/components/modal/TestModal";

import { RiUpload2Line, RiDeleteBinLine } from "@remixicon/react";

const MoraPresuntaDetalleConfig = {
  // Rutas de la API
  createPath: "/detalle-mora",
  updatePath: "/detalle-mora",
  resourcePath: "/detalle-mora",
  deletePath: "/detalle-mora",
  filtersPath: "/detalle-mora/filters",
  detailPath: "/detalle-mora/gestion",
  bulkUploadPath: "/detalle-mora/bulk",
  bulkUploadParentIdField: "gestionMoraId",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}/detalles`,

  // Información de UI
  title: "Todas las Producciones",
  subtitle: "Resumen de todas las Producciones registradas en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta
  useInfiniteScroll: true,  
  filters: [
    {
      key: "trabajadorRut",
      type: "text",
      field: "trabajadorRut",
      placeholder: "Buscar por Rut...",
    },
    {
      key: "folio",
      type: "text",
      field: "folio",
      placeholder: "Buscar por Gestion...",
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

    { key: "gestionFecha", type: "dateRange", field: "fechaGestion" },
  ],

  // Orden personalizado de las columnas
  columnOrder: [],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: [
    "createdAt",
    "updatedAt",
    "gestionMoraId",
    "id",
    "gestionMoraOriginalId",
    "entidadId",
    "produccionId",
    "esComplementoDeId",
    "estadoDeudaPrevired",
    "incluidoEnProduccion",
    "observaciones",
    "gestionEstado",
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoActualizado"], // Añade las columnas que necesites

  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    { header: "Monto", accessorKey: "montoActualizado" },
    { header: "Periodo", accessorKey: "periodoPago" },

    { header: "Folio", accessorKey: "gestionFolio" },
    { header: "fecha", accessorKey: "gestionFecha" },
    { header: "Entidad", accessorKey: "entidadNombre" },

    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        // {
        //   id: "editar",
        //   icon: RiEditLine,
        //   label: "Editar",
        //   iconClass: "text-blue-600",
        //   rolesAllowed: ["admin", "editor", "trabajador"],
        // },
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
        completado: "success",
        pendiente: "warning",
        rechazada: "error",
      },
    },
    tipoGestion: {
      type: "status",
      variants: {
        regularizado: "success",
        pagado: "success",
        "pago requerido": "warning",
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

    testModal: {
      component: TestModal,
      rolesAllowed: ["admin", "previley", "editor"],
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
      id: "bullUpload",
      modalName: "bulkUpload",
      buttonText: "",
      rolesAllowed: ["admin"],
      actionType: "bulkUpload",
      color: "yellow",
      icon: "RiFileUploadFill",
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


  ],
};

export default MoraPresuntaDetalleConfig;
