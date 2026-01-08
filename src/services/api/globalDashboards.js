const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const requestGlobalDashboard = async (path, params = {}) => {
  const response = await fetch(`/api/${path}${buildQueryString(params)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "No fue posible obtener el dashboard global.");
  }

  return data?.data ?? data;
};

export const getMoraGlobalDashboard = (params) =>
  requestGlobalDashboard("mora/global", params);

export const getPagexGlobalDashboard = (params) =>
  requestGlobalDashboard("pagex/global", params);

export const getLicenciasGlobalDashboard = (params) =>
  requestGlobalDashboard("licencias/global", params);

export default {
  getMoraGlobalDashboard,
  getPagexGlobalDashboard,
  getLicenciasGlobalDashboard,
};
