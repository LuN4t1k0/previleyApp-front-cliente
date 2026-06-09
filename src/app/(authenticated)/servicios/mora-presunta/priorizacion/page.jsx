import dynamic from "next/dynamic";

const MoraPriorizacionCliente = dynamic(() =>
  import("@/modules/morasPresuntas/MoraPriorizacionCliente")
);

export const metadata = {
  title: "Priorización de mora presunta",
  description: "Seguimiento cliente de prioridades de mora presunta.",
};

const MoraPresuntaPriorizacionPage = () => <MoraPriorizacionCliente />;

export default MoraPresuntaPriorizacionPage;
