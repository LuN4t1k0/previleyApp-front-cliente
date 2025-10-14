"use client";

import VisitasDetalle from "@/modules/visitas/VisitasDetalle";

export default function DetalleVisitasPage() {
  return (
    <section className="theme-visitas">
      <div className="dashboard-gradient min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <VisitasDetalle />
        </div>
      </div>
    </section>
  );
}
