import dynamic from "next/dynamic";

const LicenciasGlobalDashboard = dynamic(() =>
  import("@/modules/licencias/LicenciasGlobalDashboard")
);

const Page = () => {
  return <LicenciasGlobalDashboard />;
};

export default Page;
