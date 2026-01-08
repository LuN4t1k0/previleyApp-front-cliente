"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RiArrowLeftLine,
  RiFileDownloadLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import StatusPill from "@/components/status/StatusPill";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "react-hot-toast";
import { fetchPrefacturaDetailWithSignedUrls } from "@/services/prefacturaApi";

const PrefacturaDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const prefacturaId = params?.id;

  const [prefactura, setPrefactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cobranzaForm, setCobranzaForm] = useState({
    ordenCompraNumero: "",
    hesNumero: "",
  });
  const [savingCobranza, setSavingCobranza] = useState(false);

  const fetchPrefactura = useCallback(async () => {
    if (!prefacturaId) return;
    setLoading(true);
    try {
      const payload = await fetchPrefacturaDetailWithSignedUrls(prefacturaId);
      setPrefactura(payload || null);
      setError(null);
    } catch (err) {
      console.error("Error al obtener detalle de la prefactura:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [prefacturaId]);

  useEffect(() => {
    fetchPrefactura();
  }, [fetchPrefactura]);

  useEffect(() => {
    if (!prefactura) return;
    setCobranzaForm({
      ordenCompraNumero: prefactura.ordenCompraNumero || "",
      hesNumero: prefactura.hesNumero || "",
    });
  }, [prefactura]);

  const handleCobranzaChange = (event) => {
    const { name, value } = event.target;
    setCobranzaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCobranzaSubmit = async (event) => {
    event.preventDefault();
    if (!prefacturaId) return;
    setSavingCobranza(true);
    try {
      await apiService.patch(`/prefacturas/cobranza/${prefacturaId}`, {
        ordenCompraNumero: cobranzaForm.ordenCompraNumero || null,
        hesNumero: cobranzaForm.hesNumero || null,
      });
      toast.success("Datos de cobranza actualizados.");
      await fetchPrefactura();
    } catch (err) {
      console.error("Error al actualizar datos de cobranza:", err);
      toast.error("No pudimos guardar los cambios.");
    } finally {
      setSavingCobranza(false);
    }
  };

  const detalles = useMemo(
    () => prefactura?.detalles || [],
    [prefactura?.detalles]
  );
  const totalLineas = useMemo(() => detalles.length, [detalles]);

  const totales = useMemo(() => {
    return detalles.reduce(
      (acc, detalle) => {
        const subtotal = Number(detalle.subtotal || 0);
        const total = Number(detalle.totalFacturado || 0);
        const iva = Number(detalle.iva || 0);
        return {
          subtotal: acc.subtotal + subtotal,
          total: acc.total + total,
          iva: acc.iva + iva,
        };
      },
      { subtotal: 0, total: 0, iva: 0 }
    );
  }, [detalles]);

  const FILES_BASE_URL =
    process.env.NEXT_PUBLIC_FILES_BASE_URL ||
    "https://previley-app-files.s3.us-east-1.amazonaws.com";

  const resolveFileUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    if (value.startsWith("s3://")) {
      const cleaned = value.replace("s3://", "");
      const parts = cleaned.split("/");
      parts.shift();
      return `${FILES_BASE_URL}/${parts.join("/")}`;
    }
    if (value.startsWith("/")) return value;
    return `${FILES_BASE_URL}/${value}`;
  };

  const getPrefacturaPdfUrl = (pref) =>
    resolveFileUrl(
      pref?.pdfUrl ||
        pref?.prefacturaPdfUrl ||
        pref?.pdfKey ||
        pref?.pdf ||
        null
    );

  const normalizeProducciones = (detalle) => {
    const producciones = detalle?.producciones;
    if (Array.isArray(producciones)) return producciones;
    if (producciones) return [producciones];
    const fallbackId = detalle?.produccionId || detalle?.produccionID || null;
    return fallbackId ? [{ id: fallbackId }] : [];
  };

  const buildProduccionAttachments = (produccion) => {
    const entries = [];
    const pushIf = (label, url) => {
      const resolved = resolveFileUrl(url);
      if (!resolved) return;
      entries.push({ label, url: resolved });
    };

    pushIf("Certificado inicial", produccion?.certificadoInicial);
    pushIf("Certificado final", produccion?.certificadoFinal);
    pushIf("Detalle", produccion?.detalle);
    pushIf(
      "Comprobante de pago",
      produccion?.comprobantePago ||
        produccion?.comprobanteUrl ||
        produccion?.comprobante ||
        produccion?.comprobante_pago
    );

    return entries;
  };

  return (
    <section className="theme-dashboard dashboard-gradient min-h-screen pb-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white px-3 py-2 text-xs font-semibold text-[color:var(--text-secondary)] shadow-sm hover:text-[color:var(--theme-primary)]"
        >
          <RiArrowLeftLine className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>

        {loading ? (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
            Cargando detalle de la prefactura...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 text-sm text-rose-500 shadow-sm backdrop-blur">
            Ocurrió un error al cargar la prefactura.
          </div>
        ) : !prefactura ? (
          <div className="rounded-3xl border border-white/60 bg-white/80 p-8 text-sm text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
            No se encontró la prefactura solicitada.
          </div>
        ) : (
          <>
            <header className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-elevated backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--theme-primary)]">
                Prefactura #{prefactura.folio}
              </span>
              <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)] sm:text-4xl">
                {prefactura.empresa?.nombre || prefactura.empresaRut}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[color:var(--text-secondary)]">
                <StatusPill estado={prefactura.estado} />
                <span>Generada el {formatDate(prefactura.fechaGeneracion)}</span>
                <span>Folio: {prefactura.folio}</span>
              </div>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <span className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                  Total facturado
                </span>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {formatCurrency(prefactura.totalFacturado)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <span className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                  Detalles incluidos
                </span>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {totalLineas}
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <span className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                  Subtotal
                </span>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                  {formatCurrency(totales.subtotal)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
                <span className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]">
                  IVA incluido
                </span>
                <p className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
                  {formatCurrency(totales.iva)}
                </p>
              </div>
            </div>

            <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
              <header className="flex flex-col gap-2 border-b border-white/50 pb-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Información de la prefactura
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Detalle de identificación y seguimiento.
                </p>
              </header>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                  <dt className="font-semibold text-[color:var(--text-secondary)]">
                    Empresa
                  </dt>
                  <dd className="mt-1 text-[color:var(--text-primary)]">
                    {prefactura.empresa?.nombre || "Sin información"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                  <dt className="font-semibold text-[color:var(--text-secondary)]">
                    RUT empresa
                  </dt>
                  <dd className="mt-1 text-[color:var(--text-primary)]">
                    {prefactura.empresaRut}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                  <dt className="font-semibold text-[color:var(--text-secondary)]">
                    Generada el
                  </dt>
                  <dd className="mt-1 text-[color:var(--text-primary)]">
                    {formatDate(prefactura.fechaGeneracion)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                  <dt className="font-semibold text-[color:var(--text-secondary)]">
                    Estado actual
                  </dt>
                  <dd className="mt-1">
                    <StatusPill estado={prefactura.estado} />
                  </dd>
                </div>
                {getPrefacturaPdfUrl(prefactura) ? (
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                    <dt className="font-semibold text-[color:var(--text-secondary)]">
                      Documento prefactura
                    </dt>
                    <dd className="mt-2">
                      <a
                        href={getPrefacturaPdfUrl(prefactura)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-primary)]/20"
                      >
                        <RiFileDownloadLine className="h-4 w-4" aria-hidden="true" />
                        Descargar PDF
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
              <header className="flex flex-col gap-2 border-b border-white/50 pb-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Datos de cobranza
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Completa la información para agilizar la emisión de la factura y el flujo de pago.
                </p>
              </header>

              <form
                className="mt-6 grid gap-4 sm:grid-cols-2"
                onSubmit={handleCobranzaSubmit}
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="ordenCompraNumero"
                    className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]"
                  >
                    Nº Orden de Compra
                  </label>
                  <input
                    id="ordenCompraNumero"
                    name="ordenCompraNumero"
                    type="text"
                    value={cobranzaForm.ordenCompraNumero}
                    onChange={handleCobranzaChange}
                    className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none"
                    placeholder="Ej: OC-123456"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="hesNumero"
                    className="text-xs font-semibold uppercase text-[color:var(--text-secondary)]"
                  >
                    Nº HES / Recepción conforme
                  </label>
                  <input
                    id="hesNumero"
                    name="hesNumero"
                    type="text"
                    value={cobranzaForm.hesNumero}
                    onChange={handleCobranzaChange}
                    className="rounded-xl border border-white/60 bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--theme-primary)] focus:outline-none"
                    placeholder="Ej: HES-7890"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--theme-primary-dark)] disabled:opacity-60"
                    disabled={savingCobranza}
                  >
                    {savingCobranza ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
              <header className="flex flex-col gap-2 border-b border-white/50 pb-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Factura asociada
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Detalle de la factura generada a partir de esta prefactura.
                </p>
              </header>

              {prefactura.factura ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                    <dt className="font-semibold text-[color:var(--text-secondary)]">
                      Número de factura
                    </dt>
                    <dd className="mt-1 text-[color:var(--text-primary)]">
                      {prefactura.factura.numeroFactura || "Sin número"}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                    <dt className="font-semibold text-[color:var(--text-secondary)]">
                      Estado
                    </dt>
                    <dd className="mt-1">
                      <StatusPill estado={prefactura.factura.estado} />
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                    <dt className="font-semibold text-[color:var(--text-secondary)]">
                      Vencimiento
                    </dt>
                    <dd className="mt-1 text-[color:var(--text-primary)]">
                      {formatDate(prefactura.factura.fechaVencimiento)}
                    </dd>
                  </div>
                  {prefactura.factura.pdfUrl ? (
                    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 text-sm shadow-sm">
                      <dt className="font-semibold text-[color:var(--text-secondary)]">
                        Documento
                      </dt>
                      <dd className="mt-2">
                        <a
                          href={prefactura.factura.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-primary)]/20"
                        >
                          <RiFileDownloadLine
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          Descargar PDF
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
                  Esta prefactura aún no tiene una factura registrada.
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur">
              <header className="flex flex-col gap-2 border-b border-white/50 pb-4">
                <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
                  Detalle de líneas
                </h2>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Servicios incluidos en la prefactura.
                </p>
              </header>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-white/60 text-sm">
                  <thead className="bg-white/70 text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Servicio
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Entidad
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Subtotal
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        IVA
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Total
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Adjuntos
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Gestiones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/50 text-[color:var(--text-primary)]">
                    {detalles.length > 0 ? (
                      detalles.map((detalle) => {
                        const producciones = normalizeProducciones(detalle);
                        return (
                        <tr key={detalle.id} className="hover:bg-[color:var(--theme-soft)]/60">
                          <td className="px-4 py-3 font-semibold">
                            {detalle.servicio?.nombre || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                            {detalle.entidad?.nombre || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {formatCurrency(detalle.subtotal)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            {formatCurrency(detalle.iva)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold">
                            {formatCurrency(detalle.totalFacturado)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {producciones.length > 0 ? (
                              <div className="flex flex-col gap-4">
                                {producciones.map((prod, index) => {
                                  const attachments = buildProduccionAttachments(prod);
                                  const label = prod?.id
                                    ? `Gestión #${prod.id}`
                                    : `Gestión ${index + 1}`;
                                  return (
                                    <div key={prod?.id || index} className="flex flex-col gap-2">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                                        {label}
                                      </span>
                                      {attachments.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                          {attachments.map((item) => (
                                            <a
                                              key={`${label}-${item.label}`}
                                              href={item.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-dark)]"
                                            >
                                              <RiFileDownloadLine className="h-3.5 w-3.5" aria-hidden="true" />
                                              {item.label}
                                            </a>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-[color:var(--text-secondary)]">
                                          Sin adjuntos
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-[color:var(--theme-primary)]">
                            {producciones.length > 0 ? (
                              <span className="font-semibold">
                                {producciones.length === 1
                                  ? `1 gestión`
                                  : `${producciones.length} gestiones`}
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-[color:var(--text-secondary)]"
                        >
                          No hay líneas asociadas a esta prefactura.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
};

export default PrefacturaDetailPage;
