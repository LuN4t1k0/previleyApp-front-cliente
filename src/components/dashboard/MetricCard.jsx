"use client";

const toneBorders = {
  primary: "border-[color:var(--theme-primary)]/30",
  success: "border-emerald-200",
  warning: "border-amber-200",
  info: "border-indigo-200",
  neutral: "border-slate-200",
};

const MetricCard = ({
  label,
  value,
  helperText,
  tone = "primary",
  icon,
}) => {
  const borderClass = toneBorders[tone] || toneBorders.primary;

  return (
    <article className={`flex flex-1 items-start justify-between gap-4 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur ${borderClass}`}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[color:var(--text-secondary)]">
          {label}
        </span>
        <span className="text-2xl font-semibold text-[color:var(--text-primary)]">
          {value}
        </span>
        {helperText ? (
          <span className="text-xs text-[color:var(--text-secondary)]">
            {helperText}
          </span>
        ) : null}
      </div>
      {icon ? (
        <span className="icon-chip h-10 w-10 text-base text-[color:var(--theme-primary)]">
          {icon}
        </span>
      ) : null}
    </article>
  );
};

export default MetricCard;
