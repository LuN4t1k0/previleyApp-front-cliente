import PagexAnaliticoDashboard from "@/modules/pagex/PagexAnaliticoDashboard";
import PagexGestionesDashboard from "@/modules/pagex/PagexGestionesDashboard";
import PagexOperativaDashboard from "@/modules/pagex/PagexOperativaDashboard";

const pagexTabsConfig = [
  {
    key: "dashboard-global",
    label: "Dashboard Analítico",
    component: <PagexAnaliticoDashboard />,
    rolesAllowed: ["cliente"],
  },
  {
    key: "dashboard-operativo",
    label: "Dashboard Operativo",
    component: <PagexOperativaDashboard />,
    rolesAllowed: ["cliente"],
  },
  {
    key: "gestiones",
    label: "Gestiones",
    component: <PagexGestionesDashboard />,
    rolesAllowed: ["cliente"],
  },
];

export default pagexTabsConfig;
