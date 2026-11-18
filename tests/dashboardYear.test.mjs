import test from "node:test";
import assert from "node:assert/strict";
import {
  getDashboardYearRange,
  getDashboardYearParams,
  normalizeDashboardYears,
} from "../src/services/dashboardYear.mjs";

test("uses the full history when the year is blank", () => {
  assert.equal(getDashboardYearRange(""), undefined);
  assert.deepEqual(getDashboardYearParams(""), {});
});

test("generates the inclusive dates of a calendar year without timezone conversion", () => {
  assert.deepEqual(getDashboardYearRange("2024"), { from: "2024-01-01", to: "2024-12-31" });
  assert.deepEqual(getDashboardYearParams("2024"), {
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
  });
  assert.equal(getDashboardYearRange("2024-02"), undefined);
});

test("shows only distinct management years returned by the service", () => {
  assert.deepEqual(normalizeDashboardYears(["2017", null, "2025", 2017, "2022", "2024-03"]), [
    "2025",
    "2022",
    "2017",
  ]);
  assert.deepEqual(normalizeDashboardYears([]), []);
  assert.deepEqual(normalizeDashboardYears(undefined), []);
});
