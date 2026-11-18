import { Suspense } from "react";
import LicenciasWorkspaceSection from "@/modules/licencias/LicenciasWorkspaceSection";

export const metadata = {
  title: "Dashboard Operativo | Licencias Médicas",
};

export default function LicenciasOperativoPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Cargando dashboard operativo…</p>}>
      <LicenciasWorkspaceSection section="dashboard-operativo" />
    </Suspense>
  );
}

