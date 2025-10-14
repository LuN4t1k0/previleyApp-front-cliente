import BulkActions from "@/components/modal/BulkActions";
import BulkUploadModal from "@/components/modal/BulkUploadModal";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import LicenciaFormContent from "@/components/modal/LicenciaFormContent";
import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
import TestModal from "@/components/modal/TestModal";
import { create, update } from "lodash";

const demoConfig = {
  // Rutas de la API
  createPath: "/licencias-medicas/crear",
  updatePath: "/licencias-medicas/actualizar",
  resourcePath: "/licencias-medicas/licencias",
  deletePath: "/licencias-medicas/eliminar",
  filtersPath: "/licencias-medicas/filters",
  detailPath: "/licencias-medicas/detalle",
  bulkDeletePath: "/licencias-medicas/bulk-delete",
  bulkUploadPath: "/licencias-medicas/bulk-create",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Todas las Licencias Médicas",
  subtitle: "Resumen de todas las licencias médicas registradas en Previley.",

  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "filter1",
      type: "text",
      field: "folio",
      placeholder: "Buscar por folio...",
    },
    {
      key: "filter2",
      type: "multiselect",
      field: "estadoLicencia",
      placeholder: "Estado Licencia...",
      options: "filter2",
    },
    {
      key: "filter3",
      type: "multiselect",
      field: "empresaRut",
      placeholder: "Empresa Rut...",
      options: "filter3",
    },
    {
      key: "filter4",
      type: "text",
      field: "trabajadorRut",
      placeholder: "Trabajador Rut...",
      options: "filter4",
    },
    {
      key: "filter5",
      type: "multiselect",
      field: "numeroDocumento",
      placeholder: "Documento...",
      options: "filter5",
    },
    {
      key: "dateRange",
      type: "dateRange",
      dateField: "fechaInicio",
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
    // "estadoLicencia", 
    "motivoAnulacion", "motivoRechazo",
    "motivoDevolucion", "fechaUltimaModificacion", "fechaRecepcion",
    "fechaPrimeraAfiliacion", "fechaContratoTrabajo", "profesionalRut",
    "sexoTrabajador", "edadTrabajador"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["montoAnticipo", "montoSubsidio", "montoDiferencia"],

  // Configuración de badges
  badgesConfig: {
    montoDiferencia: {
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
      rolesAllowed: ["admin"],
    },
    licenciaDetails: {
      component: GenericModal,
      title: "Detalles de Licencia",
      content: LicenciaDetailsContent,
      rolesAllowed: ["admin", "previley", "editor"],
    },
    bulkUpload: {
      component: BulkUploadModal,
      rolesAllowed: ["admin"],
    },
    bulkActions: {
      component: BulkActions,
      rolesAllowed: ["admin", "editor"],
    },
    testModal: {
      component: TestModal,
      rolesAllowed: ["admin", "previley", "editor"],
    },
    selectWorker: {
      component: GenericModal,
      title: "Seleccionar Trabajador",
      content: SelectWorkerModal,
      rolesAllowed: ["admin", "previley", "editor"],
    }
  },
  actionsConfig: [
    {
      id: "nuevo",
      modalName: "licenciaForm",
      buttonText: "",
      rolesAllowed: ["admin"],
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
      id: "pdf",
      modalName: "exportarPDF",
      buttonText: "",
      rolesAllowed: ["admin", "previley", "cliente"],
      actionType: "exportPDF",
      color: "red",
      icon: "RiFilePdf2Fill",
    },
    {
      id: "excel",
      modalName: "exportarExcel",
      buttonText: "",
      rolesAllowed: ["admin", "previley", "cliente"],
      actionType: "exportExcel",
      color: "green",
      icon: "RiFileExcel2Fill",
    }
  ],
};

export default demoConfig;
