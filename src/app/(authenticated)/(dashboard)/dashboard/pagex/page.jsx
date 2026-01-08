import HubShell from "@/components/shared/HubShell";
import pagexSections from "@/config/module/pagex/pagexSections.config.js";

export default function PagexDashboardHub() {
  return (
    <HubShell
      config={pagexSections}
      title="Pagos en Exceso"
      icon="💸"
      subtitle="Elige entre el dashboard global o el dashboard operativo."
      showBack
      theme="pagex"
    />
  );
}
