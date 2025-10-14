"use client";

import Link from "next/link";
import {
  footerContact,
  footerMeta,
  footerSections,
} from "@/config/footerLinks";

export default function AppFooter({ theme = "dashboard" }) {
  return (
    <footer className={`app-footer theme-${theme}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
        <div className="grid gap-6 text-sm text-[color:var(--text-secondary)] sm:grid-cols-3">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[color:var(--text-primary)]">
                {section.icon ? (
                  <section.icon className="h-4 w-4" aria-hidden="true" />
                ) : null}
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {section.title}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-xs font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--theme-primary)]"
                    >
                      {link.icon ? (
                        <link.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : null}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/50 bg-white/70 p-6 text-xs text-[color:var(--text-secondary)] shadow-sm backdrop-blur sm:grid-cols-3">
          {footerContact.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="font-semibold text-[color:var(--text-primary)]">
                {item.label}
              </span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-[color:var(--theme-primary)]"
                >
                  {item.icon ? (
                    <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : null}
                  {item.value}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {item.icon ? (
                    <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : null}
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/50 pt-4 text-center text-xs text-[color:var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>
            © {footerMeta.year} {footerMeta.company}. Todos los derechos
            reservados.
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {footerMeta.legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
