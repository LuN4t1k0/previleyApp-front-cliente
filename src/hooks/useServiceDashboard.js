"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLicenciasDashboard,
  fetchMoraDashboard,
  fetchPagexDashboard,
  fetchZonasExtremasDashboard,
  fetchOperationalServiceDashboard,
} from "@/services/clientServiceApi";
import { resolveServiceDefinition } from "@/config/clientServices.config";

const DASHBOARD_FETCHERS = {
  mora: { fetcher: fetchMoraDashboard, requiresEmpresa: true },
  pagex: { fetcher: fetchPagexDashboard, requiresEmpresa: true },
  licencias: { fetcher: fetchLicenciasDashboard, requiresEmpresa: true },
  "zonas-extremas": {
    fetcher: fetchZonasExtremasDashboard,
    requiresEmpresa: true,
  },
  "cargas-familiares": {
    fetcher: (empresaRut) =>
      fetchOperationalServiceDashboard("cargas-familiares", empresaRut),
    requiresEmpresa: false,
  },
  "depositos-convenidos": {
    fetcher: (empresaRut) =>
      fetchOperationalServiceDashboard("depositos-convenidos", empresaRut),
    requiresEmpresa: false,
  },
  "notificaciones-previsionales": {
    fetcher: (empresaRut) =>
      fetchOperationalServiceDashboard("notificaciones-previsionales", empresaRut),
    requiresEmpresa: false,
  },
};

export const useServiceDashboard = (serviceKey, empresaRut, range) => {
  const fetcherConfig = serviceKey ? DASHBOARD_FETCHERS[serviceKey] : null;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(
      fetcherConfig &&
        (!fetcherConfig.requiresEmpresa || Boolean(empresaRut))
    )
  );
  const [error, setError] = useState(null);

  const fetcher = fetcherConfig?.fetcher || null;
  const requiresEmpresa = Boolean(fetcherConfig?.requiresEmpresa);

  const fetchData = useCallback(async () => {
    if (!fetcher) {
      setData(null);
      setError(
        serviceKey
          ? new Error(`No existe un dashboard para el servicio ${serviceKey}.`)
          : null
      );
      setLoading(false);
      return;
    }
    if (requiresEmpresa && !empresaRut) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const payload = await fetcher(empresaRut, range);
      setData(payload);
      setError(null);
    } catch (err) {
      console.error(
        `Error al obtener datos del servicio ${serviceKey} para la empresa ${empresaRut}:`,
        err
      );
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, empresaRut, range, requiresEmpresa, serviceKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const definition = resolveServiceDefinition(serviceKey);

  return {
    definition,
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useServiceDashboard;
