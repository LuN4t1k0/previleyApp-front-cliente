const pagexModules = {
  dashboard: {
    name: "Dashboard Operativo",
    description:
      "Consulta los indicadores de recuperación y los saldos pendientes de pagos en exceso.",
    icon: "📊",
    path: "/servicios/pagos-en-exceso",
    roles: ["admin", "trabajador", "cliente"],
    category: "operacion",
    theme: "pagex",
  },
  gestion: {
    name: "Gestión de Pagex",
    description: "Administra gestiones y revisa el estado de cada caso en detalle.",
    icon: "🗂️",
    path: "/servicios/pagex?tab=gestion",
    roles: ["admin", "trabajador", "cliente"],
    category: "gestion",
    theme: "pagex",
  },
  detalle: {
    name: "Detalle de Gestiones",
    description: "Explora el registro completo de pagos y movimientos asociados a Pagex.",
    icon: "📄",
    path: "/servicios/pagex?tab=detalle",
    roles: ["admin", "trabajador", "cliente"],
    category: "gestion",
    theme: "pagex",
  },
};

export default pagexModules;
