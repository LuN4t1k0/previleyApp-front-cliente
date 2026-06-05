import dynamic from "next/dynamic";

const MoraOperativaDashboard = dynamic(() =>
  import("@/modules/morasPresuntas/MoraOperativaDashboard")
);

export const metadata = {
  title: "Dashboard Operativo | Mora Presunta",
  description:
    "Vista operativa por empresa para priorizar entidades, gestiones y recuperaciones.",
};

const MoraPresuntaDashboardOperativoPage = () => <MoraOperativaDashboard />;

export default MoraPresuntaDashboardOperativoPage;
