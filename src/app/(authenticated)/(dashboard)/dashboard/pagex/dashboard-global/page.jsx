import dynamic from "next/dynamic";

const PagexAnaliticoDashboard = dynamic(() =>
  import("@/modules/pagex/PagexAnaliticoDashboard")
);

const Page = () => {
  return <PagexAnaliticoDashboard />;
};

export default Page;
