"use client";

import { getPrefacturaStatusMeta } from "@/utils/prefacturas";

const toneStyles = {
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  warning:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  info: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  error: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  neutral: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const StatusPill = ({ estado }) => {
  const { label, tone } = getPrefacturaStatusMeta(estado);
  const classes = toneStyles[tone] || toneStyles.neutral;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
};

export default StatusPill;
