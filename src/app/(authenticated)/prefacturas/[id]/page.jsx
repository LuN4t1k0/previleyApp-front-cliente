"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiFileDownloadLine,
} from "@remixicon/react";
import apiService from "@/app/api/apiService";
import StatusPill from "@/components/status/StatusPill";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "react-hot-toast";

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
      const response = await apiService.get(
        `/prefacturas/detalle/${prefacturaId}`
      );
      let payload = response?.data?.data || null;

      if (payload?.factura?.id) {
        try {
          const facturaResponse = await apiService.get(
            `/facturas/${payload.factura.id}`
          );
          const facturaPayload = facturaResponse?.data?.data || null;

          if (facturaPayload) {
            payload = {
              ...payload,
              factura: {
                ...payload.factura,
                ...facturaPayload,
                pdfUrl:
                  facturaPayload.pdfUrl || payload.factura.pdfUrl || null,
              },
            };
          }
        } catch (facturaError) {
          console.error(
            "No se pudo obtener la factura con URL firmada:",
            facturaError
          );
        }
      }

      setPrefactura(payload);
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
                      <th scope="col" className="px-4 py-3 text-right">
                        Producción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/50 text-[color:var(--text-primary)]">
                    {detalles.length > 0 ? (
                      detalles.map((detalle) => (
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
                          <td className="px-4 py-3 text-right text-xs text-[color:var(--theme-primary)]">
                            {detalle.producciones?.detalle ? (
                              <a
                                href={detalle.producciones.detalle}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold"
                              >
                                Ver documento
                                <RiExternalLinkLine
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))
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
