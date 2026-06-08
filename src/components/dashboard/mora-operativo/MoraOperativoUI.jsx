"use client";

import { RiArrowRightSLine } from "@remixicon/react";

export const SectionCard = ({ children, className = "" }) => (
  <section className={`overflow-hidden rounded-lg border border-indigo-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
);

export const SectionHeader = ({ title, description, badge, icon: Icon }) => (
  <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex gap-3">
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-950">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <div>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p> : null}
      </div>
    </div>
    {badge ? (
      <span className="w-fit rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-800">
        {badge}
      </span>
    ) : null}
  </div>
);

export const RiskPill = ({ level }) => {
  const normalized = String(level || "bajo").toLowerCase();
  const config = {
    alto: "border-red-200 bg-red-100 text-red-950",
    medio: "border-amber-200 bg-amber-100 text-amber-950",
    bajo: "border-emerald-200 bg-emerald-100 text-emerald-950",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${config[normalized] || config.bajo}`}>
      {normalized}
    </span>
  );
};

export const ActionButton = ({ children = "Focalizar", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
  >
    {children}
    <RiArrowRightSLine className="h-4 w-4" aria-hidden="true" />
  </button>
);

export const EmptyState = ({ message }) => (
  <div className="rounded-lg border border-dashed border-indigo-200 p-5 text-sm text-slate-500">
    {message}
  </div>
);
