export const STANDARD_SERVICE_SECTIONS = Object.freeze([
  Object.freeze({ key: "dashboard-analitico", label: "Dashboard Analítico" }),
  Object.freeze({ key: "dashboard-operativo", label: "Dashboard Operativo" }),
  Object.freeze({ key: "gestiones", label: "Gestiones" }),
]);

export const CLIENT_SERVICE_WORKSPACES = Object.freeze({
  "licencias-medicas": Object.freeze({
    key: "licencias",
    slug: "licencias-medicas",
    title: "Licencias Médicas",
    contractKeys: Object.freeze(["licencias", "adml", "rsil"]),
    sections: STANDARD_SERVICE_SECTIONS,
  }),
});

export const getClientServiceWorkspace = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;

  return (
    CLIENT_SERVICE_WORKSPACES[normalized] ||
    Object.values(CLIENT_SERVICE_WORKSPACES).find(
      (workspace) =>
        workspace.key === normalized || workspace.contractKeys.includes(normalized)
    ) ||
    null
  );
};

