import { DateRangePicker } from "@tremor/react";
import { es } from "date-fns/locale";

const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
export const dashboardFieldClass = "flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600";
export const dashboardControlClass =
  "min-h-[42px] w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-500";

export function DashboardHeader({ kind, title, description, children }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className={`${container} flex flex-col gap-5 py-7 lg:flex-row lg:items-end lg:justify-between`}>
        <div className="min-w-0">
          {kind && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">{kind}</p>}
          <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
        </div>
        {children && <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}

export function DashboardContext({ children }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
      {children}
    </span>
  );
}

export function DashboardBody({ children }) {
  return <div className={`${container} flex flex-col gap-6 py-6`}>{children}</div>;
}

export function DashboardFilters({ children, footer }) {
  return (
    <section aria-label="Filtros del dashboard" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,14rem),1fr))] gap-4">
        {children}
      </div>
      {footer && <div className="mt-4 border-t border-slate-200 pt-4">{footer}</div>}
    </section>
  );
}

export function DashboardPeriodFilter({ value, onChange }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold text-slate-600">Período</legend>
      <DateRangePicker
        value={value}
        onValueChange={onChange}
        locale={es}
        placeholder="Elegir fechas"
        enableSelect={false}
        enableClear
        className="w-full min-w-0"
      />
    </fieldset>
  );
}

export function DashboardStatus({ children, error = false }) {
  const colors = error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-slate-200 bg-white text-slate-600";
  return (
    <div role={error ? "alert" : "status"} className={`rounded-xl border px-4 py-5 text-sm ${colors}`}>
      {children}
    </div>
  );
}
