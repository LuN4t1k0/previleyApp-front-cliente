import BulkActions from "@/components/modal/BulkActions";
import BulkUploadModal from "@/components/modal/BulkUploadModal";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaDetailsContent from "@/components/modal/LicenciaDetailsContent";
import ProduccionFormContent from "@/components/modal/producciones/ProduccionFormContent";
import RejectProduccionContent from "@/components/modal/producciones/RejectProduccionContent";
import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
import TestModal from "@/components/modal/TestModal";

import { RiFilePdf2Line} from "@remixicon/react";



const UsuarioEmpresaConfig = {
  // Rutas de la API
  createPath: "/produccion/crear",
  updatePath: "/produccion/actualizar",
  resourcePath: "/usuarios-empresas",
  deletePath: "/empresa-credenciales/eliminar",
  filtersPath: "/produccion/filters",
  // detailPath: "/produccion/detalle",
  // bulkDeletePath: "/produccion/bulk-delete",
  // bulkUploadPath: "/produccion/bulk-create",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: "Todos los Documentos",
  subtitle: "Resumen de todas las Producciones registradas en PrevileyAPP.",

  // Definición de los filtros y su mapeo a los parámetros de consulta
  filters: [
    {
      key: "filter6",
      type: "multiselect",
      field: "servicioId",
      placeholder: "Servicio...",
      options: "servicios",
    },
    {
      key: "filter2",
      type: "multiselect",
      field: "estado",
      placeholder: "Estado produccion...",
      options: "filter2",
    },
    
    {
      key: "trabajadores",
      type: "multiselect",
      field: "trabajadorId", // Nombre del campo que será enviado al backend
      placeholder: "Seleccionar trabajador...",
      options: "trabajadores", // Campo en la respuesta del backend
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

   // Orden personalizado de las columnas
   columnOrder: [

  ],

  // Columnas a excluir en la visualización de tablas
  excludeColumns: [
    "usuarioId","id"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: [],
  // Columnas a formatear como fecha
  dateColumns: [],
  
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
   
  ],


 
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
    estado: {
      type: "status",
      variants: {
        "validado": "success",
        "pendiente": "warning",
        "rechazada": "error",

      },
    },
  },

  // Configuración de modales
  modalsConfig: {
    produccionForm: {
      component: GenericModal,
      title: "Agregar/Editar Producion",
      content: ProduccionFormContent,
      rolesAllowed: ["admin","trabajador"],
    },
    rejectProduccion: { // 👈 Nueva Modal
      component: GenericModal,
      title: "Rechazar Producción",
      content: RejectProduccionContent,
      rolesAllowed: ["admin", "editor"],
    },
    licenciaDetails: {
      component: GenericModal,
      title: "Detalles de Licencia",
      content: LicenciaDetailsContent,
      rolesAllowed: ["admin", "previley", "editor","cliente"],
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
      rolesAllowed: ["admin","trabajador"],
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
  // Habilitar scroll infinito
  useInfiniteScroll: true,
};

export default UsuarioEmpresaConfig;
