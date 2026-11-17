import test from "node:test";
import assert from "node:assert/strict";
import {
  getCanonicalOperationalServiceKey,
  getOperationalDashboardDefinition,
  isOperationalDashboardService,
} from "../src/config/operationalServiceDashboards.mjs";

test("resolves each contracted operational service to its API contract", () => {
  assert.deepEqual(
    ["cargas-familiares", "depositos-convenidos", "notificaciones-previsionales"].map(
      (key) => {
        const definition = getOperationalDashboardDefinition(key);
        return [key, definition.endpoint, definition.volumeField];
      }
    ),
    [
      ["cargas-familiares", "/gestion-carga-familiar", "totalCargas"],
      ["depositos-convenidos", "/gestion-depositos-convenidos", "totalRegistros"],
      ["notificaciones-previsionales", "/gestion-notificaciones-previsionales", "totalCasos"],
    ]
  );
});

test("rejects unknown service keys", () => {
  assert.equal(isOperationalDashboardService("mora"), false);
  assert.equal(getOperationalDashboardDefinition("desconocido"), null);
});

test("maps contracted aliases to the dashboard key used by the route", () => {
  assert.equal(getCanonicalOperationalServiceKey("cf"), "cargas-familiares");
  assert.equal(getCanonicalOperationalServiceKey("dc"), "depositos-convenidos");
  assert.equal(
    getCanonicalOperationalServiceKey("notificaciones-previsionales"),
    "notificaciones-previsionales"
  );
  assert.equal(getCanonicalOperationalServiceKey("pagex"), null);
});

