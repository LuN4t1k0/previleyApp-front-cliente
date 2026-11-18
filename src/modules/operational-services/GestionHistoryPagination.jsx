import { GESTION_HISTORY_PAGE_SIZE } from "@/services/serviceGestionHistory.mjs";

const buttonClass =
  "rounded-lg border border-slate-200 px-3 py-1.5 font-semibold hover:bg-slate-50 disabled:opacity-40";

export default function GestionHistoryPagination({ page, total, loading, onPageChange }) {
  const lastPage = Math.max(1, Math.ceil(total / GESTION_HISTORY_PAGE_SIZE));
  if (lastPage === 1 && page === 1) return null;

  return (
    <nav aria-label="Páginas de gestiones" className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 text-sm">
      <button type="button" className={buttonClass} disabled={loading || page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span aria-live="polite">Página {page} de {lastPage}</span>
      <button type="button" className={buttonClass} disabled={loading || page >= lastPage} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </button>
    </nav>
  );
}
