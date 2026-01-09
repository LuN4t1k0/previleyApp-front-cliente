import React from "react";


const Titulo = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600">
        Administracion
      </span>
      <h3 className="text-lg font-semibold text-[color:var(--text-primary)] sm:text-2xl">
        {title}
      </h3>
      {subtitle ? (
        <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

export default Titulo;
