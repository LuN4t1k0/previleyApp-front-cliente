import test from "node:test";
import assert from "node:assert/strict";
import {
  LICENCIAS_SECTIONS,
  buildLicenciasSectionHref,
  getLicenciasWorkspaceLinks,
  normalizeLicenciasAnalytics,
  normalizeLicenciasOperations,
  resolveLicenciasLegacyHref,
  resolveLicenciasSection,
  resolveRequiredEmpresa,
} from "../src/services/licenciasWorkspace.mjs";

test("exposes the three standard medical leave sections in their customer-facing order", () => {
  assert.deepEqual(LICENCIAS_SECTIONS, [
    { key: "dashboard-analitico", label: "Dashboard Analítico" },
    { key: "dashboard-operativo", label: "Dashboard Operativo" },
    { key: "gestiones", label: "Gestiones" },
  ]);
});

test("normalizes legacy medical leave section names and rejects unknown sections", () => {
  assert.equal(resolveLicenciasSection("dashboard-global"), "dashboard-analitico");
  assert.equal(resolveLicenciasSection("dashboard-analitico"), "dashboard-analitico");
  assert.equal(resolveLicenciasSection("dashboard-operativo"), "dashboard-operativo");
  assert.equal(resolveLicenciasSection("gestiones"), "gestiones");
  assert.equal(resolveLicenciasSection("desconocido"), null);
});

test("builds canonical section links and preserves only non-empty query values", () => {
  assert.equal(
    buildLicenciasSectionHref("dashboard-operativo", {
      empresa: "76.412.562-2",
      trabajador: "",
      tab: null,
    }),
    "/servicios/licencias-medicas/dashboard-operativo?empresa=76.412.562-2"
  );
  assert.equal(buildLicenciasSectionHref("desconocido", {}), null);
});

test("requires an explicit company when several companies are available", () => {
  const empresas = [
    { empresaRut: "11-1", nombre: "Uno" },
    { empresaRut: "22-2", nombre: "Dos" },
  ];

  assert.equal(resolveRequiredEmpresa(empresas), null);
  assert.equal(resolveRequiredEmpresa(empresas, "22-2"), "22-2");
  assert.equal(resolveRequiredEmpresa(empresas, "99-9"), null);
  assert.equal(resolveRequiredEmpresa([empresas[0]]), "11-1");
});

test("normalizes analytic numbers and derives the gross balance independently", () => {
  const result = normalizeLicenciasAnalytics({
    resumen: {
      totalLicencias: "12",
      licenciasVigentes: "5",
      trabajadoresConLicencia: "4",
      totalDias: "36",
      totalAnticipos: "9000",
      totalSubsidios: "13500",
      saldoBruto: "999999",
    },
    rankingEmpresas: null,
    distribucionEstado: undefined,
    distribucionEntidad: [],
    tendencia: null,
  });

  assert.deepEqual(result.summary, {
    totalLicencias: 12,
    licenciasVigentes: 5,
    trabajadoresConLicencia: 4,
    totalDias: 36,
    totalAnticipos: 9000,
    totalSubsidios: 13500,
    saldoBruto: 4500,
  });
  assert.deepEqual(result.ranking, []);
  assert.deepEqual(result.states, []);
  assert.deepEqual(result.entities, []);
  assert.deepEqual(result.timeline, []);
});

test("keeps integrated agreements secondary to the gross company balance", () => {
  const result = normalizeLicenciasOperations({
    empresa: { rut: "11-1", nombre: "Uno" },
    metricas: {
      anticipos: { total: "8000", cantidad: "2" },
      subsidios: { total: "5000", cantidad: "1" },
      cuentaCorriente: {
        saldo: "7000",
        recuperadoAcuerdos: "10000",
        moduloAcuerdosActivo: true,
      },
      licencias: { total: "3", vigentes: "2", diasTotales: "20", porEstado: null },
      trabajadores: { conLicencia: "2" },
    },
    detalle: null,
    integracionAcuerdos: { saldos: { neto: 7000 } },
  });

  assert.deepEqual(result.financial, {
    totalAnticipos: 8000,
    totalSubsidios: 5000,
    saldoBruto: -3000,
    acuerdos: {
      activo: true,
      saldoIntegrado: 7000,
      recuperado: 10000,
      detail: { saldos: { neto: 7000 } },
    },
  });
});

test("builds a hub with three standard destinations and one complementary worker file", () => {
  assert.deepEqual(getLicenciasWorkspaceLinks(), {
    sections: [
      {
        key: "dashboard-analitico",
        label: "Dashboard Analítico",
        href: "/servicios/licencias-medicas/dashboard-analitico",
      },
      {
        key: "dashboard-operativo",
        label: "Dashboard Operativo",
        href: "/servicios/licencias-medicas/dashboard-operativo",
      },
      {
        key: "gestiones",
        label: "Gestiones",
        href: "/servicios/licencias-medicas/gestiones",
      },
    ],
    complementary: [
      {
        key: "ficha-trabajador",
        label: "Ficha Trabajador",
        href: "/servicios/licencias-medicas/ficha-trabajador",
      },
    ],
  });
});

test("maps legacy tabs to canonical destinations without dropping customer context", () => {
  const cases = [
    [
      "dashboard-global",
      { empresa: "11-1" },
      "/servicios/licencias-medicas/dashboard-analitico?empresa=11-1",
    ],
    [
      "dashboard-operativo",
      { empresa: "22-2" },
      "/servicios/licencias-medicas/dashboard-operativo?empresa=22-2",
    ],
    [
      "gestiones",
      { empresa: "22-2" },
      "/servicios/licencias-medicas/gestiones?empresa=22-2",
    ],
    [
      "ficha-trabajador",
      { trabajador: "12.345.678-9" },
      "/servicios/licencias-medicas/ficha-trabajador?trabajador=12.345.678-9",
    ],
  ];

  cases.forEach(([tab, params, expected]) => {
    assert.equal(resolveLicenciasLegacyHref(tab, params), expected);
  });
  assert.equal(resolveLicenciasLegacyHref("desconocido", {}), null);
});
