export function normalizeDashboardYears(years) {
  if (!Array.isArray(years)) return [];
  return [...new Set(years.map((year) => String(year ?? "")).filter((year) => /^\d{4}$/.test(year)))].sort((a, b) => b.localeCompare(a));
}

export function getDashboardYearRange(year) {
  if (!/^\d{4}$/.test(String(year ?? ""))) return undefined;
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function getDashboardYearParams(year) {
  const range = getDashboardYearRange(year);
  return range ? { fechaInicio: range.from, fechaFin: range.to } : {};
}
