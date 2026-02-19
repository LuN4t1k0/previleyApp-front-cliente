"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiService from "@/app/api/apiService";

const DEFAULT_LIMIT = 20;

export const buildPrefacturaQuery = (filters = {}) => {
  const query = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      query[key] = value.join(",");
      return;
    }
    if (typeof value === "object" && value !== null) {
      const from = value.from || value.desde || value.start;
      const to = value.to || value.hasta || value.end;
      if (from) query[`${key}_inicio`] = from;
      if (to) query[`${key}_termino`] = to;
      return;
    }
    if (value === "") return;
    query[key] = value;
  });

  return query;
};

const parseResponse = (response) => {
  const payload = response?.data || {};
  return {
    data: payload.data || [],
    meta: {
      total: payload.total ?? 0,
      limit: payload.limit ?? DEFAULT_LIMIT,
      offset: payload.offset ?? 0,
      pages: payload.pages ?? 1,
    },
  };
};

export const usePrefacturas = (
  initialFilters = {},
  { autoFetch = true, limit = DEFAULT_LIMIT } = {}
) => {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    limit,
    offset: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const activeFilters = useMemo(
    () => ({ ...filters, limit }),
    [filters, limit]
  );

  const fetchData = useCallback(
    async (override = {}) => {
      setLoading(true);
      try {
        const sanitized = buildPrefacturaQuery({
          ...activeFilters,
          ...override,
        });
        if (!("limit" in sanitized)) {
          sanitized.limit = limit;
        }
        const response = await apiService.get("/prefacturas/prefacturas", {
          params: sanitized,
        });
        const { data: rows, meta: metaInfo } = parseResponse(response);
        setData(rows);
        setMeta(metaInfo);
        setError(null);
        return { data: rows, meta: metaInfo };
      } catch (err) {
        console.error("Error al cargar prefacturas:", err);
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeFilters, limit]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
};

export const usePrefacturasSummary = (filters = {}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    byStatus: {},
  });

  const filtersKey = useMemo(
    () => JSON.stringify(filters ?? {}),
    [filters]
  );

  const sanitizedFilters = useMemo(
    () => buildPrefacturaQuery(JSON.parse(filtersKey)),
    [filtersKey]
  );

  const fetchSummary = useCallback(async () => {
    if (!filtersKey) {
      return;
    }
    setLoading(true);
    try {
      const [filtersResponse, totalsResponse] = await Promise.all([
        apiService.get("/prefacturas/filters", {
          params: sanitizedFilters,
        }),
        apiService.get("/prefacturas/summary", {
          params: sanitizedFilters,
        }),
      ]);

      const statusOptions =
        filtersResponse?.data?.data?.estado?.map((item) => item.value) || [];

      const statuses =
        statusOptions.length > 0
          ? statusOptions
          : ["pendiente", "facturada", "pagada"];

      const totalPayload = totalsResponse?.data?.data || totalsResponse?.data || {};
      const byStatus = statuses.reduce((acc, estado) => {
        acc[estado] = totalPayload?.byStatus?.[estado] ?? 0;
        return acc;
      }, {});

      setSummary({
        total: totalPayload.total ?? 0,
        byStatus,
      });
      setError(null);
    } catch (err) {
      console.error("Error al obtener resumen de prefacturas:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [sanitizedFilters, filtersKey]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};
