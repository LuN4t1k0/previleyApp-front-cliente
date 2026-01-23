const currencyFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const ufFormatter = new Intl.NumberFormat("es-CL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return currencyFormatter.format(Number(value));
};

export const formatDate = (value) => {
  if (!value) return "—";
  try {
    const date = value instanceof Date ? value : new Date(value);
    return dateFormatter.format(date);
  } catch (error) {
    return value;
  }
};

export const formatServiceCharge = (servicio) => {
  if (!servicio) return "—";
  const billingMode = String(servicio.billingMode || "").toUpperCase();
  const valueUnit = String(servicio.valueUnit || "").toUpperCase();

  if (billingMode === "CASE_UF" || valueUnit === "UF") {
    const ufValue = servicio.ufValuePerCase ?? servicio.value;
    if (ufValue === null || ufValue === undefined || Number.isNaN(Number(ufValue))) {
      return "—";
    }
    return `${ufFormatter.format(Number(ufValue))} UF`;
  }

  if (billingMode === "MONEY" || valueUnit === "MONEY") {
    const moneyValue =
      servicio.moneyValue ?? servicio.value ?? servicio.monto ?? null;
    if (moneyValue === null || moneyValue === undefined || Number.isNaN(Number(moneyValue))) {
      return "—";
    }
    const currencyCode = servicio.currencyCode || "CLP";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(moneyValue));
  }

  if (servicio.porcentajeCobro !== undefined && servicio.porcentajeCobro !== null) {
    return `${Number(servicio.porcentajeCobro).toFixed(2)}%`;
  }

  return "—";
};
