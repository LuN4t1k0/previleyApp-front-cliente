import { Suspense } from "react";
import LicenciasWorkspaceSection from "@/modules/licencias/LicenciasWorkspaceSection";

export const metadata = {
  title: "Ficha Trabajador | Licencias Médicas",
};

export default function LicenciasFichaTrabajadorPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Cargando ficha del trabajador…</p>}>
      <LicenciasWorkspaceSection section="ficha-trabajador" />
    </Suspense>
  );
}

