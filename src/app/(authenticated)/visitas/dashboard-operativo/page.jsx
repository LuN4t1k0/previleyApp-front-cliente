"use client";

import VisitasDashboard from "@/modules/visitas/VisitasDashboard";

export default function VisitasOperativoDashboardPage() {
  return (
    <section className="theme-visitas">
      <div className="dashboard-gradient min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <VisitasDashboard />
        </div>
      </div>
    </section>
  );
}
