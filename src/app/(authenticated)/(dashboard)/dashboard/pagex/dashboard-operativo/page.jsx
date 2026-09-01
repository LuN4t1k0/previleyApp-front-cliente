import dynamic from "next/dynamic";

const PagexOperativaDashboard = dynamic(() =>
  import("@/modules/pagex/PagexOperativaDashboard")
);

const Page = () => {
  return <PagexOperativaDashboard />;
};

export default Page;
