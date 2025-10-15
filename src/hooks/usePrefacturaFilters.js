"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "@/app/api/apiService";
import { buildPrefacturaQuery } from "./usePrefacturas";

export const usePrefacturaFilters = (filters = {}) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtersKey = useMemo(
    () => JSON.stringify(filters ?? {}),
    [filters]
  );

  const queryParams = useMemo(
    () => buildPrefacturaQuery(JSON.parse(filtersKey)),
    [filtersKey]
  );

  const fetchFilters = useCallback(async () => {
    if (!filtersKey) return;
    setLoading(true);
    try {
      const response = await apiService.get("/prefacturas/filters", {
        params: queryParams,
      });
      const payload = response?.data?.data || {};
      setData(payload);
      setError(null);
    } catch (err) {
      console.error("Error al obtener filtros de prefacturas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filtersKey, queryParams]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return {
    filters: data,
    loading,
    error,
    refetch: fetchFilters,
  };
};
