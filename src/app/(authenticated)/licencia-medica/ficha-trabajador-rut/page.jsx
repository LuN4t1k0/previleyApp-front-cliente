import dynamic from "next/dynamic";

const FichaTrabajadorDashboard = dynamic(() =>
  import("@/modules/trabajador/FichaTrabajadorDashboard")
);

const Page = () => {
  return <FichaTrabajadorDashboard />;
};

export default Page;
