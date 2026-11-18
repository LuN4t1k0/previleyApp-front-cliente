"use client";

import { useEffect, useState } from "react";
import { RiDownloadLine } from "@remixicon/react";
import {
  downloadGestionHistoryExcel,
  fetchGestionHistoryPage,
} from "@/services/clientServiceApi";
import {
  formatDashboardDate,
  humanizeStatus,
} from "@/services/operationalServiceDashboard.mjs";
import GestionHistoryPagination from "./GestionHistoryPagination";

const statusStyles = {
  procesada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cerrada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  completada: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  analisis: "bg-amber-50 text-amber-800 ring-amber-600/20",
  en_analisis: "bg-amber-50 text-amber-800 ring-amber-600/20",
  rechazada: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const countFormatter = new Intl.NumberFormat("es-CL");

export default function GestionHistoryTable({
  serviceKey,
  empresaRut,
  from,
  to,
  volumeField = "totalRegistros",
}) {
  const isZonasExtremas = serviceKey === "zonas-extremas";
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchGestionHistoryPage(
      serviceKey,
      { page, empresaRut, from, to },
      controller.signal
    ).then(
      (result) => {
        if (controller.signal.aborted) return;
        setRows(result.rows);
        setTotal(result.total);
        setLoading(false);
      },
      () => {
        if (controller.signal.aborted) return;
        setError(true);
        setLoading(false);
      }
    );
    return () => controller.abort();
  }, [serviceKey, page, empresaRut, from, to, retry]);

  const prepareLoad = () => {
    setLoading(true);
    setError(false);
    setDownloadError("");
  };

  const handleDownload = async (row) => {
    setDownloadingId(row.id);
    setDownloadError("");
    try {
      await downloadGestionHistoryExcel(serviceKey, row);
    } catch (err) {
      const folio = row.folioInterno || row.folio || `#${row.id}`;
      setDownloadError(
        err?.response?.status === 403
          ? `No tienes permisos para descargar el Excel de la gestión ${folio}.`
          : `No se pudo descargar el Excel de la gestión ${folio}.`
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold">Historial de gestiones</h3>
        {!loading && !error && (
          <p className="mt-1 text-sm text-slate-500">
            {countFormatter.format(total)} {total === 1 ? "gestión" : "gestiones"}
          </p>
        )}
      </div>
      {downloadError && <p role="alert" className="px-5 py-3 text-sm text-rose-700">{downloadError}</p>}
      {loading ? (
        <p role="status" className="px-5 py-4 text-sm text-slate-600">Cargando gestiones…</p>
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm text-rose-700">
          No se pudo cargar el historial.
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              prepareLoad();
              setRetry((attempt) => attempt + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      ) : rows.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">Folio</th>
                <th scope="col" className="px-5 py-3">{isZonasExtremas ? "Zona" : "Empresa"}</th>
                <th scope="col" className="px-5 py-3">Fecha</th>
                <th scope="col" className="px-5 py-3 text-right">{isZonasExtremas ? "Registros" : "Volumen"}</th>
                <th scope="col" className="px-5 py-3">Estado</th>
                <th scope="col" className="px-5 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const folio = row.folioInterno || row.folio || `#${row.id}`;
                const statusKey = String(row.estado || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
                const isDownloading = downloadingId === row.id;
                return (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">{folio}</td>
                    <td className="min-w-32 px-5 py-3 text-slate-600">
                      {isZonasExtremas ? row.zonaExtrema || "—" : row.empresaNombre || row.empresa?.nombre || row.empresaRut}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                      {formatDashboardDate(row.fechaGestion || row.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">
                      {countFormatter.format(Number(row[volumeField] || 0))}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[statusKey] || "bg-slate-100 text-slate-700 ring-slate-500/20"}`}>
                        {humanizeStatus(row.estado)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <button
                        type="button"
                        aria-label={`${isDownloading ? "Descargando" : "Descargar"} Excel de la gestión ${folio}`}
                        disabled={downloadingId !== null}
                        onClick={() => handleDownload(row)}
                        className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        <RiDownloadLine className="h-4 w-4" aria-hidden="true" />
                        {isDownloading ? "Descargando…" : "Descargar Excel"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-4 text-sm text-slate-600">Sin gestiones registradas.</p>
      )}
      <GestionHistoryPagination
        page={page}
        total={total}
        loading={loading}
        onPageChange={(nextPage) => {
          prepareLoad();
          setPage(nextPage);
        }}
      />
    </section>
  );
}
