"use client";

import { useState } from "react";
import { useEventStream } from "@/hooks/useEventStream";

export default function LicenciasSSEPage() {
  const [files, setFiles] = useState([]);
  const [start, setStart] = useState(false);

  const { messages, done, error } = useEventStream(
    `${process.env.NEXT_PUBLIC_PAGEX_API_URL}/procesar`,
    files,
    start
  );

  const handleChange = (event) => {
    setFiles(Array.from(event.target.files));
    setStart(false);
  };

  const handleSubmit = () => {
    setStart(true);
  };

  return (
    <section className="pb-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pt-10 md:px-6">
        <header className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">
            Herramienta
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
            Procesar Pagex
          </h1>
          <p className="mt-3 text-sm text-[color:var(--text-secondary)] sm:text-base">
            Carga archivos para procesar pagos en exceso mediante SSE.
          </p>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        </header>

        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-4">
            <input type="file" multiple onChange={handleChange} className="text-sm" />
            <button
              onClick={handleSubmit}
              disabled={files.length === 0}
              className="w-fit rounded-full bg-[color:var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--theme-primary-dark)] disabled:opacity-50"
            >
              Procesar archivos
            </button>
          </div>

          <div className="mt-6 h-80 overflow-y-auto rounded-2xl border border-white/60 bg-white/80 p-4 text-sm font-mono text-[color:var(--text-secondary)]">
            {messages.map((message, index) => (
              <div key={`${message}-${index}`}>{message}</div>
            ))}
            {done && (
              <div className="mt-2 text-emerald-600">✅ Proceso completado</div>
            )}
            {error && (
              <div className="mt-2 text-rose-600">❌ Error: {error.message}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
