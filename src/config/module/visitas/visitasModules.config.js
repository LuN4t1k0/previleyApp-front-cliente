const visitasModules = {
  misVisitas: {
    name: "Mis visitas",
    description: "Completa rápidamente las visitas asignadas en terreno.",
    icon: "🚶‍♂️",
    path: "/mis-visitas",
    roles: ["trabajador", "supervisor", "admin"],
    category: "operacion",
    theme: "visitas",
    highlight: true,
    badge: {
      label: "Visitadores",
      color: "orange",
    },
  },
  gestion: {
    name: "Gestión de visitas",
    description: "Planifica y administra las visitas domiciliarias asignadas.",
    icon: "📋",
    path: "/visitas/gestion",
    roles: ["admin", "supervisor", "trabajador", "cliente"],
    category: "gestion",
    theme: "visitas",
  },
  detalle: {
    name: "Detalle de visitas",
    description: "Revisa el estado de cada visita y actualiza sus resultados.",
    icon: "👣",
    path: "/visitas/detalle",
    roles: ["admin", "supervisor", "trabajador", "cliente"],
    category: "gestion",
    theme: "visitas",
  },
  dashboard: {
    name: "Dashboard",
    description: "Indicadores clave de visitas y cobertura por empresa.",
    icon: "📊",
    path: "/visitas/dashboard-operativo",
    roles: ["admin", "supervisor", "trabajador"],
    category: "analitica",
    theme: "visitas",
  },
};

export default visitasModules;
