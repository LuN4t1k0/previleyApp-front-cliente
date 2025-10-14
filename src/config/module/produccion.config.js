import GenericModal from "@/components/modal/GenericModal";

import ProduccionFormContent from "@/components/modal/producciones/ProduccionFormContent";
import RejectProduccionContent from "@/components/modal/producciones/RejectProduccionContent";

import {
  RiFilePdf2Line,
  RiLockUnlockLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileExcel2Line,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";

const ProduccionConfig = {
  // Rutas de la API
  createPath: "/produccion/",
  updatePath: "/produccion",
  resourcePath: "/produccion/",
  deletePath: "/produccion/",
  filtersPath: "/produccion/filters",
  detailPath: "/produccion/detalle/",
  bulkUploadPath: "/produccion/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Producciones",
  subtitle: "Administra las producciones generadas por los analistas.",

  // useInfiniteScroll: true, // Habilitar scroll infinito
  useInfiniteScroll: true,
  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "empresaRut",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa...",
      options: "empresas", // backend: empresas: ["76.111.111-1", ...]
    },
    {
      key: "servicioId",
      type: "multiselect",
      field: "servicioId",
      placeholder: "Servicio...",
      options: "servicios", // backend: servicios: [{ value, label }]
    },
    {
      key: "estado",
      type: "multiselect",
      field: "estado",
      placeholder: "Estado...",
      options: "estados", // debe coincidir con la clave que entrega el backend
    },
    {
      key: "trabajadorId",
      type: "multiselect",
      field: "trabajadorId",
      placeholder: "Trabajador...",
      options: "trabajadores", // backend: trabajadores: [{ value, label }]
    },
    {
      key: "fechaProduccion",
      type: "dateRange",
      field: "fechaProduccion",
      placeholder: "Rango de fecha...",
    },
  ],
  // Orden personalizado de las columnas
  columnOrder: [
  
    "empresaRut",
    "id",
    "servicio",
    "entidad",
    "certificadoInicial",
    "certificadoFinal",
    "detalle",
    "montoRegularizado",
    "fechaProduccion",
    "estado",
    "analista",
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: [
    
    "servicioId",
    "trabajadorId",
    "entidadId",
    "motivoRechazo",
    "comentarioCorreccion",
    "empresa"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoRegularizado"], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaProduccion"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Monto",
      accessorKey: "montoRegularizado",
      sortable: true,
    },

     {
      header: "Folio",
      accessorKey: "id",
      sortable: true,
    },

    {
      header: "Analista",
      accessorKey: "trabajador",
      rolesAllowed: ["admin"], // solo admins
    },
    {
      header: "Certificado Inicial",
      accessorKey: "certificadoInicial",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },
    {
      header: "Certificado Final",
      accessorKey: "certificadoFinal",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },
    {
      header: "Detalle",
      accessorKey: "detalle",
      type: "link", // Enlace
      Icono: RiFileExcel2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-green-500", // Clases para el ícono
    },

    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "validarProduccion",
          icon: RiCheckLine,
          label: "Validar",
          iconClass: "text-green-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado === "pendiente",
        },
        {
          id: "rechazarProduccion",
          icon: RiCloseLine,
          label: "Rechazar",
          iconClass: "text-red-500",
          rolesAllowed: ["admin"],
          // visibleWhen: (row) =>
          //   row.estado === "analisis" || row.estado === "pendiente",
          visibleWhen: (rowData) => rowData.estado === "pendiente",
        },
        {
          id: "revertirProduccion",
          icon: RiLockUnlockLine,
          label: "Reabrir",
          iconClass: "text-yellow-500",
          rolesAllowed: ["admin"],
          // visibleWhen: (rowData) => rowData.estado !== "pendiente" ,
          visibleWhen: (rowData) =>
            // !["pendiente", "pre-facturada","facturada",""].includes(rowData.estado),
          ["validado","rechazada"].includes(rowData.estado),
        },
        {
          id: "editar",
          icon: RiEditLine,
          label: "Validar",
          iconClass: "text-blue-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
          visibleWhen: (rowData) =>
            // !["pre-facturada", "validado", "facturada"].includes(rowData.estado),
           ["pendiente","rechazada"].includes(rowData.estado),
        },
        {
          id: "eliminar",
          icon: RiDeleteBinLine,
          label: "Eliminar",
          iconClass: "text-red-600",
          rolesAllowed: ["admin", "editor", "trabajador"],
          visibleWhen: (rowData) =>
            // !["pre-facturada", "validado", "facturada"].includes(rowData.estado),
          ["pendiente"].includes(rowData.estado),
        },
      ],
    },
  ],

  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  // Configuración de modales
  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: ProduccionFormContent,
      rolesAllowed: ["trabajador", "admin"],
    },

    rejectProduccion: {
      component: GenericModal,
      title: "Rechazar Producción",
      content: RejectProduccionContent,
      rolesAllowed: ["admin", "editor"],
    },
  },

  actionsConfig: [
    {
      id: "nuevo",
      modalName: "crearEditar",
      buttonText: "Nuevo",
      rolesAllowed: ["trabajador", "admin"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddLine", // más liviano que `Fill`
    },
  ],

  badgesConfig: {
    estado: {
      type: "status",
      variants: {
        validado: "indigo",
        pendiente: "warning",
        rechazada: "error",
        corregida: "info",
        facturada: "success",
        "pre-facturada": "orange",
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

export default ProduccionConfig;
