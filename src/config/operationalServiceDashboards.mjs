export const OPERATIONAL_SERVICE_DASHBOARDS = Object.freeze({
  "cargas-familiares": {
    key: "cargas-familiares",
    title: "Cargas Familiares",
    shortLabel: "cargas",
    volumeLabel: "Cargas informadas",
    endpoint: "/gestion-carga-familiar",
    volumeField: "totalCargas",
    accent: "rose",
  },
  "depositos-convenidos": {
    key: "depositos-convenidos",
    title: "Depósitos Convenidos",
    shortLabel: "registros",
    volumeLabel: "Registros procesados",
    endpoint: "/gestion-depositos-convenidos",
    volumeField: "totalRegistros",
    accent: "indigo",
  },
  "notificaciones-previsionales": {
    key: "notificaciones-previsionales",
    title: "Notificaciones Previsionales",
    shortLabel: "casos",
    volumeLabel: "Casos informados",
    endpoint: "/gestion-notificaciones-previsionales",
    volumeField: "totalCasos",
    accent: "amber",
  },
});

export const getOperationalDashboardDefinition = (serviceKey) =>
  OPERATIONAL_SERVICE_DASHBOARDS[serviceKey] || null;

export const isOperationalDashboardService = (serviceKey) =>
  Boolean(getOperationalDashboardDefinition(serviceKey));

