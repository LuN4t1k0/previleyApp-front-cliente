import React, { useMemo } from "react";
import { Button } from "@tremor/react";

import { formatDateChileWithInfo } from "@/utils/formatDate";

const CLP_FORMATTER = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatCLP = (value) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "$ 0";

  return CLP_FORMATTER.format(amount).replace(/\u00a0/g, " ");
};

const toNumber = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const PrefacturaDetailsContent = ({ prefacturaData, onClose }) => {
  const detalles = prefacturaData?.detalles ?? [];

  const {
    subtotalHonorarios,
    subtotalIva,
    totalCalculado,
    fechaEmision,
    empresaNombre,
    empresaDireccion,
    empresaRut,
    empresaTelefono,
    empresaEmail,
    folio,
  } = useMemo(() => {
    if (!prefacturaData) {
      return {
        subtotalHonorarios: 0,
        subtotalIva: 0,
        totalCalculado: 0,
        fechaEmision: "—",
        empresaNombre: "Cliente",
        empresaDireccion: "—",
        empresaRut: "—",
        empresaTelefono: "—",
        empresaEmail: "—",
        folio: "—",
      };
    }

    const subtotalHonorariosAcc = detalles.reduce(
      (sum, detalle) => sum + toNumber(detalle.gananciaDirecta),
      0
    );

    const subtotalIvaAcc = detalles.reduce(
      (sum, detalle) => sum + toNumber(detalle.iva),
      0
    );

    const total = prefacturaData.totalFacturado
      ? toNumber(prefacturaData.totalFacturado)
      : subtotalHonorariosAcc + subtotalIvaAcc;

    const fecha = prefacturaData.fechaGeneracion
      ? formatDateChileWithInfo(prefacturaData.fechaGeneracion).formattedDate
      : "—";

    return {
      subtotalHonorarios: subtotalHonorariosAcc,
      subtotalIva: subtotalIvaAcc,
      totalCalculado: total,
      fechaEmision: fecha,
      empresaNombre:
        prefacturaData.empresa?.nombre || prefacturaData.empresaRut || "Cliente",
      empresaDireccion: prefacturaData.empresa?.direccion || "—",
      empresaRut: prefacturaData.empresa?.empresaRut || prefacturaData.empresaRut || "—",
      empresaTelefono: prefacturaData.empresa?.telefono || "—",
      empresaEmail: prefacturaData.empresa?.email || "—",
      folio: prefacturaData.folio || `PF-${prefacturaData.id}`,
    };
  }, [prefacturaData, detalles]);

  if (!prefacturaData) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">No hay datos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block text-[0.65rem] uppercase tracking-[0.35em] font-semibold text-indigo-500">
                Prefactura
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {folio}
              </h2>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-10 text-sm text-slate-600 sm:text-right">
              {/* <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Disponible para
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{empresaNombre}</dd>
              </div> */}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fecha de emisión
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{fechaEmision}</dd>
              </div>
            </dl>
          </header>

          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cliente
                </h3>
                <p className="text-sm font-semibold text-slate-900">{empresaNombre}</p>
                <p className="text-sm text-slate-600">{empresaDireccion}</p>
                <p className="text-sm text-slate-600">RUT: {empresaRut}</p>
              </div>
              <dl className="space-y-2 text-sm text-slate-600">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contacto principal
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600">{empresaEmail}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teléfono
                  </dt>
                  <dd className="mt-1 text-sm text-slate-600">{empresaTelefono}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Concepto
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Entidad
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Regularizado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    %
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Honorarios
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {detalles.map((detalle) => (
                  <tr key={detalle.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">
                      {detalle.servicio?.nombre || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {detalle.entidad?.nombre || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                      {formatCLP(detalle.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">
                      {detalle.porcentajeCobro}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-700">
                      {formatCLP(detalle.gananciaDirecta)}
                    </td>
                  </tr>
                ))}
                {detalles.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      No hay detalles disponibles para esta prefactura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between text-right">
                <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCLP(subtotalHonorarios)}</span>
              </div>
              <div className="flex items-center justify-between text-right">
                <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">IVA (19%)</span>
                <span className="font-semibold text-slate-900">{formatCLP(subtotalIva)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-right">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Total facturado</span>
                <span className="text-3xl font-extrabold text-slate-900">{formatCLP(totalCalculado)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-end">
        <Button color="red" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};

PrefacturaDetailsContent.modalSize = "max-w-4xl";

export default PrefacturaDetailsContent;
