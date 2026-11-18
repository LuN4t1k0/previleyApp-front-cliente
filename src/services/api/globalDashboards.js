const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const requestGlobalDashboard = async (path, params = {}, signal) => {
  const response = await fetch(`/api/${path}${buildQueryString(params)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "No fue posible obtener el dashboard global.");
  }

  return data?.data ?? data;
};

export const getMoraGlobalDashboard = async (params = {}, { signal } = {}) => {
  const data = await requestGlobalDashboard("mora/global", params, signal);
  const hasSelection = [params.empresaRuts, params.grupoEmpresarialId].some((value) =>
    Array.isArray(value) ? value.some((item) => String(item ?? "").trim()) : String(value ?? "").trim()
  );
  if (!data?.requiresSelection || hasSelection) return data;

  const empresas = Array.isArray(data.scope?.availableEmpresas) ? data.scope.availableEmpresas : [];
  const empresaRuts = [...new Set(empresas.map((empresa) =>
    typeof empresa?.empresaRut === "string" ? empresa.empresaRut.trim() : ""
  ).filter(Boolean))];
  if (!empresaRuts.length) return data;

  const dashboard = await requestGlobalDashboard("mora/global", { ...params, empresaRuts }, signal);
  if (dashboard?.requiresSelection) {
    throw new Error("No fue posible seleccionar las empresas para el dashboard.");
  }
  return dashboard;
};

export const getPagexGlobalDashboard = (params, { signal } = {}) =>
  requestGlobalDashboard("pagex/global", params, signal);

export const getLicenciasGlobalDashboard = (params, { signal } = {}) =>
  requestGlobalDashboard("licencias/global", params, signal);

export default {
  getMoraGlobalDashboard,
  getPagexGlobalDashboard,
  getLicenciasGlobalDashboard,
};
