// NUEVO:
import AnticiposForm from "@/components/forms/AnticiposForm";

import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";

import {

  RiDeleteBinLine,
  RiEditLine,

} from "@remixicon/react";

const ESTADOS_TERMINALES = ["pre-facturada", "validado", "facturada", "pagada"];
const ESTADOS_INICIALES = ["pendiente"]; // Para acciones como validar/rechazar
const ESTADOS_REVERTIBLES = ["validado", "rechazada"]; // Para la acción de reabrir

const AnticiposConfig = {
  // Rutas de la API
  createPath: "/anticipos",
  updatePath: "/anticipos",
  resourcePath: "/anticipos",
  deletePath: "/anticipos",
  filtersPath: "/anticipos/filters",
  detailPath: "/anticipos/detalle",
  bulkUploadPath: "/anticipos/bulk-create",
  bulkUploadParentIdField: null, // o "usuarioId" si aplica
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  //  Centralizamos los permisos del módulo aquí
  permissions: {
    view: ["admin", "cliente", "trabajador"],
    create: ["admin", "trabajador"],
    edit: ["admin", "editor", "trabajador"],
    delete: ["admin", "editor", "trabajador"],
  },

  // Información de UI
  title: "Anticipos",
  subtitle: "Administra los anticipos.",

  // useInfiniteScroll: true, // Habilitar scroll infinito
  useInfiniteScroll: true,
  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "empresaRut",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa...",
      options: "empresaRut",
      // ⬆️ Debe coincidir con la propiedad en /filters
      // Si tu backend devuelve "empresas", usa "empresas"
    },
    {
      key: "folio",
      type: "text",
      field: "folio",
      placeholder: "Folio...",
      options: null, // text no necesita
    },

{
      key: "trabajadorRut",
      type: "text",
      field: "trabajadorRut",
      placeholder: "RUT trabajador...",
      options: null,
    },
    
    
   
    
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: ["createdAt", "updatedAt", "id", "produccionId", "fechaProceso","gestionLicenciaId"],

  // Columnas a formatear como moneda
  monetaryColumns: ["anticipo"], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["fechaAnticipo"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Gestion",
      accessorKey: "gestionLicenciaId",
    },
    {
      header: "Folio",
      accessorKey: "folio",
    },
    {
      header: "Fecha Anticipo",
      accessorKey: "fechaAnticipo",
    },
    {
      header: "Monto Anticipo",
      accessorKey: "anticipo",
    },
    {
      header: "Observaciones",
      accessorKey: "observaciones",
    },

    {
      header: "Acciones",
      accessorKey: "acciones",
      type: "actions",
      actions: [
        {
          id: "editar",
          icon: RiEditLine,
          label: "editar",
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

  // Orden personalizado de las columnas
  columnOrder: ["gestionLicenciaId", "folio"],

  // revisarFechaVencimiento
  revisarFechaVencimiento: [],

  // Configuración de modales
  modalsConfig: {
    crearEditar: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: AnticiposForm,
      rolesAllowed: ["trabajador", "admin"],
    },

    detalle: {
      component: GenericModal,
      title: "Detalle",
      content: LicenciaDetailsContent,
      rolesAllowed: ["admin", "trabajador", "editor"],
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
    // estado de la licencia: coincide con accessorKey: "estadoLicencia"
    estadoLicencia: {
      type: "status",
      variants: {
      
      },
    },


  },
};

export default AnticiposConfig;
