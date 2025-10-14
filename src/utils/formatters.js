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
