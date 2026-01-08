import dynamic from "next/dynamic";

const MoraOperativaDashboard = dynamic(() =>
  import("@/modules/morasPresuntas/MoraOperativaDashboard")
);

const Page = () => {
  return <MoraOperativaDashboard />;
};

export default Page;
