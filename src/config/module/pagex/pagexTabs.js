import PagexDashboard from "@/modules/pagex/PagexDashboard";
import PagexDetalle from "@/modules/pagex/PagexDetalle";
import PagexGestion from "@/modules/pagex/PagexGestion";

const pagexTabsConfig = [
  {
    key: "dashboard",
    label: "Dashboard",
    component: <PagexDashboard />,
    rolesAllowed: ["admin", "trabajador", "cliente"],
  },
  {
    key: "gestion",
    label: "Gestiones",
    component: <PagexGestion />,
    rolesAllowed: ["admin", "trabajador", "cliente"],
  },
  {
    key: "detalle",
    label: "Detalle",
    component: <PagexDetalle />,
    rolesAllowed: ["admin", "trabajador", "cliente"],
  },
];

export default pagexTabsConfig;
