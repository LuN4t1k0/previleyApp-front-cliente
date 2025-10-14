export const buildMoraDashboardParams = ({ empresaRut, entidadId, dateRange } = {}) => {
  const params = {};

  if (empresaRut) {
    params.empresaRut = empresaRut;
  }

  if (entidadId) {
    params.entidadId = entidadId;
  }

  if (dateRange?.from instanceof Date) {
    params.fechaInicio = dateRange.from.toISOString().split("T")[0];
  }

  if (dateRange?.to instanceof Date) {
    params.fechaFin = dateRange.to.toISOString().split("T")[0];
  }

  return params;
};

export default buildMoraDashboardParams;
