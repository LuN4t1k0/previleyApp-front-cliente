import GenericModal from "@/components/modal/GenericModal";
import VisitaGestionFormModal from "@/components/modal/visitas/VisitaGestionFormModal";
import VisitaDetalleBulkModal from "@/components/modal/visitas/VisitaDetalleBulkModal";
import VisitaDetalleFormModal from "@/components/modal/visitas/VisitaDetalleFormModal";
import GestionVisitaDetalleModal from "@/components/modal/visitas/GestionVisitaDetalleModal";
import {
  RiAddLine,
  RiDownload2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiUploadCloudLine,
  RiEyeLine,
  RiLockLine,
  RiLockUnlockLine,
} from "@remixicon/react";

const GestionVisitaConfig = {
  createPath: "/gestion-visita",
  updatePath: "/gestion-visita",
  resourcePath: "/gestion-visita",
  deletePath: "/gestion-visita",
  filtersPath: "/gestion-visita/filters",
  detailPath: "/gestion-visita",
  buildDetailEndpoint: null,

  title: "Gestión de visitas",
  subtitle: "Administra las planificaciones y asignaciones de visitas domiciliarias.",
  useInfiniteScroll: false,

  filters: [
    {
      key: "folio",
      type: "text",
      placeholder: "Buscar por folio",
    },
    {
      key: "empresaRut",
      type: "multiselect",
      placeholder: "Empresas",
    },
    {
      key: "estado",
      type: "multiselect",
      placeholder: "Estado",
    },
    {
      key: "fecha",
      type: "dateRange",
      placeholder: "Fecha gestión",
    },
  ],

  excludeColumns: [
    "id",
    "servicioId",
    "userId",
    "archivoPlanificacion",
    "archivoCierre",
    "certificadoInicial",
    "certificadoFinal",
    "analista",
    "empresa",
    "detalles",
    "observaciones",
    "createdAt",
    "updatedAt",
  ],

  monetaryColumns: ["tarifaVisita"],
  dateColumns: ["fechaGestion", "fechaCierre"],
  percentageColumns: [],
  periodoColumns: [],

  columnsConfig: [
    { header: "Folio", accessorKey: "folio" },
    { header: "Empresa", accessorKey: "empresaRut" },
    { header: "Estado", accessorKey: "estado" },
    { header: "Planificadas", accessorKey: "totalPlanificadas" },
    { header: "Realizadas", accessorKey: "totalRealizadas" },
    {
      header: "Progreso",
      accessorKey: "progresoLabel",
      meta: { align: "text-center" },
    },
    { header: "Tarifa", accessorKey: "tarifaVisita" },
    { header: "Gestión", accessorKey: "fechaGestion" },
    { header: "Cierre", accessorKey: "fechaCierre" },
    {
      header: "Planificación",
      accessorKey: "archivoPlanificacionSignedUrl",
      type: "link",
      Icono: RiDownload2Line,
      label: "Descargar",
    },
    {
      header: "Archivo cierre",
      accessorKey: "archivoCierreSignedUrl",
      type: "link",
      Icono: RiDownload2Line,
      label: "Descargar",
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
          rolesAllowed: ["admin", "supervisor", "trabajador"],
        },
        {
          id: "importar",
          icon: RiUploadCloudLine,
          label: "Importar visitas",
          iconClass: "text-purple-600",
          rolesAllowed: ["admin", "supervisor", "trabajador"],
        },
        {
          id: "verDetalle",
          icon: RiEyeLine,
          label: "Ver detalle",
          iconClass: "text-emerald-600",
          rolesAllowed: ["admin", "supervisor", "trabajador", "cliente"],
        },
        {
          id: "cerrarGestion",
          icon: RiLockLine,
          label: "Cerrar",
          iconClass: "text-green-600",
          rolesAllowed: ["admin", "supervisor", "trabajador"],
          visibleWhen: (row) =>
            row.estado !== "cerrada" &&
            row.totalPlanificadas > 0 &&
            row.totalPlanificadas === row.totalRealizadas,
        },
        {
          id: "reabrirGestion",
          icon: RiLockUnlockLine,
          label: "Reabrir",
          iconClass: "text-yellow-600",
          rolesAllowed: ["admin", "supervisor"],
          visibleWhen: (row) => row.estado === "cerrada",
        },
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "supervisor"],
        },
      ],
    },
  ],

  columnOrder: [
    "folio",
    "empresaRut",
    "estado",
    "totalPlanificadas",
    "totalRealizadas",
    "progresoLabel",
    "tarifaVisita",
    "fechaGestion",
    "fechaCierre",
    "archivoPlanificacionSignedUrl",
    "archivoCierreSignedUrl",
  ],

  badgesConfig: {
    estado: {
      type: "status",
      variants: {
        planificada: "indigo",
        en_proceso: "warning",
        cerrada: "success",
        cancelada: "error",
      },
      textTransform: "capitalize",
    },
  },

  actionsConfig: [
    {
      id: "nueva-gestion",
      modalName: "visitaGestionForm",
      buttonText: "Nueva gestión",
      rolesAllowed: ["admin", "supervisor", "trabajador"],
      actionType: "create",
      color: "blue",
      icon: "RiAddLine",
    },
  ],

  modalsConfig: {
    visitaGestionForm: {
      component: GenericModal,
      title: "Gestión de visitas",
      content: VisitaGestionFormModal,
      rolesAllowed: ["admin", "supervisor", "trabajador"],
    },
    visitaGestionDetalle: {
      component: GenericModal,
      title: "Detalle de gestión",
      content: GestionVisitaDetalleModal,
      rolesAllowed: ["admin", "supervisor", "trabajador", "cliente"],
    },
    visitaDetalleImport: {
      component: GenericModal,
      title: "Importar visitas",
      content: VisitaDetalleBulkModal,
      rolesAllowed: ["admin", "supervisor", "trabajador"],
    },
    visitaDetalleForm: {
      component: GenericModal,
      title: "Actualizar visita",
      content: VisitaDetalleFormModal,
      rolesAllowed: ["admin", "supervisor", "trabajador"],
    },
  },
};

export default GestionVisitaConfig;
