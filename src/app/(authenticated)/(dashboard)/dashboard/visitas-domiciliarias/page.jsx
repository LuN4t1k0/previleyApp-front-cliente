import visitasSections from "@/config/module/visitas/visitasSections.config";
import HubShell from "@/components/shared/HubShell";

export default function VisitasDashboardPage() {
  return (
    <HubShell
      config={visitasSections}
      title="Visitas domiciliarias"
      icon="🏠"
      subtitle="Selecciona la sección que necesitas para gestionar o completar visitas."
      showBack={true}
      theme="visitas"
    />
  );
}
