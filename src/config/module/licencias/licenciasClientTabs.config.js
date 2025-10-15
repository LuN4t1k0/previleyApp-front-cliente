import EmpresaLicenciasDashboard from "@/modules/licencias/EmpresaLicenciasDashboard";
import FichaTrabajadorDashboard from "@/modules/trabajador/FichaTrabajadorDashboard";

const licenciasClientTabs = [
  {
    key: "resumen-empresa",
    label: "Resumen por Empresa",
    component: <EmpresaLicenciasDashboard />,
    rolesAllowed: ["admin", "trabajador", "cliente"],
  },
  {
    key: "ficha-trabajador",
    label: "Ficha por RUT",
    component: <FichaTrabajadorDashboard />,
    rolesAllowed: ["admin", "trabajador", "cliente"],
  },
];

export default licenciasClientTabs;
