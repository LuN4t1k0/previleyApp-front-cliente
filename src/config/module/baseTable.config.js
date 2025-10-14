// config/baseTable.config.js

const BaseTableConfig = {
  // ================================
  // 🔹 Endpoints / Rutas de la API
  // ================================
  createPath: "",           // POST para crear registros
  updatePath: "",           // PUT/PATCH para editar registros
  resourcePath: "",         // GET principal de la tabla (lista)
  deletePath: "",           // DELETE individual
  bulkUploadPath: "",       // POST para carga masiva
  bulkUploadParentIdField: null, // Ej: "empresaId" si el bulk depende de un padre
  filtersPath: "",          // GET opciones de filtros
  detailPath: "",           // GET detalle de un registro
  buildDetailEndpoint: (detailPath, id) => `${detailPath}/${id}`, // cómo se arma el endpoint de detalle

  // ================================
  // 🔹 Información de UI
  // ================================
  title: "",                // Título de la tabla
  subtitle: "",             // Subtítulo/descripción
  useInfiniteScroll: false, // Si es true, activa scroll infinito en lugar de paginación

  // ================================
  // 🔹 Configuración de filtros
  // ================================
  filters: [
    // { key, type, field, placeholder, options }
    // type puede ser: "multiselect" | "dateRange" | "text"
  ],

  // ================================
  // 🔹 Columnas
  // ================================
  excludeColumns: [],       // Columnas que NO se muestran
  monetaryColumns: [],      // Columnas que deben formatearse como CLP ($)
  dateColumns: [],          // Columnas que deben formatearse como fecha
  percentageColumns: [],    // Columnas que deben formatearse como porcentaje
  periodoColumns: [],       // Columnas de período (mes/año) → soporte especial en generateColumns
  revisarFechaVencimiento: [], // Columnas de fecha a resaltar si están vencidas

  columnsConfig: [
    // {
    //   header: "Nombre visible",
    //   accessorKey: "campoEnElBackend",
    //   type: "link" | "actions" | undefined,
    //   actions: [ ... ] // solo si type = "actions"
    // }
  ],

  columnOrder: [],          // Orden específico de columnas (array de accessorKeys)

  // ================================
  // 🔹 Acciones
  // ================================
  actionsConfig: [
    // {
    //   id: "nuevo",
    //   modalName: "crearEditar",
    //   buttonText: "Nuevo",
    //   rolesAllowed: ["admin"],
    //   actionType: "create",
    //   color: "blue",
    //   icon: "RiFileAddLine",
    // }
  ],

  // ================================
  // 🔹 Badges
  // ================================
  badgesConfig: {
    // campoEjemplo: {
    //   type: "status" | "value",
    //   variants: {
    //     positive: "success",
    //     negative: "error",
    //     neutral: "neutral",
    //     pendiente: "warning",
    //     validado: "indigo",
    //   },
    //   textTransform: "uppercase" | "capitalize" | "none",
    // }
  },

  // ================================
  // 🔹 Modales
  // ================================
  modalsConfig: {
    // crearEditar: {
    //   component: GenericModal,
    //   title: "Agregar/Editar",
    //   content: FormContent,
    //   rolesAllowed: ["admin", "editor"],
    // },
  },
};

export default BaseTableConfig;
