// src/hooks/usePeriodos.js

import { useState, useEffect } from "react";
import apiService from "@/app/api/apiService";

export function usePeriodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiService
      .get("/indicadores-previsionales/periodos")
      .then((res) => {
        setPeriodos(res.data?.periodos || []);
      })
      .catch((err) => {
        console.error("Error al cargar períodos", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { periodos, loading };
}
