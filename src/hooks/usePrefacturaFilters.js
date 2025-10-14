"use client";

import { useCallback, useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import { buildPrefacturaQuery } from "./usePrefacturas";

export const usePrefacturaFilters = (filters = {}) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    try {
      const query = buildPrefacturaQuery(filters);
      const response = await apiService.get("/prefacturas/filters", {
        params: query,
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
  }, [filters]);

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
