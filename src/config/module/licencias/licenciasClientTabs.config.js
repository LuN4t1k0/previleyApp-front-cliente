import EmpresaLicenciasDashboard from "@/modules/licencias/EmpresaLicenciasDashboard";
import LicenciasGlobalDashboard from "@/modules/licencias/LicenciasGlobalDashboard";
import ConcliliacionGestion from "@/modules/conliliacion/ConciliacionGestion";
import FichaTrabajadorDashboard from "@/modules/trabajador/FichaTrabajadorDashboard";

const licenciasClientTabs = [
  {
    key: "dashboard-global",
    label: "Dashboard Global",
    component: <LicenciasGlobalDashboard />,
    rolesAllowed: ["cliente"],
  },
  {
    key: "dashboard-operativo",
    label: "Dashboard Operativo",
    component: <EmpresaLicenciasDashboard />,
    rolesAllowed: ["cliente"],
  },
  {
    key: "gestiones",
    label: "Gestiones",
    component: <ConcliliacionGestion />,
    rolesAllowed: ["cliente"],
  },
  {
    key: "ficha-trabajador",
    label: "Ficha Trabajador",
    component: <FichaTrabajadorDashboard />,
    rolesAllowed: ["cliente"],
  },
];

export default licenciasClientTabs;
