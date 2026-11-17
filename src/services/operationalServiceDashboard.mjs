const CLOSED_STATUSES = new Set([
  "cerrada",
  "cerrado",
  "completada",
  "completado",
  "procesada",
  "procesado",
  "pre_facturada",
  "prefacturada",
]);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (value) =>
  String(value || "sin_estado")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

export const humanizeStatus = (value) => {
  const normalized = normalizeStatus(value);
  if (normalized === "sin_estado") return "Sin estado";
  const label = normalized.replace(/_/g, " ");
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const getPeriod = (row) => {
  const value = row?.fechaGestion || row?.periodoGestion || row?.createdAt;
  if (!value) return "Sin periodo";
  const match = String(value).match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : "Sin periodo";
};

export const aggregateOperationalDashboard = (
  rows = [],
  definition = {},
  apiTotal = rows.length
) => {
  const volumeField = definition.volumeField || "totalRegistros";
  const states = new Map();
  const companies = new Map();
  const timeline = new Map();
  let totalVolumen = 0;
  let cerradas = 0;

  rows.forEach((row) => {
    const volume = toNumber(row?.[volumeField]);
    const status = normalizeStatus(row?.estado);
    const empresaRut = row?.empresaRut || "Sin RUT";
    const empresaNombre =
      row?.empresaNombre || row?.empresa?.nombre || empresaRut;
    const periodo = getPeriod(row);

    totalVolumen += volume;
    if (CLOSED_STATUSES.has(status)) cerradas += 1;

    states.set(status, (states.get(status) || 0) + 1);

    const company = companies.get(empresaRut) || {
      empresaRut,
      empresaNombre,
      gestiones: 0,
      volumen: 0,
    };
    company.gestiones += 1;
    company.volumen += volume;
    companies.set(empresaRut, company);

    const periodEntry = timeline.get(periodo) || {
      periodo,
      gestiones: 0,
      volumen: 0,
    };
    periodEntry.gestiones += 1;
    periodEntry.volumen += volume;
    timeline.set(periodo, periodEntry);
  });

  const totalGestiones = toNumber(apiTotal) || rows.length;

  return {
    summary: {
      totalGestiones,
      totalVolumen,
      totalEmpresas: companies.size,
      cerradas,
      porcentajeCierre: totalGestiones
        ? Number(((cerradas / totalGestiones) * 100).toFixed(1))
        : 0,
    },
    states: Array.from(states, ([key, value]) => ({
      key,
      label: humanizeStatus(key),
      value,
    })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    companies: Array.from(companies.values()).sort(
      (a, b) => b.volumen - a.volumen || b.gestiones - a.gestiones
    ),
    timeline: Array.from(timeline.values()).sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    ),
    latest: [...rows]
      .sort((a, b) =>
        String(b?.createdAt || b?.fechaGestion || "").localeCompare(
          String(a?.createdAt || a?.fechaGestion || "")
        )
      )
      .slice(0, 8),
  };
};

