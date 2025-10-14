"use client";

import HubShell from "@/components/shared/HubShell";
import dashboardSections from "@/config/module/dashboardSections.config";

const DashboardClientePage = () => {
  return (
    <HubShell
      config={dashboardSections}
      title="Servicios disponibles"
      icon="🧭"
      subtitle="Selecciona el módulo que deseas revisar"
      showBack={false}
      theme="dashboard"
    />
  );
};

export default DashboardClientePage;
