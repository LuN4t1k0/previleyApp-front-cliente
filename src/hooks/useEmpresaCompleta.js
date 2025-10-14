"use client";

import { useCallback, useEffect, useState } from "react";
import apiService from "@/app/api/apiService";

export const useEmpresaCompleta = (empresaRut) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(empresaRut));
  const [error, setError] = useState(null);

  const fetchEmpresa = useCallback(async () => {
    if (!empresaRut) return;
    setLoading(true);
    try {
      const response = await apiService.get(`/empresas/${empresaRut}/completa`);
      setData(response?.data || null);
      setError(null);
    } catch (err) {
      console.error(`Error al obtener información de la empresa ${empresaRut}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [empresaRut]);

  useEffect(() => {
    fetchEmpresa();
  }, [fetchEmpresa]);

  return {
    data,
    loading,
    error,
    refetch: fetchEmpresa,
  };
};

export default useEmpresaCompleta;
