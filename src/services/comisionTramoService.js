// src/services/comisionTramoService.js

import apiService from "@/app/api/apiService";

export const getTramosByTrabajador = (trabajadorId) => {
  return apiService.get(`/comision-tramo/${trabajadorId}`);
};

export const createTramo = (payload) => {
  // payload: { trabajadorId, desde, hasta, porcentaje }
  return apiService.post(`/comision-tramo/crear`, payload);
};

export const updateTramo = (id, payload) => {
  return apiService.patch(`/comision-tramo/${id}`, payload);
};

export const deleteTramo = (id) => {
  return apiService.delete(`/comision-tramo/${id}`);
};

