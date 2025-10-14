import GenericModal from "@/components/modal/GenericModal";
import VisitaDetalleFormModal from "@/components/modal/visitas/VisitaDetalleFormModal";
import {
  RiEditLine,
  RiDeleteBinLine,
  RiImageLine,
} from "@remixicon/react";

const DetalleVisitaConfig = {
  createPath: "/detalle-visita",
  updatePath: "/detalle-visita",
  resourcePath: "/detalle-visita",
  deletePath: "/detalle-visita",
  filtersPath: "/detalle-visita/filters",
  detailPath: null,
  buildDetailEndpoint: null,

  title: "Detalle de visitas",
  subtitle: "Visualiza y actualiza el estado de cada visita asignada.",
  useInfiniteScroll: false,

  filters: [
    {
      key: "search",
      type: "text",
      placeholder: "Buscar trabajador o visitador",
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
      key: "fechaProgramada",
      type: "dateRange",
      placeholder: "Fecha programada",
    },
  ],

  excludeColumns: [
    "id",
    "gestionVisitaId",
    "empresaRut",
    "visitadorId",
    "evidenciaUrl",
    "resultadoRegistradoPor",
    "resultadoRegistradoEn",
    "createdAt",
    "updatedAt",
  ],

  monetaryColumns: ["costoVisita"],
  dateColumns: ["fechaProgramada", "fechaVisita"],

  columnsConfig: [
    { header: "Trabajador", accessorKey: "nombreTrabajador" },
    { header: "Apellidos", accessorKey: "apellidoTrabajador" },
    { header: "RUT", accessorKey: "rutTrabajador" },
    { header: "Ciudad", accessorKey: "ciudad" },
    { header: "Visitador", accessorKey: "nombreVisitador" },
    { header: "Estado", accessorKey: "estado" },
    { header: "Programada", accessorKey: "fechaProgramada" },
    { header: "Visita", accessorKey: "fechaVisita" },
    { header: "Costo", accessorKey: "costoVisita" },
    {
      header: "Evidencia",
      accessorKey: "evidenciaSignedUrl",
      type: "link",
      Icono: RiImageLine,
      label: "Ver",
    },
    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "editar",
          icon: RiEditLine,
          label: "Actualizar",
          iconClass: "text-blue-600",
          rolesAllowed: ["admin", "supervisor", "trabajador"],
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
    "nombreTrabajador",
    "apellidoTrabajador",
    "rutTrabajador",
    "ciudad",
    "nombreVisitador",
    "estado",
    "fechaProgramada",
    "fechaVisita",
    "costoVisita",
    "evidenciaSignedUrl",
  ],

  badgesConfig: {
    estado: {
      type: "status",
      variants: {
        pendiente: "neutral",
        en_proceso: "warning",
        realizada: "success",
        completada: "success",
        cerrada: "success",
        no_localizado: "error",
        cancelada: "error",
      },
      textTransform: "capitalize",
    },
  },

  actionsConfig: [],

  modalsConfig: {
    visitaDetalleForm: {
      component: GenericModal,
      title: "Actualizar visita",
      content: VisitaDetalleFormModal,
      rolesAllowed: ["admin", "supervisor", "trabajador"],
    },
  },
};

export default DetalleVisitaConfig;
