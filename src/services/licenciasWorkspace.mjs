import {
  getClientServiceWorkspace,
  STANDARD_SERVICE_SECTIONS,
} from "../config/clientServiceWorkspace.mjs";

export const LICENCIAS_SECTIONS = STANDARD_SERVICE_SECTIONS;

const LEGACY_SECTION_ALIASES = Object.freeze({
  "dashboard-global": "dashboard-analitico",
});

const asFiniteNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const humanize = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  return normalized
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : "Sin estado";
};

export const resolveLicenciasSection = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  const canonical = LEGACY_SECTION_ALIASES[normalized] || normalized;
  return LICENCIAS_SECTIONS.some((section) => section.key === canonical)
    ? canonical
    : null;
};

export const buildLicenciasSectionHref = (section, params = {}) => {
  const canonical = resolveLicenciasSection(section);
  if (!canonical) return null;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  const suffix = query.toString();
  return `/servicios/licencias-medicas/${canonical}${suffix ? `?${suffix}` : ""}`;
};

export const getLicenciasWorkspaceLinks = () => ({
  sections: LICENCIAS_SECTIONS.map((section) => ({
    ...section,
    href: buildLicenciasSectionHref(section.key),
  })),
  complementary: [
    {
      key: "ficha-trabajador",
      label: "Ficha Trabajador",
      href: "/servicios/licencias-medicas/ficha-trabajador",
    },
  ],
});

export const resolveLicenciasLegacyHref = (tab, params = {}) => {
  const normalized = String(tab || "").trim().toLowerCase();
  if (normalized === "ficha-trabajador") {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      query.set(key, String(value));
    });
    const suffix = query.toString();
    return `/servicios/licencias-medicas/ficha-trabajador${suffix ? `?${suffix}` : ""}`;
  }

  return buildLicenciasSectionHref(normalized, params);
};

const LEGACY_ROUTE_SECTIONS = Object.freeze({
  "/dashboard/licencia-medica/dashboard-global": "dashboard-analitico",
  "/dashboard/licencia-medica/dashboard-operativo": "dashboard-operativo",
  "/licencia-medica/dashboard-global": "dashboard-analitico",
  "/licencia-medica/ficha-empresa": "dashboard-operativo",
  "/licencia-medica/conciliacion": "gestiones",
  "/licencia-medica/ficha-trabajador-rut": "ficha-trabajador",
});

const CANONICAL_ROUTE_SECTIONS = Object.freeze({
  "/servicios/licencias-medicas/dashboard-analitico": "dashboard-analitico",
  "/servicios/licencias-medicas/dashboard-operativo": "dashboard-operativo",
  "/servicios/licencias-medicas/gestiones": "gestiones",
  "/servicios/licencias-medicas/ficha-trabajador": "ficha-trabajador",
});

const getContextParams = (query = {}) =>
  Object.fromEntries(
    Object.entries(query)
      .filter(([key]) => key !== "tab")
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );

export const resolveLicenciasLegacyRouteHref = (pathname, query = {}) => {
  const normalizedPath = String(pathname || "").replace(/\/$/, "");
  const context = getContextParams(query);
  const section =
    CANONICAL_ROUTE_SECTIONS[normalizedPath] ||
    LEGACY_ROUTE_SECTIONS[normalizedPath];

  if (section) return resolveLicenciasLegacyHref(section, context);

  if (normalizedPath === "/dashboard/licencia-medica") {
    if (query?.tab) return resolveLicenciasLegacyHref(query.tab, context);
    return "/servicios/licencias-medicas";
  }

  return null;
};

export const resolveRequiredEmpresa = (empresas = [], requestedRut = "") => {
  const available = asArray(empresas).filter((empresa) => empresa?.empresaRut);
  const requested = String(requestedRut || "").trim();

  if (requested) {
    return available.some((empresa) => empresa.empresaRut === requested)
      ? requested
      : null;
  }

  return available.length === 1 ? available[0].empresaRut : null;
};

export const normalizeLicenciasAnalytics = (payload = {}) => {
  const resumen = payload?.resumen || {};
  const totalAnticipos = asFiniteNumber(resumen.totalAnticipos);
  const totalSubsidios = asFiniteNumber(resumen.totalSubsidios);

  return {
    scope: payload?.scope || { isGlobal: false, empresas: [] },
    summary: {
      totalLicencias: asFiniteNumber(resumen.totalLicencias),
      licenciasVigentes: asFiniteNumber(resumen.licenciasVigentes),
      trabajadoresConLicencia: asFiniteNumber(resumen.trabajadoresConLicencia),
      totalDias: asFiniteNumber(resumen.totalDias),
      totalAnticipos,
      totalSubsidios,
      saldoBruto: totalSubsidios - totalAnticipos,
    },
    ranking: asArray(payload?.rankingEmpresas).map((item) => {
      const empresaRut = item?.empresaRut || "";
      const empresaNombre = item?.empresaNombre || empresaRut || "Sin empresa";
      return {
        empresaRut,
        empresaNombre,
        label: empresaRut ? `${empresaNombre} · ${empresaRut}` : empresaNombre,
        totalLicencias: asFiniteNumber(item?.totalLicencias),
        totalDias: asFiniteNumber(item?.totalDias),
      };
    }),
    states: asArray(payload?.distribucionEstado).map((item) => ({
      estado: item?.estado || "sin_estado",
      label: humanize(item?.estado),
      cantidad: asFiniteNumber(item?.cantidad),
    })),
    entities: asArray(payload?.distribucionEntidad).map((item) => ({
      entidad: item?.entidad || "Sin entidad",
      cantidad: asFiniteNumber(item?.cantidad),
    })),
    timeline: asArray(payload?.tendencia).map((item) => ({
      periodo: item?.periodo || "",
      licencias: asFiniteNumber(item?.cantidad),
      dias: asFiniteNumber(item?.totalDias),
    })),
    totalEmpresasConInformacion: asFiniteNumber(payload?.totalEmpresasConInformacion),
  };
};

export const normalizeLicenciasOperations = (payload = {}) => {
  const integral = payload?.resumenIntegral || payload;
  const metricas = integral?.metricas || {};
  const licencias = metricas.licencias || {};
  const anticipos = metricas.anticipos || {};
  const subsidios = metricas.subsidios || {};
  const cuentaCorriente = metricas.cuentaCorriente || {};
  const totalAnticipos = asFiniteNumber(anticipos.total);
  const totalSubsidios = asFiniteNumber(subsidios.total);
  const acuerdosActivo = cuentaCorriente.moduloAcuerdosActivo === true;

  return {
    empresa: integral?.empresa || null,
    summary: {
      totalLicencias: asFiniteNumber(licencias.total),
      licenciasVigentes: asFiniteNumber(licencias.vigentes),
      trabajadoresConLicencia: asFiniteNumber(metricas?.trabajadores?.conLicencia),
      totalDias: asFiniteNumber(licencias.diasTotales),
    },
    states: Object.entries(licencias.porEstado || {}).map(([estado, cantidad]) => ({
      estado,
      cantidad: asFiniteNumber(cantidad),
    })),
    financial: {
      totalAnticipos,
      totalSubsidios,
      saldoBruto: totalSubsidios - totalAnticipos,
      acuerdos: acuerdosActivo
        ? {
            activo: true,
            saldoIntegrado: asFiniteNumber(cuentaCorriente.saldo),
            recuperado: asFiniteNumber(cuentaCorriente.recuperadoAcuerdos),
            detail: integral?.integracionAcuerdos || null,
          }
        : null,
    },
    detail: integral?.detalle || {},
    rates: {
      total: asFiniteNumber(payload?.rates?.total),
      rechazadas: asFiniteNumber(payload?.rates?.rechazadas),
      devueltas: asFiniteNumber(payload?.rates?.devueltas),
      tasaRechazo: asFiniteNumber(payload?.rates?.tasaRechazo),
      tasaDevolucion: asFiniteNumber(payload?.rates?.tasaDevolucion),
    },
    evolution: asArray(payload?.evolution).map((item) => ({
      periodo: item?.periodo || item?.mes || "",
      licencias: asFiniteNumber(item?.cantidadLicencias || item?.cantidad),
      dias: asFiniteNumber(item?.totalDias),
    })),
    topWorkers: asArray(payload?.topWorkers).map((item) => ({
      trabajadorRut: item?.trabajadorRut || "",
      nombreTrabajador: item?.nombreTrabajador || "Sin nombre",
      totalDias: asFiniteNumber(item?.totalDias),
    })),
    recentManagement: asArray(payload?.recentManagement)
      .slice()
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
      )
      .slice(0, 5)
      .map((item) => ({
        id: item?.id,
        folio: item?.folioInterno || item?.folio || "—",
        empresaRut: item?.empresaRut || "",
        periodo: item?.periodo || "—",
        estado: item?.estado || "sin_estado",
        totalLicencias: Array.isArray(item?.licencias)
          ? item.licencias.length
          : asFiniteNumber(item?.totalLicencias),
        createdAt: item?.createdAt || null,
      })),
  };
};

export const LICENCIAS_WORKSPACE = getClientServiceWorkspace("licencias-medicas");

