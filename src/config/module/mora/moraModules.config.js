const moraModules = {
  gestion: {
    name: "Gestión de Mora",
    description: "Administra casos y gestiona acciones operativas.",
    icon: "🗂️",
    path: "/servicios/mora-presunta?tab=gestion",
    roles: ["admin", "trabajador", "cliente"],
    category: "gestion",
    theme: "mora",
  },
  analisis: {
    name: "Dashboard Operativo",
    description: "Visualiza indicadores y analiza el comportamiento de la mora.",
    icon: "📊",
    path: "/servicios/mora-presunta?tab=dashboard-operativo",
    roles: ["admin", "trabajador"],
    category: "analitica",
    theme: "mora",
  },
};

export default moraModules;
