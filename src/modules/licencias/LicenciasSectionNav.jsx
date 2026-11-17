"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLicenciasWorkspaceLinks } from "@/services/licenciasWorkspace.mjs";

const LicenciasSectionNav = ({ activeSection }) => {
  const pathname = usePathname();
  const links = getLicenciasWorkspaceLinks();

  return (
    <nav
      aria-label="Secciones de Licencias Médicas"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {links.sections.map((item) => {
          const isActive = activeSection
            ? activeSection === item.key
            : pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <span className="mx-1 w-px shrink-0 bg-slate-200" aria-hidden="true" />
        {links.complementary.map((item) => {
          const isActive = activeSection
            ? activeSection === item.key
            : pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default LicenciasSectionNav;

