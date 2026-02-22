export const clientMenu = [
  {
    label: "Inicio",
    description: "Resumen general y actividad reciente.",
    href: "/dashboard",
  },
  {
    label: "Dashboards",
    description: "Accede a los dashboards de cada servicio contratado.",
    href: "/servicios",
  },
  {
    label: "Prefacturas",
    description: "Panel de seguimiento de prefacturas.",
    href: "/prefacturas",
  },
  {
    label: "Reportes",
    description: "Genera reportes dinámicos y exporta datos.",
    href: "/dashboard/reportes",
  },
  {
    label: "Documentos",
    description: "Centro de documentos y respaldos.",
    href: "/documentos",
  },
  {
    label: "Perfil",
    description: "Tus datos de contacto y ajustes de cuenta.",
    href: "/perfil",
  },
  {
    label: "Usuarios",
    description: "Gestiona subusuarios y permisos del tenant.",
    href: "/client-admin",
    roles: ["cliente_admin"],
  },
];
