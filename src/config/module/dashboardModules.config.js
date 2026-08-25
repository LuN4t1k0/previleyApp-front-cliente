
const dashboardModules = {
  produccion: {
    name: "Producción",
    description: "Visualiza y administra la producción generada.",
    icon: "📊",
    path: "/produccion",
    roles: ["admin", "trabajador", "supervisor", "facturacion"],
    category: "admin",
    highlight: false,
    badge: { label: "Actualizado", color: "green" },
    theme: "dashboard",
  },

  facturacion: {
    name: "Facturación",
    description: "Revisión de facturas emitidas.",
    icon: "🧾",
    path: "/dashboard/facturacion",
    roles: ["admin", "facturacion"],
    category: "admin",
    badge: { label: "Beta", color: "blue" },
    theme: "dashboard",
  },

  administracion: {
    name: "Administración",
    description: "Panel central de gestión y configuración avanzada.",
    icon: "🛠️",
    path: "/dashboard/administracion",
    roles: ["admin", "trabajador", "facturacion"],
    category: "admin",
    visible: true,
    badge: { label: "Limitado", color: "orange" },
    theme: "dashboard",
  },

  morasPresuntas: {
    name: "Moras Presuntas",
    description: "Gestión y seguimiento de casos de mora previsional.",
    icon: "📦",
    path: "/dashboard/mora-presunta",
    roles: ["admin", "cliente", "trabajador"],
    category: "servicio",
    badge: { label: "Actualizado", color: "green" },
    theme: "mora",
  },

  licencias: {
    name: "Licencias Médicas",
    description: "Revisa y administra licencias laborales.",
    icon: "🏥",
    path: "/dashboard/licencia-medica",
    roles: ["admin", "cliente", "trabajador"],
    category: "servicio",
    badge: { label: "Nuevo", color: "purple" },
    theme: "licencias",
  },

  pagex: {
    name: "Pagos en Exceso",
    description: "Recuperación de pagos previsionales mal aplicados.",
    icon: "💸",
    path: "/dashboard/pagex",
    roles: ["admin", "cliente", "trabajador"],
    category: "servicio",
    highlight: false,
    badge: { label: "Nuevo", color: "purple" },
    theme: "pagex",
  },

  reportes: {
    name: "Reportes Dinámicos",
    description: "Construye reportes ad-hoc y exporta CSV/XLSX.",
    icon: "🧾",
    path: "/dashboard/reportes",
    roles: ["admin", "trabajador", "cliente", "supervisor"],
    category: "servicio",
    theme: "dashboard",
  },

  // PROXIMAMENTE :
  pagosPrevisionales: {
    name: "Pagos Previsionales",
    description: "Gestión y validación de pagos previsionales mensuales.",
    icon: "📥",
    path: "/servicios/pagos-previsionales",
    roles: ["admin", "cliente", "trabajador"],
    category: "servicio",
    badge: { label: "En Desarrollo", color: "blue" },
    theme: "dashboard",
  },

  reembolsoSil: {
    name: "Reembolso SIL",
    description: "Solicitudes de reembolso al seguro de incapacidad laboral.",
    icon: "♻️",
    path: "/servicios/reembolso-sil",
    roles: ["admin", "cliente"],
    category: "servicio",
    badge: { label: "En Desarrollo", color: "blue" },
    theme: "dashboard",
  },

  cargasFamiliares: {
    name: "Cargas Familiares",
    description: "Administración y revisión de cargas familiares.",
    icon: "👨‍👩‍👧‍👦",
    path: "/servicios/cargas-familiares",
    roles: ["admin", "cliente", "trabajador"],
    category: "servicio",
    badge: { label: "En Desarrollo", color: "blue" },
    theme: "dashboard",
  },

  funes: {
    name: "FUNES",
    description: "Gestión del Fondo Único de Enfermedades de Salud.",
    icon: "🧬",
    path: "/servicios/funes",
    roles: ["admin"],
    category: "servicio",
    badge: { label: "En Desarrollo", color: "blue" },
    theme: "dashboard",
  },

  depositosConvenidos: {
    name: "Depósitos Convenidos",
    description: "Seguimiento y conciliación de depósitos previsionales convenidos.",
    icon: "🏦",
    path: "/servicios/depositos-convenidos",
    roles: ["admin", "cliente"],
    category: "servicio",
    badge: { label: "En Desarrollo", color: "blue" },
    theme: "dashboard",
  },

  visitasDomiciliarias: {
    name: "Visitas Domiciliarias",
    description: "Gestión de visitas de verificación en terreno.",
    icon: "🚗",
    path: "/dashboard/visitas-domiciliarias",
    roles: ["admin", "trabajador", "supervisor"],
    category: "servicio",
    badge: { label: "Nuevo", color: "orange" },
    theme: "visitas",
  },

};
export default dashboardModules;


// 🏷️ Opciones de badge para módulos:
// { label: "Nuevo", color: "green" }
// { label: "Beta", color: "yellow" }
// { label: "En Desarrollo", color: "blue" }
// { label: "Próximamente", color: "gray" }
// { label: "Detenido", color: "red" }
// { label: "Actualizado", color: "indigo" }
// { label: "Favorito", color: "pink" }
// { label: "Limitado", color: "orange" }
// { label: "Migrando", color: "purple" }
// { label: "Experimental", color: "amber" }
