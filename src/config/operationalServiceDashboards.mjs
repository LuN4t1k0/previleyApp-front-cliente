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

const OPERATIONAL_SERVICE_ALIASES = Object.freeze({
  cf: "cargas-familiares",
  dc: "depositos-convenidos",
});

export const getCanonicalOperationalServiceKey = (serviceKey) => {
  const canonicalKey = OPERATIONAL_SERVICE_ALIASES[serviceKey] || serviceKey;
  return OPERATIONAL_SERVICE_DASHBOARDS[canonicalKey] ? canonicalKey : null;
};

export const getOperationalDashboardDefinition = (serviceKey) => {
  const canonicalKey = getCanonicalOperationalServiceKey(serviceKey);
  return canonicalKey ? OPERATIONAL_SERVICE_DASHBOARDS[canonicalKey] : null;
};

export const isOperationalDashboardService = (serviceKey) =>
  Boolean(getOperationalDashboardDefinition(serviceKey));

