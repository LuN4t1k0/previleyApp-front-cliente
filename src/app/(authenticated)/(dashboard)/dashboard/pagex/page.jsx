import HubShell from "@/components/shared/HubShell";
import pagexSections from "@/config/module/pagex/pagexSections.config.js";

export default function PagexDashboardHub() {
  return (
    <HubShell
      config={pagexSections}
      title="Pagos en Exceso"
      icon="💸"
      subtitle="Accede al dashboard operativo o a las herramientas de gestión para tus pagos en exceso."
      showBack
      theme="pagex"
    />
  );
}
