import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLicenciasManagementQuery,
  getGestionLicenciaDetailHref,
  getGestionLicenciaExcelPath,
  normalizeGestionLicenciaPage,
} from "../src/services/licenciasManagement.mjs";

test("builds a paginated management query and omits empty filters", () => {
  assert.deepEqual(
    buildLicenciasManagementQuery({
      page: 3,
      pageSize: 20,
      empresaRut: "76.123.456-7",
      folioInterno: "  LM-42  ",
      periodo: "",
      estado: null,
    }),
    {
      limit: 20,
      offset: 40,
      empresaRut: "76.123.456-7",
      folioInterno: "LM-42",
    }
  );
});

test("normalizes pagination and explicit management columns", () => {
  assert.deepEqual(
    normalizeGestionLicenciaPage({
      total: "41",
      limit: "20",
      offset: "20",
      pages: "3",
      data: [
        {
          id: 9,
          empresaRut: "76.123.456-7",
          empresaNombre: "Empresa Demo",
          folioInterno: "LM-0009",
          periodo: "2026-10",
          estado: "en_proceso",
          totalLicencias: "14",
        },
      ],
    }),
    {
      total: 41,
      page: 2,
      pageSize: 20,
      totalPages: 3,
      rows: [
        {
          id: 9,
          empresaRut: "76.123.456-7",
          empresaNombre: "Empresa Demo",
          folioInterno: "LM-0009",
          periodo: "2026-10",
          estado: "en_proceso",
          totalLicencias: 14,
        },
      ],
    }
  );
});

test("derives the license count from included licenses for legacy responses", () => {
  const page = normalizeGestionLicenciaPage({
    data: [{ id: 1, licencias: [{ id: 2 }, { id: 3 }] }],
  });

  assert.equal(page.rows[0].totalLicencias, 2);
  assert.equal(page.page, 1);
  assert.equal(page.totalPages, 1);
});

test("builds read-only detail and individual Excel endpoints", () => {
  assert.equal(
    getGestionLicenciaDetailHref(27),
    "/licencia-medica/conciliacion/gestiones/27?modo=lectura"
  );
  assert.equal(
    getGestionLicenciaExcelPath(27),
    "/gestion-licencia/27/excel-detalle"
  );
});
