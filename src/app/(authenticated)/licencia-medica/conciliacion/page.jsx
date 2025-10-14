import PageShell from "@/components/PageShell/PageShell";
import conciliacionTabsConfig from "@/config/module/conciliacion/pagexTabs";



const page = () => {

  return (
    <PageShell tabsConfig={conciliacionTabsConfig} moduleTitle="Licencias Médicas" />
  )
};

export default page;
