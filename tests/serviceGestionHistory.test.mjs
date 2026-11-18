import test from "node:test";
import assert from "node:assert/strict";
import {
  getGestionHistoryRequest,
  getGestionHistoryExcelPath,
  normalizeGestionHistoryPage,
} from "../src/services/serviceGestionHistory.mjs";

test("requests subsequent pages without losing the selected company or dates", () => {
  assert.deepEqual(
    getGestionHistoryRequest("zonas-extremas", {
      page: 27,
      empresaRut: "11-1",
      from: "2026-01-01",
      to: "2026-11-18",
    }),
    {
      endpoint: "/gestion-zonas-extremas",
      params: {
        limit: 20,
        offset: 520,
        empresaRut: "11-1",
        fechaGestion_inicio: "2026-01-01",
        fechaGestion_termino: "2026-11-18",
      },
    }
  );
  assert.deepEqual(getGestionHistoryRequest("cargas-familiares").params, {
    limit: 20,
    offset: 0,
  });
});

test("preserves the total for paginating across all management records", () => {
  const rows = [{ id: 511 }];
  assert.deepEqual(normalizeGestionHistoryPage({ data: rows, total: "521" }), {
    rows,
    total: 521,
  });
  assert.deepEqual(normalizeGestionHistoryPage({ data: [], total: 0 }), {
    rows: [],
    total: 0,
  });
});

test("exports the details of the selected record for each service", () => {
  const paths = {
    "cargas-familiares": "/gestion-carga-familiar/42/detalles/export",
    "depositos-convenidos": "/gestion-depositos-convenidos/42/detalles/export",
    "notificaciones-previsionales": "/gestion-notificaciones-previsionales/42/detalles/export",
    "zonas-extremas": "/gestion-zonas-extremas/42/export",
  };

  for (const [serviceKey, path] of Object.entries(paths)) {
    assert.equal(getGestionHistoryExcelPath(serviceKey, 42), path);
  }
});
