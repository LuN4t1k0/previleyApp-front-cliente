import EmpresaLicenciasDashboard from "@/modules/licencias/EmpresaLicenciasDashboard";
import LicenciasGlobalDashboard from "@/modules/licencias/LicenciasGlobalDashboard";

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
];

export default licenciasClientTabs;
