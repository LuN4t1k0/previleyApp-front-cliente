// const facturacionSections = [

//   {
//     name: "Pre-factura",
//     description: "Detalle de facturas emitidas y pendientes.",
//     icon: "🧾",
//     path: "/prefactura",
//     roles: ["admin"],
//   },
//     {
//     name: "Facturación",
//     description: "Detalle de facturas emitidas y pendientes.",
//     icon: "🧾",
//     path: "/facturacion",
//     roles: ["admin"],
//   },
//   {
//     name: "Comisiones",
//     description: "Cálculo y asignación de comisiones por trabajador.",
//     icon: "💸",
//     path: "/comisiones",
//     roles: ["admin"],
//   },
// ];

// export default facturacionSections;


import facturacionModules from './facturacionModules.config';

const modulesArray = Object.values(facturacionModules);

const facturacionSections = [
  {
    title: "Facturación",
    items: modulesArray.filter((mod) => mod.visible !== false),
  },
];

export default facturacionSections;
