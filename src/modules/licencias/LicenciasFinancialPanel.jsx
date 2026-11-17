import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiExchangeDollarLine,
  RiInformationLine,
} from "@remixicon/react";

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currency.format(Number(value || 0));

const Item = ({ label, value, icon: Icon, tone }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <Icon className={`h-4 w-4 ${tone}`} />
      {label}
    </div>
    <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(value)}</p>
  </div>
);

const LicenciasFinancialPanel = ({ financial }) => {
  const data = financial || {};
  const saldoBruto = Number(data.saldoBruto || 0);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Balance financiero</h2>
        <p className="mt-1 text-sm text-slate-500">
          El saldo bruto corresponde a subsidios recibidos menos anticipos pagados.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Item
          label="Anticipos pagados"
          value={data.totalAnticipos}
          icon={RiArrowUpLine}
          tone="text-amber-600"
        />
        <Item
          label="Subsidios recibidos"
          value={data.totalSubsidios}
          icon={RiArrowDownLine}
          tone="text-emerald-600"
        />
        <Item
          label={saldoBruto >= 0 ? "Saldo bruto a favor" : "Saldo bruto en contra"}
          value={saldoBruto}
          icon={RiExchangeDollarLine}
          tone={saldoBruto >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      {data.acuerdos?.activo ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <div className="flex items-start gap-3">
            <RiInformationLine className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="font-semibold">Información secundaria de acuerdos de pago</p>
              <p className="mt-1">
                Saldo integrado: {formatCurrency(data.acuerdos.saldoIntegrado)} · Recuperado por
                acuerdos: {formatCurrency(data.acuerdos.recuperado)}.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default LicenciasFinancialPanel;

