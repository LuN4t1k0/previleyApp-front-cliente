// hooks/useEmpresasPermitidas.js
import { useEffect, useState } from "react";
import apiService from "@/app/api/apiService";
import useUserData from "./useUserData";

const useEmpresasPermitidas = () => {
  const { id } = useUserData();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        if (!id) return;
        // const res = await apiService.get(`/usuarios/empresas/by-usuario/${id}`);
        const res = await apiService.get(`/usuarios/${id}/empresas`);
        setEmpresas(res.data.data || []);
      } catch (err) {
        console.error("Error al obtener empresas permitidas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [id]);

  return { empresas, loading };
};

export default useEmpresasPermitidas;
