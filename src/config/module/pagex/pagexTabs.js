import PagexDashboard from "@/modules/pagex/PagexDashboard";
import PagexGlobalDashboard from "@/modules/pagex/PagexGlobalDashboard";

const pagexTabsConfig = [
  {
    key: "dashboard-global",
    label: "Dashboard Global",
    component: <PagexGlobalDashboard />,
    rolesAllowed: ["cliente"],
  },
  {
    key: "dashboard-operativo",
    label: "Dashboard Operativo",
    component: <PagexDashboard />,
    rolesAllowed: ["cliente"],
  },
];

export default pagexTabsConfig;
