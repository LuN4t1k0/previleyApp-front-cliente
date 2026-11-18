import { Suspense } from "react";
import LicenciasWorkspaceSection from "@/modules/licencias/LicenciasWorkspaceSection";

export const metadata = {
  title: "Gestiones | Licencias Médicas",
};

export default function LicenciasGestionesPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Cargando gestiones…</p>}>
      <LicenciasWorkspaceSection section="gestiones" />
    </Suspense>
  );
}

