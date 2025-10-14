import { useState, useCallback } from 'react';
import apiService from '@/app/api/apiService'; // Importa apiService en lugar de axios
import { showErrorAlert } from '../utils/alerts';


export const useDetailData = (detailPath, buildDetailEndpoint) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchDetails = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = buildDetailEndpoint(detailPath, id);
      console.log("Endpoint generado:", endpoint);
      const response = await apiService.get(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`);

      console.log("Respuesta completa de la API:", response.data); // Añade esta línea para ver la respuesta
      // const fetchedDetails = response.data.data; // Obtenemos los datos de la API
      const fetchedDetails = response.data.data || response.data; // Usa response.data si data no existe
      setDetails(fetchedDetails); // Actualizamos el estado
      console.log("Detalles guardados:", fetchedDetails);
      return fetchedDetails; // Devolvemos los datos obtenidos
    } catch (error) {
      console.error('Error fetching details:', error);
      setError(error);
      return null; // Si hay un error, devolvemos null
    } finally {
      setLoading(false);
    }
  }, [detailPath, buildDetailEndpoint]);

  return {
    details,
    loading,
    error,
    fetchDetails,
  };
};
