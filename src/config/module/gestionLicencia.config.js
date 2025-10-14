// src/config/module/gestionLicencia.config.js
const GestionLicenciaConfig = {
  // Endpoints base (REST CRUD de la gestión)
  resourcePath: "/gestion-licencia",
  deletePath: "/gestion-licencia",
  createPath: "/gestion-licencia",
  updatePath: "/gestion-licencia",
  filtersPath: "/gestion-licencia/filters",

  // Detalle: listaremos Licencias Médicas contenidas en una gestión
  // (el backend filtra por gestionLicenciaId)
  detailPath: "/licencias-medicas",
  buildDetailEndpoint: (row) => `/licencias-medicas?gestionLicenciaId=${row.id}`,

  // Carga masiva de licencias a una gestión
  bulkUploadPath: "/licencias-medicas/bulk-create",
  // el guard por defecto usa este nombre de campo para asociar al padre
  // (coincide con el backend)
  bulkUploadParentIdField: "gestionLicenciaId",

  title: "Gestión de Licencias",
  subtitle:
    "Crea la gestión, carga el archivo de licencias, revisa el detalle y exporta.",

  // Filtros típicos de gestión (ajusta si tu backend expone otros)
  filters: [
    { key: "empresaRut", type: "multiselect", field: "empresaRut" },
    { key: "fechaGestion", type: "dateRange", field: "fechaGestion" },
    { key: "periodoInicio", type: "text", field: "periodoInicio" },
    { key: "periodoTermino", type: "text", field: "periodoTermino" },
  ],

  excludeColumns: ["updatedAt"],
  dateColumns: ["fechaGestion", "createdAt"],

  // Columnas (ajusta headers si quieres)
  columnsConfig: {
    id: { header: "ID", meta: { align: "center" } },
    empresaRut: { header: "Empresa", meta: { align: "left" } },
    periodoInicio: { header: "Inicio" },
    periodoTermino: { header: "Término" },
    createdAt: { header: "Creada" },
  },

  // Botonera superior (usa tu ModalManager existente)
  actionsConfig: [
    { id: "create", label: "Crear gestión", variant: "primary", roles: ["admin", "editor"] },
    { id: "bulkUpload", label: "Carga masiva", roles: ["admin", "editor"] },
    { id: "exportPDF", label: "Exportar PDF trabajador", roles: ["admin", "editor", "previley"] },
    { id: "exportExcel", label: "Exportar Excel trabajador", roles: ["admin", "editor", "previley"] },
  ],

  // Los IDs aquí deben existir en tu ModalManager
  modalsConfig: {
    licenciaDetails: { component: "LicenciaDetailsContent" },
    bulkUpload: { component: "BulkUploadModal" },
    selectWorker: { component: "SelectWorkerModal" },
  },
};

export default GestionLicenciaConfig;
