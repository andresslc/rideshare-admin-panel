import test from "node:test";
import assert from "node:assert/strict";
import { createDashboardResource } from "../src/utils/dashboardResource.js";

const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test("automatic ticks skip slow requests without cancellation or overlap", async () => {
  const request = deferred();
  let calls = 0, signal;
  const states = [];
  const resource = createDashboardResource((currentSignal) => { calls += 1; signal = currentSignal; return request.promise; }, (state) => states.push(state));
  const pending = resource.refresh();
  await resource.refresh({ automatic: true });
  await resource.refresh({ automatic: true });
  assert.equal(calls, 1);
  assert.equal(signal.aborted, false);
  request.resolve({ count: 1 }); await pending;
  assert.deepEqual(states.at(-1).data, { count: 1 });
  resource.dispose();
});

test("manual retry replaces a request and late success cannot win", async () => {
  const first = deferred(), second = deferred();
  let calls = 0, firstSignal;
  const states = [];
  const resource = createDashboardResource((signal) => {
    if (++calls === 1) { firstSignal = signal; return first.promise; }
    return second.promise;
  }, (state) => states.push(state));
  const old = resource.refresh(), current = resource.refresh();
  assert.equal(firstSignal.aborted, true);
  second.resolve("new"); await current;
  first.resolve("old"); await old;
  assert.equal(states.at(-1).data, "new");
});

test("failed refresh preserves last success and original freshness; retry clears error", async () => {
  let fail = false;
  const states = [], timestamp = new Date("2026-09-30T12:00:00Z");
  const resource = createDashboardResource(async () => {
    if (fail) throw new Error("Network unavailable");
    return 0;
  }, (state) => states.push(state), () => timestamp);
  await resource.refresh();
  fail = true; await resource.refresh();
  assert.equal(states.at(-1).data, 0);
  assert.equal(states.at(-1).updatedAt, timestamp);
  assert.equal(states.at(-1).error, "Network unavailable");
  fail = false; await resource.refresh();
  assert.equal(states.at(-1).error, null);
});

test("failed initial or empty response remains unavailable instead of zero", async () => {
  const states = [];
  const resource = createDashboardResource(async () => null, (state) => states.push(state));
  await resource.refresh();
  assert.equal(states.at(-1).data, null);
  assert.equal(states.at(-1).updatedAt, null);
  assert.equal(states.at(-1).loading, false);
  assert.match(states.at(-1).error, /No data/);
});

test("unmount aborts and ignores late failures, then Strict Mode setup uses a fresh runner", async () => {
  const request = deferred(), states = [];
  let signal;
  const resource = createDashboardResource((currentSignal) => { signal = currentSignal; return request.promise; }, (state) => states.push(state));
  const pending = resource.refresh();
  resource.dispose();
  const count = states.length;
  assert.equal(signal.aborted, true);
  request.reject(new Error("Late failure")); await pending;
  assert.equal(states.length, count);
  await resource.refresh();
  assert.equal(states.length, count);
  const next = createDashboardResource(async () => "fresh", (state) => states.push(state));
  await next.refresh();
  assert.equal(states.at(-1).data, "fresh");
});

test("independent sources survive another source failure", async () => {
  let healthy, failed;
  const good = createDashboardResource(async () => 400, (state) => { healthy = state; });
  const bad = createDashboardResource(async () => { throw new Error("Map offline"); }, (state) => { failed = state; });
  await Promise.all([good.refresh(), bad.refresh()]);
  assert.equal(healthy.data, 400);
  assert.equal(healthy.error, null);
  assert.equal(failed.data, null);
  assert.equal(failed.error, "Map offline");
});
