import dynamic from "next/dynamic";

const MoraGlobalDashboard = dynamic(() =>
  import("@/modules/morasPresuntas/MoraGlobalDashboard")
);

const Page = () => {
  return <MoraGlobalDashboard />;
};

export default Page;
