import BulkActions from "@/components/modal/BulkActions";
import BulkUploadModal from "@/components/modal/BulkUploadModal";
import FacturaFormContent from "@/components/modal/factura/FacturaFormContent";
import GenericModal from "@/components/modal/GenericModal";
import LicenciaFormContent from "@/components/modal/LicenciaFormContent";
import CreatePrefacturaAllEmpresasContent from "@/components/modal/prefactura/CreatePrefacturaAllEmpresasContent";
import CreatePrefacturaEmpresaContent from "@/components/modal/prefactura/CreatePrefacturaEmpresaContent";
import PrefacturaDetailsContent from "@/components/modal/prefactura/PrefacturaDetailsContent";
import SelectWorkerModal from "@/components/modal/SelectWorkerModal";
import { RiCheckLine,RiArticleLine, RiFilePdf2Line, RiRefreshLine } from "@remixicon/react";



const modulo= "Facturas";

const FacturaConfig = {
  // Rutas de la API
  createPath: "/prefactura/crear",
  updatePath: "/facturas",
  resourcePath: "/facturas",
  deletePath: "/prefacturas/eliminar",
  filtersPath: "/prefacturas/filters/",
  detailPath: "prefacturas/detalle",
  bulkDeletePath: "/licencias-medicas/bulk-delete",
  bulkUploadPath: "/licencias-medicas/bulk-create",
  buildDetailEndpoint: (detailPath, folio) => `${detailPath}/${folio}`,

  // Información de UI
  title: modulo,
  subtitle: `Resumen de todas las ${modulo} registradas en PrevileyAPP.`,

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
      field: "estado",
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
    "createdAt", "updatedAt", "id", "prefacturaId","notas"
  ],

  // Columnas a formatear como moneda
  monetaryColumns: ["totalFacturado"],
  
  // Añadir configuración de las columnas ordenables:
  columnsConfig: [
    {
      header: "Factura",
      accessorKey: "factura",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },
    {
      header: "Prefactura",
      accessorKey: "prefactura",
      type: "link", // Enlace
      Icono: RiFilePdf2Line, // Ícono para el enlace
      label: "", // Texto para el enlace
      iconClass: "mr-2 text-red-500", // Clases para el ícono
    },
    {
      header: "Estado",
      accessorKey: "accionesEstado", // campo "falso", no existe en la DB
      type: "actions",  // usamos un "type" personalizado
      actions: [

        {
          id: "markAsPaid",
          icon: RiCheckLine,
          label: "Marcar como Pagada",
          iconClass: "text-green-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado === "pendiente",
          onClick: (rowData, handlers) => handlers.markAsPaid(rowData),
        },
        {
          id: "markAsCancelled",
          icon: RiArticleLine,
          label: "Anular Factura",
          iconClass: "text-red-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado !== "anulada" && rowData.estado !== "pagada",
          onClick: (rowData, handlers) => handlers.markAsCancelled(rowData),
        },
        {
          id: "deleteFactura",
          icon: RiArticleLine,
          label: "Eliminar Factura",
          iconClass: "text-gray-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado === "pendiente",
          onClick: (rowData, handlers) => handlers.deleteFactura(rowData),
        },
        {
          id: "revertirPago",
          icon: RiRefreshLine, // 🔄 Ícono de revertir
          label: "Revertir Pago",
          iconClass: "text-red-500",
          rolesAllowed: ["admin"],
          visibleWhen: (rowData) => rowData.estado === "pagada", // Solo se muestra si está pagada
          onClick: (rowData, handlers) => handlers.revertirPago(rowData),
        },
        // {
        //   id: "downloadFactura",
        //   icon: RiFilePdf2Line,
        //   label: "Descargar Factura",
        //   iconClass: "text-blue-500",
        //   rolesAllowed: ["admin", "cliente"],
        //   visibleWhen: (rowData) => !!rowData.factura,
        //   onClick: (rowData, handlers) => handlers.downloadFactura(rowData),
        // },
      ],
      meta: {
        align: "text-center", // opcional, para centrar
      },
    },
    
  ],

  // Columnas a formatear como fecha
  dateColumns: ["fechaEnvio", "fechaVencimiento"], // Añade las columnas que necesites

  // Configuración de badges
  badgesConfig: {

    estado: {
      type: "status",
      variants: {
        "pendiente": "warning",
        "Rechazado": "error",
        "Aprobado": "success",
        "Reducida": "warning", // Usar warning como aproximación
        "Pagada": "success",   // Usar success como aproximación
        "TRAMITADA POR EMPLEADOR PARA CCAF": "warning",
        "TRAMITADA POR EMPLEADOR": "warning",
        "EMITIDA POR PROFESIONAL":"success",
        "AUTORIZADA":"success",
        "RECHAZADA": "error",
        "REDUCIDA": "warning",
        "facturada": "success",


      },
    },
  },

  // Configuración de modales
  modalsConfig: {
    createForEmpresa: {
      component: GenericModal,
      title: "Crear Prefactura para una Empresa",
      content: CreatePrefacturaEmpresaContent,
      rolesAllowed: ["admin"],
    },
    createForAllEmpresas: {
      component: GenericModal,
      title: "Crear Prefacturas para Todas las Empresas",
      content: CreatePrefacturaAllEmpresasContent,
      rolesAllowed: ["admin"],
    },
    createFactura: { // 👈 Este nombre debe coincidir con el `modalName`
      component: GenericModal,
      title: "Crear Factura",
      content: FacturaFormContent,
      rolesAllowed: ["admin"],
    },
    licenciaForm: {
      component: GenericModal,
      title: "Agregar/Editar Licencia",
      content: LicenciaFormContent,
      rolesAllowed: ["admin"],
    },
    licenciaDetails: {
      component: GenericModal,
      title: "PROFORMA",
      content: PrefacturaDetailsContent,
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
    selectWorker: {
      component: GenericModal,
      title: "Seleccionar Trabajador",
      content: SelectWorkerModal,
      rolesAllowed: ["admin", "previley", "editor"],
    },
    createFactura: { // 👈 Este nombre debe coincidir con el `modalName`
      component: GenericModal,
      title: "Crear Factura",
      content: FacturaFormContent,
      rolesAllowed: ["admin"],
    },
    
  },
  actionsConfig: [
    {
      id: "createForEmpresa",
      modalName: "createForEmpresa",
      buttonText: "Prefactura Empresa",
      rolesAllowed: ["admin"],
      actionType: "createForEmpresa",
      color: "blue",
      icon: "RiFileAddFill",
    },
    {
      id: "createForAllEmpresas",
      modalName: "createForAllEmpresas",
      buttonText: "Prefacturas Todas",
      rolesAllowed: ["admin"],
      actionType: "createForAllEmpresas",
      color: "purple",
      icon: "RiBuilding2Fill",
    },
    // {
    //   id: "exportPDF",
    //   modalName: "exportarPDF",
    //   buttonText: "Exportar PDF",
    //   rolesAllowed: ["admin", "previley", "cliente"],
    //   actionType: "exportPDF",
    //   color: "red",
    //   icon: "RiFilePdf2Fill",
    // },
    // {
    //   id: "exportExcel",
    //   modalName: "exportarExcel",
    //   buttonText: "Exportar Excel",
    //   rolesAllowed: ["admin", "previley", "cliente"],
    //   actionType: "exportExcel",
    //   color: "green",
    //   icon: "RiFileExcel2Fill",
    // },
  ],
  // Habilitar scroll infinito
  useInfiniteScroll: true,
  
};

export default FacturaConfig;
