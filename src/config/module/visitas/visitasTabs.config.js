import dynamic from "next/dynamic";

const GestionVisitas = dynamic(() => import("@/modules/visitas/VisitasGestion"), {
  ssr: false,
});
const DetalleVisitas = dynamic(() => import("@/modules/visitas/VisitasDetalle"), {
  ssr: false,
});
const VisitasDashboard = dynamic(() => import("@/modules/visitas/VisitasDashboard"), {
  ssr: false,
});

const visitasTabsConfig = [
  {
    key: "gestion",
    label: "Gestiones",
    component: <GestionVisitas />,
    rolesAllowed: ["admin", "supervisor", "trabajador", "cliente"],
  },
  {
    key: "detalle",
    label: "Detalle",
    component: <DetalleVisitas />,
    rolesAllowed: ["admin", "supervisor", "trabajador", "cliente"],
  },
  {
    key: "dashboard",
    label: "Dashboard",
    component: <VisitasDashboard />,
    rolesAllowed: ["admin", "supervisor", "trabajador"],
  },
];

export default visitasTabsConfig;
