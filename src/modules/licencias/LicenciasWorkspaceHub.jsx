import ServiceHub from "@/components/dashboard/ServiceHub";
import {
  RiDashboardLine,
  RiFileList3Line,
  RiUserLine,
} from "@remixicon/react";
import { getLicenciasWorkspaceLinks } from "@/services/licenciasWorkspace.mjs";

const icons = {
  "dashboard-analitico": RiDashboardLine,
  "dashboard-operativo": RiDashboardLine,
  gestiones: RiFileList3Line,
  "ficha-trabajador": RiUserLine,
};

const descriptions = {
  "dashboard-analitico":
    "Revisa indicadores consolidados, empresas, estados y evolución del servicio.",
  "dashboard-operativo":
    "Selecciona una empresa y analiza licencias, ausentismo, saldos y prioridades.",
  gestiones:
    "Consulta expedientes, aplica filtros y descarga el detalle de cada gestión.",
  "ficha-trabajador":
    "Consulta el historial y resumen autorizado de una persona específica.",
};

const tones = {
  "dashboard-analitico": "border-t-red-500",
  "dashboard-operativo": "border-t-emerald-500",
  gestiones: "border-t-blue-500",
  "ficha-trabajador": "border-t-amber-500",
};

const LicenciasWorkspaceHub = () => {
  const links = getLicenciasWorkspaceLinks();
  const cards = [...links.sections, ...links.complementary].map((item) => ({
    title: item.label,
    href: item.href,
    icon: icons[item.key] || RiDashboardLine,
    description: descriptions[item.key],
    tone: tones[item.key],
  }));
  return <ServiceHub title="Licencias Médicas" cards={cards} />;
};

export default LicenciasWorkspaceHub;
