const moraModules = {
  dashboardGlobal: {
    name: "Dashboard Global",
    description: "Consolida métricas multi-empresa y permite comparar resultados.",
    icon: "🌐",
    path: "/dashboard/mora-presunta/dashboard-global",
    roles: ["cliente"],
    category: "analitica",
    theme: "mora",
  },
  dashboardOperativo: {
    name: "Dashboard Operativo",
    description: "Indicadores y seguimiento por empresa específica.",
    icon: "📊",
    path: "/dashboard/mora-presunta/dashboard-operativo",
    roles: ["cliente"],
    category: "analitica",
    theme: "mora",
  },
};

export default moraModules;
