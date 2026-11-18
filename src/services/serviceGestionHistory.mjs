import { getOperationalDashboardDefinition } from "../config/operationalServiceDashboards.mjs";

export const GESTION_HISTORY_PAGE_SIZE = 20;

const getEndpoint = (serviceKey) =>
  serviceKey === "zonas-extremas"
    ? "/gestion-zonas-extremas"
    : getOperationalDashboardDefinition(serviceKey).endpoint;

export const getGestionHistoryRequest = (
  serviceKey,
  { page = 1, empresaRut, from, to, estado } = {}
) => {
  const params = {
    limit: GESTION_HISTORY_PAGE_SIZE,
    offset: (page - 1) * GESTION_HISTORY_PAGE_SIZE,
  };
  if (empresaRut) params.empresaRut = empresaRut;
  if (from) params.fechaGestion_inicio = from;
  if (to) params.fechaGestion_termino = to;
  if (estado) params.estado = estado;
  return { endpoint: getEndpoint(serviceKey), params };
};

export const normalizeGestionHistoryPage = (payload) => {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return { rows, total: Number(payload?.total ?? rows.length) };
};

export const getGestionHistoryExcelPath = (serviceKey, id) => {
  const suffix = serviceKey === "zonas-extremas" ? "/export" : "/detalles/export";
  return `${getEndpoint(serviceKey)}/${encodeURIComponent(id)}${suffix}`;
};
