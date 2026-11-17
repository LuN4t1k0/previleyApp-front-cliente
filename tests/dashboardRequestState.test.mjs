import test from "node:test";
import assert from "node:assert/strict";
import {
  createDashboardNotConfiguredError,
  createLatestRequestTracker,
} from "../src/services/dashboardRequestState.mjs";

test("only the latest dashboard request is allowed to update visible data", () => {
  const tracker = createLatestRequestTracker();
  const globalRequest = tracker.begin();
  const companyRequest = tracker.begin();

  assert.equal(tracker.isCurrent(globalRequest), false);
  assert.equal(tracker.isCurrent(companyRequest), true);
});

test("creates a distinguishable configuration error for unsupported dashboards", () => {
  const error = createDashboardNotConfiguredError("funes");

  assert.equal(error.code, "DASHBOARD_NOT_CONFIGURED");
  assert.equal(error.message, "No existe un dashboard para el servicio funes.");
});

