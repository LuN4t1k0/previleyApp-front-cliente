"use client";

import { useSearchParams } from "next/navigation";
import useEmpresasPermitidas from "@/hooks/useEmpresasPermitidas";
import TrabajadorSkeleton from "@/components/skeleton/TrabajadorSkeleton";
import ConcliliacionGestion from "@/modules/conliliacion/ConciliacionGestion";
import FichaTrabajadorDashboard from "@/modules/trabajador/FichaTrabajadorDashboard";
import EmpresaLicenciasDashboard from "./EmpresaLicenciasDashboard";
import LicenciasGlobalDashboard from "./LicenciasGlobalDashboard";
import LicenciasSectionNav from "./LicenciasSectionNav";
import { resolveLicenciasSection, resolveRequiredEmpresa } from "@/services/licenciasWorkspace.mjs";

const LicenciasWorkspaceSection = ({ section }) => {
  const searchParams = useSearchParams();
  const canonical =
    section === "ficha-trabajador" ? section : resolveLicenciasSection(section);
  const requestedEmpresa = searchParams?.get("empresa") || "";
  const { empresas, loading } = useEmpresasPermitidas();

  if (!canonical) {
    return (
      <div className="p-6 text-sm text-rose-700">
        La sección solicitada no está disponible.
      </div>
    );
  }

  let content = null;
  if (canonical === "dashboard-analitico") {
    content = <LicenciasGlobalDashboard />;
  } else if (canonical === "dashboard-operativo") {
    if (loading) content = <TrabajadorSkeleton />;
    else {
      content = (
        <EmpresaLicenciasDashboard
          initialEmpresaRut={resolveRequiredEmpresa(empresas, requestedEmpresa)}
          requireExplicitSelection
        />
      );
    }
  } else if (canonical === "gestiones") {
    content = <ConcliliacionGestion />;
  } else if (canonical === "ficha-trabajador") {
    content = <FichaTrabajadorDashboard />;
  }

  return (
    <>
      <LicenciasSectionNav activeSection={canonical} />
      {content}
    </>
  );
};

export default LicenciasWorkspaceSection;

