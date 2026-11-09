import test from "node:test";
import assert from "node:assert/strict";
import { metricNumber, metricCount, getLiveMetrics, getRegistrationProjection, getRidePeriod, describeRequirements, ONBOARDING_GROUPS } from "../src/utils/dashboardMetrics.js";
import { dashboardStats, registeredRiders, subscriptionCollections, liveSnapshot, rideAnalytics, reportPreview, paginationTotals, driverRequirementQueue } from "../src/utils/dashboardSources.js";
import { linkedUserType, linkedReportStatus, linkedRevenueTab } from "../src/utils/dashboardLinks.js";

test("missing numbers stay unavailable while genuine zero survives", () => {
  for (const value of [null, undefined, "", " ", false, true, {}, [], -1, NaN, Infinity, "0x10", "broken"]) {
    assert.equal(metricNumber(value), null);
  }
  assert.equal(metricNumber(0), 0);
  assert.equal(metricNumber("400.50"), 400.5);
  assert.equal(metricCount("2.5"), null);
  assert.equal(metricCount("7"), 7);
  assert.equal(metricCount(Number.MAX_SAFE_INTEGER + 1), null);
});

test("live people are distinct and pickup states are not started trips", () => {
  const data = { drivers: [{ id: "d1" }, { id: "d1" }, { id: "d2", activeCarpoolId: "cp" }, { id: "d3", activeRideId: "private" }],
    riders: ["in-progress", "requested", "accepted", "coming", "arrived", "cancelled"].map((rideStatus, index) => ({ id: "r" + index, rideStatus, activeRideId: "ride" })) };
  data.riders.push(data.riders[0], { id: "idle", rideStatus: "in-progress", activeRideId: null });
  assert.deepEqual(getLiveMetrics(data), { onlineDrivers: 3, unassignedDrivers: 1, assignedDrivers: 2, ridersOnTrips: 1, ridersSearching: 1, ridersAwaitingPickup: 3 });
});

test("empty live lists are zero, malformed lists and missing identities are unavailable", () => {
  assert.equal(getLiveMetrics({ drivers: [], riders: [] }).onlineDrivers, 0);
  for (const drivers of [undefined, {}, [null], ["id"], [{}], [{ id: "" }], [{ id: {} }]]) {
    assert.equal(getLiveMetrics({ drivers, riders: [] }).onlineDrivers, null);
    assert.throws(() => liveSnapshot({ data: { drivers, riders: [] } }), /invalid/);
  }
});

test("rider accounts use server total and successful subscription transaction aggregate", () => {
  assert.equal(registeredRiders({ data: [{ id: "one" }], pagination: { total: 7000 } }), 7000);
  assert.throws(() => registeredRiders({ data: [], pagination: { total: -1 } }));
  assert.throws(() => registeredRiders({ data: [], pagination: { total: 1.5 } }));
  const response = { data: { stats: { totalRevenue: 10 * 40 }, subscriptions: [{ amount: 40 }] } };
  assert.equal(subscriptionCollections(response), 400);
  assert.throws(() => subscriptionCollections({ data: { subscriptionRevenueUSD: 40, withdrawalCommissionRevenueUSD: 100 } }));
});

test("registration pace estimates preserve zero and missing inputs", () => {
  assert.deepEqual(getRegistrationProjection({ last7Days: 7, last30Days: 18 }), { recentPace: 30, monthlyPace: 18 });
  assert.deepEqual(getRegistrationProjection({ last7Days: 0 }), { recentPace: 0, monthlyPace: null });
  assert.deepEqual(getRegistrationProjection({}), { recentPace: null, monthlyPace: null });
});

test("reporting windows share an exact UTC end and remain stable across DST", () => {
  const now = new Date("2026-11-03T12:00:00Z");
  assert.deepEqual(getRidePeriod("7", now), { startDate: "2026-10-27T12:00:00.000Z", endDate: "2026-11-03T12:00:00.000Z" });
  assert.deepEqual(getRidePeriod("all", now), { endDate: now.toISOString() });
  assert.throws(() => getRidePeriod("today", now));
});

test("list pagination distinguishes empty results from missing or fractional metadata", () => {
  assert.deepEqual(paginationTotals({ pagination: { total: 0, totalPages: 0 } }), { total: 0, totalPages: 0 });
  for (const pagination of [undefined, { total: 1 }, { total: -1, totalPages: 0 }, { total: 1, totalPages: 1.5 }]) {
    assert.throws(() => paginationTotals({ pagination }), /Pagination/);
  }
});

test("malformed sources cannot masquerade as successful snapshots", () => {
  assert.throws(() => dashboardStats({ data: {} }));
  assert.throws(() => rideAnalytics({ data: { overview: { totalRides: 0, completedRides: 0, cancelledRides: 0 } } }));
  assert.throws(() => reportPreview({ data: { results: [], stats: {} } }));
  const analytics = { overview: { totalRides: 12, completedRides: 4, cancelledRides: 2 }, rideDistribution: [{ type: "private", count: 9 }, { type: "economy", count: 8 }] };
  assert.equal(rideAnalytics({ data: analytics }), analytics);
});

test("dashboard links recognize supported scopes and ignore unsupported values", () => {
  assert.equal(linkedUserType("?type=rider&scope=all"), "rider");
  assert.equal(linkedReportStatus("?status=pending"), "pending");
  assert.equal(linkedReportStatus("?status="), "");
  assert.equal(linkedRevenueTab("?tab=withdrawal&scope=all"), "withdrawal");
  assert.equal(linkedUserType("?type=admin"), undefined);
  assert.equal(linkedReportStatus("?status=investigating"), undefined);
  // The reports endpoint accepts only pending or resolved filters.
  assert.equal(linkedReportStatus("?status=rejected"), undefined);
  assert.equal(linkedRevenueTab("?tab=unknown"), undefined);
});


const requirementItems = (statuses = ["approved", "approved", "approved", "pending"]) => Object.fromEntries(
  ["vehicle", "driverLicense", "vehicleRegistration", "insurance"].map((key, index) => [key, { id: key + "-id", status: statuses[index], rejectReason: null, expiryDate: null }]),
);
const requirementResponse = () => ({
  data: [{ _id: "one", requirementGroup: "readyForReview", requirements: requirementItems() }],
  pagination: { total: 1, totalPages: 1 },
  meta: { requirementStats: { total: 3, ...Object.fromEntries(Object.keys(ONBOARDING_GROUPS).map((key) => [key, key === "readyForReview" ? 3 : 0])) } },
});

test("requirement descriptions group labels in display order and retain rejection reasons", () => {
  const requirements = requirementItems(["rejected", "missing", "pending", "verified"]);
  requirements.vehicle.rejectReason = "Photo unreadable";
  const result = describeRequirements(requirements);
  assert.deepEqual(result.rejected, [{ key: "vehicle", label: "Vehicle", reason: "Photo unreadable" }]);
  assert.deepEqual(result.lines, [
    { status: "missing", title: "Missing", labels: ["Driver license"] },
    { status: "pending", title: "Waiting for review", labels: ["Vehicle registration"] },
    { status: "verified", title: "Verified", labels: ["Insurance"] },
  ]);
  const other = describeRequirements(requirementItems(["approved", "old", "unknown", "something-else"]));
  assert.deepEqual(other.lines, [
    { status: "old", title: "Old", labels: ["Driver license"] },
    { status: "unknown", title: "Unknown", labels: ["Vehicle registration", "Insurance"] },
    { status: "approved", title: "Approved", labels: ["Vehicle"] },
  ]);
  assert.equal(describeRequirements(requirementItems(["rejected", "approved", "approved", "approved"])).rejected[0].reason, null);
});

test("requirement descriptions preserve date-only end-of-day expiry and flag invalid dates", () => {
  const requirements = requirementItems();
  requirements.driverLicense.expiryDate = "2026-01-01";
  const during = describeRequirements(requirements, Date.parse("2026-01-01T20:00:00Z"));
  assert.ok(during.lines.find((line) => line.status === "approved").labels.includes("Driver license"));
  const after = describeRequirements(requirements, Date.parse("2026-01-02T00:00:00Z"));
  assert.ok(after.lines.find((line) => line.status === "approved").labels.includes("Driver license (expiry passed)"));
  for (const expiry of ["invalid", "2026-02-31", 123, ""]) {
    requirements.driverLicense.expiryDate = expiry;
    assert.ok(describeRequirements(requirements).lines.flatMap((line) => line.labels).includes("Driver license (expiry unknown)"));
  }
  requirements.vehicle.expiryDate = "2000-01-01T12:00:00Z";
  assert.ok(describeRequirements(requirements).lines.flatMap((line) => line.labels).includes("Vehicle (expiry passed)"));
  assert.ok(describeRequirements(requirementItems()).lines.flatMap((line) => line.labels).every((label) => !label.includes("expiry")));
});

test("missing requirement data displays unknown instead of inventing missing records", () => {
  for (const value of [undefined, null, {}]) assert.deepEqual(describeRequirements(value), {
    rejected: [], lines: [{ status: "unknown", title: "Unknown", labels: ["Vehicle", "Driver license", "Vehicle registration", "Insurance"] }],
  });
});

test("queue source accepts complete whole-queue stats and filtered page totals", () => {
  const response = requirementResponse();
  assert.deepEqual(driverRequirementQueue(response), { rows: response.data, pagination: response.pagination, stats: response.meta.requirementStats });
  response.data = [];
  response.pagination = { total: 0, totalPages: 0 };
  assert.equal(driverRequirementQueue(response).stats.total, 3);
});

test("queue source rejects invalid stats, unknown groups and incomplete items", () => {
  const changes = [
    (response) => { response.meta.requirementStats.total = 2; },
    (response) => { delete response.meta.requirementStats.unknown; },
    (response) => { response.meta.requirementStats.missingVehicle = -1; },
    (response) => { response.meta.requirementStats.missingVehicle = 0.5; },
    (response) => { response.meta.requirementStats.total = "3"; },
    (response) => { response.meta = {}; },
    (response) => { response.meta = null; },
    (response) => { response.data[0].requirementGroup = "awaitingReview"; },
    (response) => { response.data[0].requirementGroup = "toString"; },
    (response) => { response.data[0].requirements = []; },
    (response) => { delete response.data[0].requirements.insurance; },
    (response) => { response.data[0].requirements.vehicle = null; },
  ];
  for (const change of changes) {
    const response = requirementResponse();
    change(response);
    assert.throws(() => driverRequirementQueue(response), /Driver requirements/);
  }
});

test("queue legacy mode accepts list-only rows with valid pagination", () => {
  const response = { data: [{ _id: "one", pendingDocuments: [] }], pagination: { total: 1, totalPages: 1 } };
  assert.deepEqual(driverRequirementQueue(response), { rows: response.data, pagination: response.pagination, stats: null });
  for (const data of [undefined, {}, [null], [{}]]) assert.throws(() => driverRequirementQueue({ ...response, data }), /Driver submissions/);
  assert.throws(() => driverRequirementQueue({ ...response, pagination: { total: 1 } }), /Pagination/);
});
