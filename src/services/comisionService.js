// src/services/comisionService.js

import apiService from "@/app/api/apiService";


/**
 * Obtiene el progreso actual de la comisión.
 * Si no se provee trabajadorId, el backend lo infiere del token del usuario.
 * @param {object} params - Objeto con fechaDesde, fechaHasta, y opcionalmente trabajadorId.
 * @returns {Promise<object>}
 */
export const getProgresoComision = (params) => {
  return apiService.get('/comisiones/progreso-actual', { params });
};

/**
 * Obtiene el historial de comisiones ya calculadas para un trabajador.
 * @param {string} trabajadorId
 * @returns {Promise<object>}
 */
export const getHistorialComisiones = (trabajadorId) => {
  return apiService.get(`/trabajadores/${trabajadorId}/comisiones`);
};

/**
 * Obtiene la lista de todos los trabajadores (para la vista de admin).
 * @returns {Promise<object>}
 */
export const getTrabajadores = () => {
  // Ajusta la URL si tu endpoint de usuarios/trabajadores es diferente
  // return apiService.get('/usuarios', { params: { rol: 'trabajador' } });
  return apiService.get('/trabajadores');
};

/**
 * Resumen mensual de comisiones por trabajador (solo admin)
 * @param {{anio:number, mes:number}} params
 */
export const getResumenMensualComisiones = (params) => {
  return apiService.get('/comisiones/resumen-mensual', { params });
};
