import dynamic from "next/dynamic";

const MoraPriorizacionCliente = dynamic(() =>
  import("@/modules/morasPresuntas/MoraPriorizacionCliente")
);

export const metadata = {
  title: "Plan de trabajo de mora presunta",
  description: "Seguimiento cliente del plan de trabajo de mora presunta.",
};

const MoraPresuntaPriorizacionPage = () => <MoraPriorizacionCliente />;

export default MoraPresuntaPriorizacionPage;
