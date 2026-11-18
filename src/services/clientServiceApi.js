"use client";

import apiService from "@/app/api/apiService";
import { getOperationalDashboardDefinition } from "@/config/operationalServiceDashboards.mjs";
import {
  aggregateOperationalDashboard,
  fetchOperationalGestionRows,
} from "@/services/operationalServiceDashboard.mjs";
import {
  getGestionHistoryRequest,
  getGestionHistoryExcelPath,
  normalizeGestionHistoryPage,
} from "@/services/serviceGestionHistory.mjs";
import {
  getGestionLicenciaExcelPath,
  normalizeGestionLicenciaPage,
} from "@/services/licenciasManagement.mjs";

const buildRangeParams = (range) => {
  if (!range) return {};
  const params = {};
  if (range.from) params.fechaInicio = range.from;
  if (range.to) params.fechaFin = range.to;
  return params;
};

const formatTimeline = (timeline = {}) =>
  Object.entries(timeline).map(([periodo, valores]) => ({
    periodo,
    regularizado:
      typeof valores?.regularizado === "number"
        ? valores.regularizado
        : Number(valores?.regularizado || 0),
    pago:
      typeof valores?.pago === "number" ? valores.pago : Number(valores?.pago || 0),
  }));

export const fetchMoraDashboard = async (empresaRut, range) => {
  const params = buildRangeParams(range);
  const [summaryRes, casesRes, topRes, timelineRes] = await Promise.all([
    apiService.get(`/mora-dashboard/${empresaRut}/resumen-financiero`, {
      params,
    }),
    apiService.get(`/mora-dashboard/${empresaRut}/casos-por-estado`, { params }),
    apiService.get(`/mora-dashboard/${empresaRut}/top-pendientes`, { params }),
    apiService.get(`/mora-dashboard/${empresaRut}/evolucion-temporal`, { params }),
  ]);

  return {
    summary: summaryRes?.data?.data || {},
    cases: casesRes?.data || {},
    topPendientes: topRes?.data?.data || [],
    timeline: formatTimeline(timelineRes?.data || {}),
  };
};

export const fetchPagexDashboard = async (empresaRut, range) => {
  const params = buildRangeParams(range);
  const [summaryRes, casesRes, debtRes, topRes] = await Promise.all([
    apiService.get(`/pagex-dashboard/${empresaRut}/resumen-financiero`, {
      params,
    }),
    apiService.get(`/pagex-dashboard/${empresaRut}/casos-por-estado`),
    apiService.get(`/pagex-dashboard/${empresaRut}/deuda-por-institucion`),
    apiService.get(`/pagex-dashboard/${empresaRut}/top-pendientes`),
  ]);

  return {
    summary: summaryRes?.data?.data || {},
    cases: casesRes?.data || {},
    debtByInstitution: debtRes?.data?.data || [],
    topPendientes: topRes?.data?.data || [],
  };
};

const formatEvolutionMensual = (data = []) =>
  data.map((item) => ({
    mes: item.mes ?? item.fecha ?? item.periodo ?? "",
    cantidadLicencias: Number(item.cantidadLicencias || item.cantidad || 0),
    totalDias: Number(item.totalDias || 0),
  }));

const unwrapApiData = (response, fallback) => {
  const body = response?.data;
  if (body?.data !== undefined) return body.data;
  return body ?? fallback;
};

export const fetchLicenciasDashboard = async (empresaRut, range) => {
  const params = buildRangeParams(range);
  const [integralRes, tasaRes, evolutionRes, comparativoRes, topRes, gestionesRes] = await Promise.all([
    apiService.get(`/licencia-dashboard/${empresaRut}/ficha-resumen`, { params }),
    apiService.get(`/licencia-dashboard/${empresaRut}/tasa-rechazo`, { params }),
    apiService.get(`/licencia-dashboard/${empresaRut}/evolucion-mensual`, { params }),
    apiService.get(
      `/licencia-dashboard/${empresaRut}/comparativo-anticipos-subsidios`, { params }
    ),
    apiService.get(`/licencia-dashboard/${empresaRut}/top-trabajadores`, { params }),
    apiService.get("/gestion-licencia", {
      params: { empresaRut, limit: 5, offset: 0, ...params },
    }),
  ]);

  return {
    resumenIntegral: unwrapApiData(integralRes, {}),
    rates: unwrapApiData(tasaRes, {}),
    evolution: formatEvolutionMensual(unwrapApiData(evolutionRes, [])),
    comparativo: unwrapApiData(comparativoRes, {}),
    topWorkers: unwrapApiData(topRes, []),
    recentManagement: unwrapApiData(gestionesRes, []),
  };
};

export const fetchGestionesLicencia = async (params) => {
  const response = await apiService.get("/gestion-licencia", { params });
  return normalizeGestionLicenciaPage(response?.data || {});
};

export const downloadGestionLicenciaExcel = async (id) => {
  const response = await apiService.get(getGestionLicenciaExcelPath(id), {
    params: { direct: 1 },
    responseType: "blob",
  });
  const disposition = response?.headers?.["content-disposition"] || "";
  const filename =
    disposition.match(/filename="?([^";]+)"?/i)?.[1] ||
    `gestion-licencia-${id}.xlsx`;
  const blob = response?.data;

  if (typeof document !== "undefined" && blob) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  return { blob, filename };
};

const normalizeRows = (response) => response?.data?.data || [];

const normalizeDistribution = (response) =>
  normalizeRows(response).reduce((acc, item) => {
    const label = item.label || "Sin información";
    acc[label] = Number(item.total || 0);
    return acc;
  }, {});

export const fetchZonasExtremasDashboard = async (empresaRut, range) => {
  const params = buildRangeParams(range);
  const basePath = `/zonas-extremas-dashboard/${empresaRut}`;

  const [summaryRes, statesRes, zonesRes, detallesRes] =
    await Promise.all([
      apiService.get(`${basePath}/resumen-financiero`, { params }),
      apiService.get(`${basePath}/distribucion-estado`, { params }),
      apiService.get(`${basePath}/distribucion-zona`, { params }),
      apiService.get(`${basePath}/ultimos-detalles`, {
        params: { ...params, limit: 8 },
      }),
    ]);

  const summary = summaryRes?.data?.data || {};

  return {
    summary: {
      totalGestiones: Number(summary.totalGestiones || 0),
      totalRegistros: Number(summary.totalRegistros || 0),
      trabajadores: Number(summary.trabajadoresInformados || 0),
      totalBonificado: Number(summary.totalBonificado || 0),
      totalRecuperado: Number(summary.totalRecuperado || 0),
      totalRemuneracion: Number(summary.totalRemuneracion || 0),
      totalEnProduccion: Number(summary.totalEnProduccion || 0),
    },
    states: normalizeDistribution(statesRes),
    zones: normalizeDistribution(zonesRes),
    latestDetalles: normalizeRows(detallesRes),
  };
};

export const fetchGestionHistoryPage = async (serviceKey, filters, signal) => {
  const { endpoint, params } = getGestionHistoryRequest(serviceKey, filters);
  const response = await apiService.get(endpoint, { params, signal });
  return normalizeGestionHistoryPage(response.data);
};

export const downloadGestionHistoryExcel = async (serviceKey, gestion) => {
  const response = await apiService.get(getGestionHistoryExcelPath(serviceKey, gestion.id), {
    responseType: "blob",
  });
  const filename = `detalle-${serviceKey}-${gestion.folio || gestion.id}.xlsx`;
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
};

export const fetchOperationalServiceDashboard = async (
  serviceKey,
  empresaRut,
  range
) => {
  const definition = getOperationalDashboardDefinition(serviceKey);
  if (!definition) {
    throw new Error(`El servicio ${serviceKey} no tiene un dashboard configurado.`);
  }

  const params = {};
  if (empresaRut) params.empresaRut = empresaRut;
  if (range?.from) params.fechaGestion_inicio = range.from;
  if (range?.to) params.fechaGestion_termino = range.to;

  const rows = await fetchOperationalGestionRows(async (pagination) => {
    const response = await apiService.get(definition.endpoint, {
      params: { ...params, ...pagination },
    });
    return response.data;
  });
  return aggregateOperationalDashboard(rows, definition);
};
