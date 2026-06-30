import dynamic from "next/dynamic";

const MoraGlobalDashboard = dynamic(() =>
  import("@/modules/morasPresuntas/MoraGlobalDashboard")
);

export const metadata = {
  title: "Dashboard Analítico | Mora Presunta",
  description:
    "Vista analítica consolidada de deuda, recuperación y riesgo de Mora Presunta.",
};

const MoraPresuntaDashboardAnaliticoPage = () => <MoraGlobalDashboard />;

export default MoraPresuntaDashboardAnaliticoPage;
