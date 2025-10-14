import dynamic from "next/dynamic";

const EmpresaLicenciasDashboard = dynamic(() =>
  import("@/modules/licencias/EmpresaLicenciasDashboard")
);

const Page = () => {
  return <EmpresaLicenciasDashboard />;
};

export default Page;
