const licenciasModules = {
  anticipos: {
    name: "Anticipos",
    description: "Gestión de pagos anticipados por licencia.",
    icon: "💰",
    path: "/licencia-medica/anticipos",
    roles: ["admin", "trabajador", "cliente"],
    category: "licencias",
  },
  licencias: {
    name: "Licencias Médicas",
    description: "Revisión y validación de licencias laborales.",
    icon: "🏥",
    path: "/licencia-medica/licencias-medicas",
    roles: ["admin", "trabajador", "cliente"],
    category: "licencias",
  },
  resumenTrabajadorRut: {
    name: "Ficha por RUT",
    description: "Consulta integral de licencias, anticipos y subsidios por trabajador Rut.",
    icon: "🧑‍⚕️",
    path: "/licencia-medica/ficha-trabajador-rut",
    roles: ["admin", "trabajador", "cliente"],
    category: "licencias",
  },
  resumenEmpresa: {
    name: "Ficha por Empresa",
    description: "Consolidado de licencias, anticipos y subsidios por empresa.",
    icon: "🏢",
    path: "/licencia-medica/ficha-empresa",
    roles: ["admin", "trabajador", "cliente"],
    category: "licencias",
  },
  subsidios: {
    name: "Subsidios",
    description: "Seguimiento de subsidios emitidos.",
    icon: "🧾",
    path: "/licencia-medica/subsidios",
    roles: ["admin", "trabajador", "cliente"],
    category: "licencias",
  },
   conciliacion: {
    name: "Conciliación",
    description: "Seguimiento de subsidios emitidos.",
    icon: "🧾",
    path: "/licencia-medica/conciliacion",
    roles: ["admin", "trabajador", "cliente"],
    category: "admin",
  },
};

export default licenciasModules;
