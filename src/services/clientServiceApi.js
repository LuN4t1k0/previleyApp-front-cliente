"use client";

import apiService from "@/app/api/apiService";

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
    apiService.get(`/mora-dashboard/${empresaRut}/casos-por-estado`),
    apiService.get(`/mora-dashboard/${empresaRut}/top-pendientes`),
    apiService.get(`/mora-dashboard/${empresaRut}/evolucion-temporal`),
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

export const fetchLicenciasDashboard = async (empresaRut) => {
  const [summaryRes, tasaRes, evolutionRes, comparativoRes] = await Promise.all([
    apiService.get(`/licencia-dashboard/${empresaRut}/resumen-financiero`),
    apiService.get(`/licencia-dashboard/${empresaRut}/tasa-rechazo`),
    apiService.get(`/licencia-dashboard/${empresaRut}/evolucion-mensual`),
    apiService.get(
      `/licencia-dashboard/${empresaRut}/comparativo-anticipos-subsidios`
    ),
  ]);

  return {
    summary: summaryRes?.data?.data || {},
    rates: tasaRes?.data?.data || {},
    evolution: formatEvolutionMensual(evolutionRes?.data?.data || []),
    comparativo: comparativoRes?.data?.data || {},
  };
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

  const [summaryRes, statesRes, zonesRes, gestionesRes, detallesRes] =
    await Promise.all([
      apiService.get(`${basePath}/resumen-financiero`, { params }),
      apiService.get(`${basePath}/distribucion-estado`, { params }),
      apiService.get(`${basePath}/distribucion-zona`, { params }),
      apiService.get(`${basePath}/ultimas-gestiones`, {
        params: { ...params, limit: 8 },
      }),
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
    latestGestiones: normalizeRows(gestionesRes),
    latestDetalles: normalizeRows(detallesRes),
  };
};
