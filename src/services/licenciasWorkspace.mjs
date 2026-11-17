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
    ranking: asArray(payload?.rankingEmpresas),
    states: asArray(payload?.distribucionEstado),
    entities: asArray(payload?.distribucionEntidad),
    timeline: asArray(payload?.tendencia),
    totalEmpresasConInformacion: asFiniteNumber(payload?.totalEmpresasConInformacion),
  };
};

export const normalizeLicenciasOperations = (payload = {}) => {
  const metricas = payload?.metricas || {};
  const licencias = metricas.licencias || {};
  const anticipos = metricas.anticipos || {};
  const subsidios = metricas.subsidios || {};
  const cuentaCorriente = metricas.cuentaCorriente || {};
  const totalAnticipos = asFiniteNumber(anticipos.total);
  const totalSubsidios = asFiniteNumber(subsidios.total);
  const acuerdosActivo = cuentaCorriente.moduloAcuerdosActivo === true;

  return {
    empresa: payload?.empresa || null,
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
            detail: payload?.integracionAcuerdos || null,
          }
        : null,
    },
    detail: payload?.detalle || {},
  };
};

export const LICENCIAS_WORKSPACE = getClientServiceWorkspace("licencias-medicas");

