import test from "node:test";
import assert from "node:assert/strict";
import { getMoraGlobalDashboard } from "../src/services/api/globalDashboards.js";

const respond = (data, status = 200) =>
  new Response(JSON.stringify(data), { status });
const company = (empresaRut) => ({ empresaRut });

test("loads KPI data for the companies returned by the authorized scope", async (t) => {
  const kpis = { totalCasos: 4, totalDeuda: 32000 };
  const requests = t.mock.method(globalThis, "fetch", async (url) => {
    const params = new URL(url, "http://localhost").searchParams;
    if (params.size === 0) {
      return respond({
        data: {
          requiresSelection: true,
          scope: { availableEmpresas: [company("11-1"), company("22-2")] },
        },
      });
    }
    assert.equal(params.get("empresaRuts"), "11-1,22-2");
    return respond({ data: { requiresSelection: false, kpis } });
  });

  assert.deepEqual(await getMoraGlobalDashboard(), { requiresSelection: false, kpis });
  assert.equal(requests.mock.callCount(), 2);
});

test("returns the empty scope when there are no available companies", async (t) => {
  const data = { requiresSelection: true, scope: { availableEmpresas: [] } };
  const requests = t.mock.method(globalThis, "fetch", async () => respond({ data }));

  assert.deepEqual(await getMoraGlobalDashboard(), data);
  assert.equal(requests.mock.callCount(), 1);
});

test("keeps an explicit company filter and reports a rejected selection", async (t) => {
  const requests = t.mock.method(globalThis, "fetch", async (url) => {
    const params = new URL(url, "http://localhost").searchParams;
    assert.equal(params.get("empresaRuts"), "33-3");
    return respond({ message: "Empresa fuera de alcance." }, 403);
  });

  await assert.rejects(getMoraGlobalDashboard({ empresaRuts: ["33-3"] }), /Empresa fuera de alcance/);
  assert.equal(requests.mock.callCount(), 1);
});

test("passes the same cancellation signal to both requests", async (t) => {
  const { signal } = new AbortController();
  const requests = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.signal, signal);
    const params = new URL(url, "http://localhost").searchParams;
    return params.has("empresaRuts")
      ? respond({ data: { requiresSelection: false, kpis: { totalCasos: 0 } } })
      : respond({
          data: {
            requiresSelection: true,
            scope: { availableEmpresas: [company("11-1"), company("11-1"), company("")] },
          },
        });
  });

  await getMoraGlobalDashboard(undefined, { signal });
  assert.equal(requests.mock.callCount(), 2);
  const [url] = requests.mock.calls[1].arguments;
  assert.equal(new URL(url, "http://localhost").searchParams.get("empresaRuts"), "11-1");
});

test("reports an unresolved selection after a single follow-up", async (t) => {
  const data = { requiresSelection: true, scope: { availableEmpresas: [company("11-1")] } };
  const requests = t.mock.method(globalThis, "fetch", async () => respond({ data }));

  await assert.rejects(getMoraGlobalDashboard(), /No fue posible seleccionar las empresas/);
  assert.equal(requests.mock.callCount(), 2);
});
