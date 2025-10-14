import BulkActions from "@/components/modal/BulkActions";
import BulkUploadModal from "@/components/modal/BulkUploadModal";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import LicenciaFormContent from "@/components/modal/LicenciaFormContent";
import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
import TestModal from "@/components/modal/TestModal";


const anticiposConfig = {
  // Rutas de la API
  createPath: "/anticipos/crear",
  updatePath: "/anticipos/actualizar",
  resourcePath: "/anticipos/anticipos",
  deletePath: "/anticipos/eliminar",
  filtersPath: "/anticipos/filters",
  detailPath: "/licencias-medicas/detalle",
  bulkDeletePath: "/anticipos/bulk-delete",
  bulkUploadPath: "/anticipos/bulk-create",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Todas las Licencias Médicas",
  subtitle: "Resumen de todas las licencias médicas registradas en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "filter1",
      type: "text",
      field: "folio",
      placeholder: "Buscar por folio...",
    },
    // {
    //   key: "filter2",
    //   type: "multiselect",
    //   field: "estadoLicencia",
    //   placeholder: "Estado Licencia...",
    //   options: "filter2",
    // },
    {
      key: "filter3",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa Rut...",
      options: "filter3",
    },
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
      dateField: "fechaAnticipo",
      dateStartSuffix: "Inicio",
      dateEndSuffix: "Fin",
      placeholder: "Fecha de Depósito...",
      predefinedRanges: [
        // ... tus rangos predefinidos
      ],
    },
  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: [
    "createdAt",
    "updatedAt",
    "id"
 
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["anticipo"],

  dateColumns: ["fechaAnticipo"], // Añade las columnas que necesites

  // Configuración de badges
  badgesConfig: {
    anticipo: {
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

export default anticiposConfig;
