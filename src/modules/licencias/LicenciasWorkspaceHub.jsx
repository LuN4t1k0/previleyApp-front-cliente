import Link from "next/link";
import {
  RiArrowRightLine,
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

const HubCard = ({ item, complementary = false }) => {
  const Icon = icons[item.key] || RiDashboardLine;
  return (
    <Link
      href={item.href}
      className="group flex min-h-56 flex-col rounded-lg border border-slate-200 border-t-4 border-t-blue-600 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {complementary ? "Acceso complementario" : "Sección estándar"}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{item.label}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{descriptions[item.key]}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-blue-700">
        Ingresar
        <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
};

const LicenciasWorkspaceHub = () => {
  const links = getLicenciasWorkspaceLinks();
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-slate-200 bg-white px-6 py-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Servicio contratado
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
            Licencias Médicas
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Accede a resultados consolidados, seguimiento por empresa y expedientes desde
            una estructura común.
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {links.sections.map((item) => (
            <HubCard key={item.key} item={item} />
          ))}
        </section>

        <section className="mt-8 max-w-md">
          {links.complementary.map((item) => (
            <HubCard key={item.key} item={item} complementary />
          ))}
        </section>
      </div>
    </main>
  );
};

export default LicenciasWorkspaceHub;

