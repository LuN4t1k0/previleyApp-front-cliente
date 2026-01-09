"use client";

import VisitasDetalle from "@/modules/visitas/VisitasDetalle";

export default function DetalleVisitasPage() {
  return (
    <section className="pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 md:px-6">
        <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-orange-600">
            Visitas
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Detalle de visita
          </h1>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)] sm:text-base">
            Consulta antecedentes y resultados asociados a cada visita.
          </p>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
        </header>

        <div className="glass-panel rounded-[2rem] p-6">
          <VisitasDetalle />
        </div>
      </div>
    </section>
  );
}
