
import apiService from '@/app/api/apiService';

export const fetchFilters = async (path, queryParams) => {
  try {
    const response = await apiService.get(path, { params: queryParams });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener los filtros.');
    }
  } catch (error) {
    throw error; // El manejo de errores se puede hacer aquí o se deja para el consumidor.
  }
};
