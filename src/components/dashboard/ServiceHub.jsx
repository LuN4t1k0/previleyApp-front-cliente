import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";
import { DashboardBody, DashboardHeader } from "@/components/dashboard/ServiceDashboardLayout";

export default function ServiceHub({ title, cards }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardHeader kind="Servicio contratado" title={title} />
      <DashboardBody>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
                <article className={`group flex h-full min-h-[260px] flex-col rounded-lg border border-slate-200 border-t-4 ${card.tone} bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-xl font-semibold text-slate-950">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{card.description}</p>
                  <div className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-slate-900">
                    Ingresar <RiArrowRightLine className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </DashboardBody>
    </main>
  );
}
