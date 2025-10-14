// src/hooks/useIndicadores.js

import { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";

export function useIndicadores(periodo) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!periodo) return;

    setLoading(true);
    apiService
      .get(`/indicadores-previsionales/${periodo}`)
      .then((res) => setData(res.data?.data || null))
      .catch((err) => setError(err?.response?.data?.message || "Error al cargar indicadores"))
      .finally(() => setLoading(false));
  }, [periodo]);

  return { data, loading, error };
}
