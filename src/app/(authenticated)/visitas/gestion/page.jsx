"use client";

import VisitasGestion from "@/modules/visitas/VisitasGestion";

export default function GestionVisitasPage() {
  return (
    <section className="theme-visitas">
      <div className="dashboard-gradient min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <VisitasGestion />
        </div>
      </div>
    </section>
  );
}
