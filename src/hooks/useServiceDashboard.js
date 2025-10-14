"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchLicenciasDashboard,
  fetchMoraDashboard,
  fetchPagexDashboard,
} from "@/services/clientServiceApi";
import { resolveServiceDefinition } from "@/config/clientServices.config";

const DASHBOARD_FETCHERS = {
  mora: fetchMoraDashboard,
  pagex: fetchPagexDashboard,
  licencias: fetchLicenciasDashboard,
};

export const useServiceDashboard = (serviceKey, empresaRut, range) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(serviceKey && empresaRut));
  const [error, setError] = useState(null);

  const fetcher = serviceKey ? DASHBOARD_FETCHERS[serviceKey] : null;

  const fetchData = useCallback(async () => {
    if (!fetcher || !empresaRut) return;
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
  }, [fetcher, empresaRut, range, serviceKey]);

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
