import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateOperationalDashboard,
  formatDashboardDate,
  humanizeStatus,
} from "../src/services/operationalServiceDashboard.mjs";

const definition = {
  volumeField: "totalCasos",
};

test("aggregates summary, normalized states, companies, timeline and latest rows", () => {
  const rows = [
    {
      id: 3,
      folio: "NP-00003",
      empresaRut: "11-1",
      empresaNombre: "Empresa Uno",
      estado: "PROCESADA",
      totalCasos: "7",
      fechaGestion: "2026-09-30",
      createdAt: "2026-10-02T12:00:00.000Z",
    },
    {
      id: 2,
      folio: "NP-00002",
      empresaRut: "11-1",
      empresaNombre: "Empresa Uno",
      estado: "procesada",
      totalCasos: 3,
      fechaGestion: "2026-09-15",
      createdAt: "2026-09-16T12:00:00.000Z",
    },
    {
      id: 1,
      folio: "NP-00001",
      empresaRut: "22-2",
      estado: "en_analisis",
      totalCasos: "5",
      fechaGestion: "2026-08-01",
      createdAt: "2026-08-02T12:00:00.000Z",
    },
  ];

  const result = aggregateOperationalDashboard(rows, definition, 3);

  assert.deepEqual(result.summary, {
    totalGestiones: 3,
    totalVolumen: 15,
    totalEmpresas: 2,
    cerradas: 2,
    porcentajeCierre: 66.7,
  });
  assert.deepEqual(result.states, [
    { key: "procesada", label: "Procesada", value: 2 },
    { key: "en_analisis", label: "En analisis", value: 1 },
  ]);
  assert.deepEqual(result.companies, [
    { empresaRut: "11-1", empresaNombre: "Empresa Uno", gestiones: 2, volumen: 10 },
    { empresaRut: "22-2", empresaNombre: "22-2", gestiones: 1, volumen: 5 },
  ]);
  assert.deepEqual(result.timeline, [
    { periodo: "2026-08", gestiones: 1, volumen: 5 },
    { periodo: "2026-09", gestiones: 2, volumen: 10 },
  ]);
  assert.equal(result.latest.length, 3);
  assert.equal(result.latest[0].folio, "NP-00003");
});

test("returns a stable empty dashboard", () => {
  assert.deepEqual(aggregateOperationalDashboard([], definition, 0), {
    summary: {
      totalGestiones: 0,
      totalVolumen: 0,
      totalEmpresas: 0,
      cerradas: 0,
      porcentajeCierre: 0,
    },
    states: [],
    companies: [],
    timeline: [],
    latest: [],
  });
});

test("humanizes empty and separated status values", () => {
  assert.equal(humanizeStatus("pre-facturada"), "Pre facturada");
  assert.equal(humanizeStatus("EN_ANALISIS"), "En analisis");
  assert.equal(humanizeStatus(""), "Sin estado");
});

test("formats dashboard dates without depending on browser locale or timezone", () => {
  assert.equal(formatDashboardDate("2026-09-30T23:45:00.000Z"), "30-09-2026");
  assert.equal(formatDashboardDate("2026-02-03"), "03-02-2026");
  assert.equal(formatDashboardDate(""), "—");
});

