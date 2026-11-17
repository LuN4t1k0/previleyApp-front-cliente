const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const trimmed = (value) => String(value ?? "").trim();

export const buildLicenciasManagementQuery = ({
  page = 1,
  pageSize = 20,
  empresaRut,
  folioInterno,
  periodo,
  estado,
} = {}) => {
  const safePage = Math.max(1, Math.trunc(asNumber(page, 1)));
  const safePageSize = Math.max(1, Math.trunc(asNumber(pageSize, 20)));
  const query = {
    limit: safePageSize,
    offset: (safePage - 1) * safePageSize,
  };

  Object.entries({ empresaRut, folioInterno, periodo, estado }).forEach(
    ([key, value]) => {
      const normalized = trimmed(value);
      if (normalized) query[key] = normalized;
    }
  );

  return query;
};

export const normalizeGestionLicenciaPage = (payload = {}) => {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const pageSize = Math.max(1, asNumber(payload?.limit, 20));
  const offset = Math.max(0, asNumber(payload?.offset, 0));
  const total = Math.max(0, asNumber(payload?.total, rows.length));
  const totalPages = Math.max(
    1,
    asNumber(payload?.pages, Math.ceil(total / pageSize) || 1)
  );

  return {
    total,
    page: Math.floor(offset / pageSize) + 1,
    pageSize,
    totalPages,
    rows: rows.map((row) => ({
      id: row?.id ?? null,
      empresaRut: row?.empresaRut || "",
      empresaNombre: row?.empresaNombre || row?.empresa?.nombre || "",
      folioInterno: row?.folioInterno || row?.folio || "",
      periodo: row?.periodo || "",
      estado: row?.estado || "",
      totalLicencias: asNumber(
        row?.totalLicencias,
        Array.isArray(row?.licencias) ? row.licencias.length : 0
      ),
    })),
  };
};

export const getGestionLicenciaDetailHref = (id) =>
  `/licencia-medica/conciliacion/gestiones/${encodeURIComponent(id)}?modo=lectura`;

export const getGestionLicenciaExcelPath = (id) =>
  `/gestion-licencia/${encodeURIComponent(id)}/excel-detalle`;
