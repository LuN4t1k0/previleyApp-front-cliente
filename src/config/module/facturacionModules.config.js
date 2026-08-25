const facturacionModules = {
  resumen: {
    name: "Pre-factura",
    description: "Detalle de facturas emitidas y pendientes.",
    icon: "📄",
    path: "/prefactura",
    roles: ["admin", "facturacion"],
    category: "facturacion",
    badge: { label: "Beta", color: "blue" },
  },
  detalle: {
    name: "Facturación",
    description: "Detalle de facturas emitidas y pendientes.",
    icon: "📑",
    path: "/facturacion",
    roles: ["admin", "facturacion"],
    category: "facturacion",
  },
  anticipos: {
    name: "Comisiones",
    description: "Cálculo y asignación de comisiones por trabajador.",
    icon: "💰",
    path: "/comisiones",
    roles: ["admin"],
    category: "facturacion",
  },
};

export default facturacionModules;
