const moraModules = {
  dashboardGlobal: {
    name: "Dashboard Analítico",
    description: "Consolida métricas multi-empresa, riesgo, recuperación y prioridades.",
    icon: "🌐",
    path: "/servicios/mora-presunta/dashboard-analitico",
    roles: ["cliente"],
    category: "analitica",
    theme: "mora",
  },
  dashboardOperativo: {
    name: "Dashboard Operativo",
    description: "Indicadores, filtros y seguimiento operativo por empresa específica.",
    icon: "📊",
    path: "/servicios/mora-presunta/dashboard-operativo",
    roles: ["cliente"],
    category: "analitica",
    theme: "mora",
  },
  priorizacion: {
    name: "Priorización",
    description: "Orden vigente de focos pendientes priorizados por periodo.",
    icon: "📌",
    path: "/servicios/mora-presunta/priorizacion",
    roles: ["cliente"],
    category: "operacion",
    theme: "mora",
  },
};

export default moraModules;
