import BulkActions from "@/components/modal/BulkActions";
import BulkUploadModal from "@/components/modal/BulkUploadModal";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import LicenciaFormContent from "@/components/modal/LicenciaFormContent";
import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
import TestModal from "@/components/modal/TestModal";


const subsidiosConfig = {
  // Rutas de la API
  createPath: "/subsidios/crear",
  updatePath: "/subsidios/actualizar",
  resourcePath: "/subsidios/subsidios",
  deletePath: "/subsidios/eliminar",
  filtersPath: "/subsidios/filters",
  detailPath: "/licencias-medicas/detalle",
  bulkDeletePath: "/subsidios/bulk-delete",
  bulkUploadPath: "/subsidios/bulk-create",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Subsidios",
  subtitle: "Resumen de todos los subsidios registrados en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "filter1",
      type: "text",
      field: "folio",
      placeholder: "Buscar por folio...",
    },
    {
      key: "filter5",
      type: "text",
      field: "numeroDocumento",
      placeholder: "Buscar por documento...",
    },
    // {
    //   key: "filter2",
    //   type: "multiselect",
    //   field: "formaPago",
    //   placeholder: "Estado Licencia...",
    //   options: "filter2",
    // },
    // {
    //   key: "filter3",
    //   type: "multiselect",
    //   field: "empresaRut",
    //   placeholder: "Empresa Rut...",
    //   options: "filter3",
    // },
    {
      key: "filter4",
      type: "multiselect",
      field: "trabajadorRut",
      placeholder: "Trabajador Rut...",
      options: "filter4",
    },
    {
      key: "dateRange",
      type: "dateRange",
      dateField: "fechaDeposito",
      dateStartSuffix: "inicio",
      dateEndSuffix: "termino",
      placeholder: "Fecha de Depósito...",
      predefinedRanges: [
        // ... tus rangos predefinidos
      ],
    },
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: [
    "createdAt", "updatedAt", "id", "empleador", "empresaRut",
    "sucursal", "fechaOtorgamiento", "tipoLicencia", "telefonoTrabajador",
    "nombreProfesional", "rutProfesional", "direccionProfesional",
    "telefonoProfesional", "especialidad", "tipoReposo", "lugarReposo",
    "direccionReposo", 
    "nombreTrabajador",
    // "estadoLicencia", 
    "motivoAnulacion", "motivoRechazo",
    "motivoDevolucion", "fechaUltimaModificacion", "fechaRecepcion",
    "fechaPrimeraAfiliacion", "fechaContratoTrabajo", "profesionalRut",
    "sexoTrabajador", "edadTrabajador"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoDeposito", "subsidio"],

  // Columnas a formatear como fecha
  dateColumns: ["fechaDeposito" ], // Añade las columnas que necesites

  // Configuración de badges
  badgesConfig: {
    subsidio: {
      type: "value",
      variants: {
        positive: "success", // Mantener success
        negative: "error",   // Cambiar danger a error
        neutral: "neutral",  // Cambiar default a neutral
      },
    },
    estadoLicencia: {
      type: "status",
      variants: {
        "tramite": "warning",
        "Rechazado": "error",
        "Aprobado": "success",
        "Reducida": "warning", // Usar warning como aproximación
        "Pagada": "success",   // Usar success como aproximación
        "TRAMITADA POR EMPLEADOR PARA CCAF": "warning",
        "TRAMITADA POR EMPLEADOR": "warning",
        "EMITIDA POR PROFESIONAL":"success",


      },
    },
  },

  // Configuración de modales
  modalsConfig: {
    licenciaForm: {
      component: GenericModal,
      title: "Agregar/Editar Licencia",
      content: LicenciaFormContent,
      rolesAllowed: ["admin", "supervisor"],
    },
    licenciaDetails: {
      component: GenericModal,
      title: "Detalles de Licencia",
      content: LicenciaDetailsContent,
      rolesAllowed: ["admin", "supervisor", "previley", "editor"],
    },
    bulkUpload: {
      component: BulkUploadModal,
      rolesAllowed: ["admin", "supervisor"],
    },
    bulkActions: {
      component: BulkActions,
      rolesAllowed: ["admin", "supervisor", "editor"],
    },
    testModal: {
      component: TestModal,
      rolesAllowed: ["admin", "supervisor", "previley", "editor"],
    },
    selectWorker: {
      component: GenericModal,
      title: "Seleccionar Trabajador",
      content: SelectWorkerModal,
      rolesAllowed: ["admin", "supervisor", "previley", "editor"],
    }
  },
  actionsConfig: [
    {
      id: "nuevo",
      modalName: "licenciaForm",
      buttonText: "",
      rolesAllowed: ["admin", "supervisor"],
      actionType: "create",
      color: "blue",
      icon: "RiFileAddFill",
    },
    {
      id: "bullUpload",
      modalName: "bulkUpload",
      buttonText: "",
      rolesAllowed: ["admin", "supervisor"],
      actionType: "bulkUpload",
      color: "yellow",
      icon: "RiFileUploadFill",
    },
    {
      id: "pdf",
      modalName: "exportarPDF",
      buttonText: "",
      rolesAllowed: ["admin", "supervisor", "previley", "cliente"],
      actionType: "exportPDF",
      color: "red",
      icon: "RiFilePdf2Fill",
    },
    {
      id: "excel",
      modalName: "exportarExcel",
      buttonText: "",
      rolesAllowed: ["admin", "supervisor", "previley", "cliente"],
      actionType: "exportExcel",
      color: "green",
      icon: "RiFileExcel2Fill",
    }
  ],
};

export default subsidiosConfig;
