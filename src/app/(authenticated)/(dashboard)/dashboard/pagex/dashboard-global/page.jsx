import dynamic from "next/dynamic";

const PagexGlobalDashboard = dynamic(() =>
  import("@/modules/pagex/PagexGlobalDashboard")
);

const Page = () => {
  return <PagexGlobalDashboard />;
};

export default Page;
