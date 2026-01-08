const pagexModules = {
  dashboardGlobal: {
    name: "Dashboard Global",
    description: "Panorama consolidado de todas las empresas asignadas.",
    icon: "🌐",
    path: "/dashboard/pagex/dashboard-global",
    roles: ["cliente"],
    category: "operacion",
    theme: "pagex",
  },
  dashboardOperativo: {
    name: "Dashboard Operativo",
    description:
      "Consulta indicadores de recuperación y saldos pendientes por empresa.",
    icon: "📊",
    path: "/dashboard/pagex/dashboard-operativo",
    roles: ["cliente"],
    category: "operacion",
    theme: "pagex",
  },
};

export default pagexModules;
