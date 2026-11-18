import { Suspense } from "react";
import LicenciasWorkspaceSection from "@/modules/licencias/LicenciasWorkspaceSection";

export const metadata = {
  title: "Dashboard Analítico | Licencias Médicas",
};

export default function LicenciasAnaliticoPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Cargando dashboard analítico…</p>}>
      <LicenciasWorkspaceSection section="dashboard-analitico" />
    </Suspense>
  );
}

