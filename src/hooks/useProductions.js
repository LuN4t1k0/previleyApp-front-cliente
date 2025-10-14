import { useState, useEffect } from "react";
import apiService from "@/app/api/apiService";

const useProductions = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductions = async () => {
      try {
        const response = await apiService.get("/produccion");
        setProductions(response.data.data); // Asegúrate de usar la estructura correcta
      } catch (err) {
        setError(err.message || "Error al cargar producciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductions();
  }, []);

  return { productions, loading, error };
};

export default useProductions;