import apiService from "@/app/api/apiService";

export const getComisionConfig = (trabajadorId) => {
  return apiService.get(`/comisiones/config/${trabajadorId}`);
};

export const updateComisionConfig = (trabajadorId, payload) => {
  return apiService.put(`/comisiones/config/${trabajadorId}`, payload);
};
