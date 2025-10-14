"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { RiDoorOpenLine, RiMenuLine, RiCloseLine } from "@remixicon/react";
import { clientMenu } from "@/config/clientNavigation";

const initialsFromName = (nombre = "", apellido = "") => {
  const first = nombre?.trim()?.[0] || "";
  const last = apellido?.trim()?.[0] || "";
  return `${first}${last}`.toUpperCase() || "CL";
};

const ClientHeader = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menuItems = useMemo(() => clientMenu, []);

  const nombre = session?.user?.nombre || "";
  const apellido = session?.user?.apellido || "";

  const renderNavLink = (item) => {
    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-pill ${isActive ? "nav-pill--active" : ""}`}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="nav-shell sticky top-0 z-40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[color:var(--text-primary)]"
          >
            <span className="icon-chip h-10 w-10 text-base">🪴</span>
            <span>
              Previley
              <span className="ml-1 font-medium text-[color:var(--theme-primary)]">
                Clientes
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {menuItems.map((item) => renderNavLink(item))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-3 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--theme-soft)] text-sm font-semibold text-[color:var(--theme-primary)]">
              {initialsFromName(nombre, apellido)}
            </span>
            <span className="max-w-[160px] truncate">
              {nombre} {apellido}
            </span>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1 rounded-full border border-transparent bg-[color:var(--theme-primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--theme-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--theme-primary)] focus-visible:ring-offset-2"
          >
            <RiDoorOpenLine className="h-4 w-4" aria-hidden="true" />
            Salir
          </button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-full border border-white/60 bg-white/40 p-2 text-[color:var(--text-primary)] shadow-sm backdrop-blur md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Abrir menú"
        >
          {open ? (
            <RiCloseLine className="h-5 w-5" aria-hidden="true" />
          ) : (
            <RiMenuLine className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/60 bg-white/90 px-4 py-4 shadow-sm md:hidden">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => renderNavLink(item))}
          </nav>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--theme-soft)] text-sm font-semibold text-[color:var(--theme-primary)]">
                {initialsFromName(nombre, apellido)}
              </span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[color:var(--text-primary)]">
                  {nombre} {apellido}
                </span>
                <span className="text-[color:var(--text-secondary)]">
                  {session?.user?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-transparent bg-[color:var(--theme-primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--theme-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--theme-primary)] focus-visible:ring-offset-2"
            >
              <RiDoorOpenLine className="h-4 w-4" aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ClientHeader;
