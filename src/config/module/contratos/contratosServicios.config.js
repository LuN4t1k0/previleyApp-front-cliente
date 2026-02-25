
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import AsignarServiciosEmpresasModal from "@/components/modal/servicios/AsignarServiciosFormContent";


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
  excludeColumns: ["id", "servicioId","empresaId","createdAt","updatedAt","value"],

  // Columnas a formatear como moneda
  monetaryColumns: [], // Añade las columnas que necesites
  // Columnas a formatear como fecha
  dateColumns: ["createdAt", "updatedAt"], // Añade las columnas que necesites
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [

        { header: "Contrato", accessorKey: "createdAt" },
    { header: "Actualizacion", accessorKey: "updatedAt" },
   
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
