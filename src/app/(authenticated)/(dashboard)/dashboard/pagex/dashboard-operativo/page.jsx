import dynamic from "next/dynamic";

const PagexDashboard = dynamic(() => import("@/modules/pagex/PagexDashboard"));

const Page = () => {
  return <PagexDashboard />;
};

export default Page;
