// const adminSections = [
//     {
//     name: "Gestion de Usuarios",
//     description: "Administración de usuarios y roles.",
//     icon: "👤",
//     path: "/admin/gestion-usuarios",
//     roles: ["admin"],
//   },
//     {
//     name: "Gestion de Empresas",
//     description: "Gestión de datos de empresas.",
//     icon: "🏢",
//     path: "/admin/gestion-empresas",
//     roles: ["admin"],
//   },
//   {
//     name: "Contratos y Servicios",
//     description: "Gestión de contratos y servicios.",
//     icon: "🧳",
//     path: "/admin/contratos-servicios",
//     roles: ["admin"],
//   },

//   {
//     name: "Administrar Servicios",
//     description: "Creacion y configuración de servicios.",
//     icon: "🛎️",
//     path: "/admin/gestion-servicios",
//     roles: ["admin"],
//   },

//     {
//     name: "Administrar Credenciales",
//     description: "Storage de credenciales.",
//     icon: "🪪",
//     path: "/admin/gestion-credenciales",
//     roles: ["admin"],
//   },
//       {
//     name: "Administrar Documentos",
//     description: "Administrar poderes, RUT Electronicos ETC.",
//     icon: "📑",
//     path: "/admin/gestion-documentos",
//     roles: ["admin"],
//   },
//       {
//     name: "Administrar Comisiones",
//     description: "Configuración de servicios por empresa.",
//     icon: "💵",
//     path: "/admin/gestion-servicios",
//     roles: ["admin"],
//   },

  

// ];

// export default adminSections;


import adminModules from './adminModules.config';

const modulesArray = Object.values(adminModules);

const adminSections = [
  {
    title: "Administración",
    items: modulesArray.filter((mod) => mod.visible !== false),
  },
];

export default adminSections;
