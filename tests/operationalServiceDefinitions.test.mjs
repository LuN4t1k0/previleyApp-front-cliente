import test from "node:test";
import assert from "node:assert/strict";
import {
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

