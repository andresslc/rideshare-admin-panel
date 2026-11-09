import { metricCount, metricNumber, getLiveMetrics, entityId, ONBOARDING_GROUPS } from "./dashboardMetrics.js";

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const requireShape = (valid, source) => {
  if (!valid) throw new Error(source + " returned incomplete or invalid data");
};

export function dashboardStats(response) {
  const data = response?.data;
  requireShape(object(data?.userMetrics) && object(data?.rideMetrics) && object(data?.pendingActions)
    && metricCount(data.userMetrics.totalDrivers) !== null, "Dashboard statistics");
  return data;
}

export function registeredRiders(response) {
  const total = metricCount(response?.pagination?.total);
  requireShape(Array.isArray(response?.data) && total !== null, "Registered rider count");
  return total;
}

export function liveSnapshot(response) {
  const data = response?.data;
  const counts = getLiveMetrics(data);
  requireShape(counts.onlineDrivers !== null && counts.ridersOnTrips !== null, "Live snapshot");
  return data;
}

export function subscriptionCollections(response) {
  const total = metricNumber(response?.data?.stats?.totalRevenue);
  requireShape(total !== null, "Subscription collections");
  return total;
}

export function rideAnalytics(response) {
  const data = response?.data;
  requireShape(object(data?.overview)
    && ["totalRides", "completedRides", "cancelledRides"].every((key) => metricCount(data.overview[key]) !== null)
    && Array.isArray(data.rideDistribution)
    && data.rideDistribution.every((row) => object(row) && typeof row.type === "string" && row.type.trim() && metricCount(row.count) !== null), "Ride analytics");
  return data;
}

export function reportPreview(response) {
  const data = response?.data;
  requireShape(object(data?.stats) && Array.isArray(data?.results)
    && data.results.every((row) => object(row) && (entityId(row) || typeof row.reportId === "string"))
    && ["totalReportsReceived", "pendingReports", "resolvedReports", "rejectedReports"].every((key) => metricCount(data.stats[key]) !== null), "Reports");
  return data;
}

export function paginationTotals(response) {
  const pagination = response?.pagination;
  requireShape(metricCount(pagination?.total) !== null && metricCount(pagination?.totalPages) !== null, "Pagination");
  return pagination;
}

export function driverRequirementQueue(response) {
  const rows = response?.data;
  requireShape(Array.isArray(rows) && rows.every((row) => object(row) && entityId(row)), "Driver submissions");
  const pagination = paginationTotals(response);
  if (response.meta === undefined) return { rows, pagination, stats: null };

  const stats = response.meta?.requirementStats;
  const groups = Object.keys(ONBOARDING_GROUPS);
  requireShape(object(stats)
    && ["total", ...groups].every((key) => Number.isSafeInteger(stats[key]) && stats[key] >= 0)
    && groups.reduce((total, key) => total + stats[key], 0) === stats.total
    && rows.every((row) => Object.hasOwn(ONBOARDING_GROUPS, row.requirementGroup)
      && object(row.requirements)
      && ["vehicle", "driverLicense", "vehicleRegistration", "insurance"].every((key) => object(row.requirements[key]))), "Driver requirements");
  return { rows, pagination, stats };
}
