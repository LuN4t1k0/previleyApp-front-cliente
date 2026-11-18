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
  } else if (typeof dateRange?.from === "string") {
    params.fechaInicio = dateRange.from;
  }

  if (dateRange?.to instanceof Date) {
    params.fechaFin = dateRange.to.toISOString().split("T")[0];
  } else if (typeof dateRange?.to === "string") {
    params.fechaFin = dateRange.to;
  }

  return params;
};

export default buildMoraDashboardParams;
