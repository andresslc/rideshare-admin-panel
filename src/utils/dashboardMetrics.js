// Missing, malformed and negative values must never become a reported zero.
export function metricNumber(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function metricCount(value) {
  const number = metricNumber(value);
  return Number.isSafeInteger(number) ? number : null;
}

export function formatMetric(value) {
  return metricCount(value)?.toLocaleString() ?? "—";
}

export function formatMoney(value) {
  const number = metricNumber(value);
  return number === null ? "—" : new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
  }).format(number);
}

export function entityId(row) {
  const id = row?.id ?? row?._id;
  return typeof id === "string" && id.trim() ? id : null;
}

function uniquePeople(rows) {
  if (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== "object" || !entityId(row))) return null;
  return [...new Map(rows.map((row) => [entityId(row), row])).values()];
}

export function getLiveMetrics(data) {
  const drivers = uniquePeople(data?.drivers);
  const riders = uniquePeople(data?.riders);
  return {
    onlineDrivers: drivers?.length ?? null,
    unassignedDrivers: drivers?.filter((driver) => !driver.activeRideId && !driver.activeCarpoolId).length ?? null,
    assignedDrivers: drivers?.filter((driver) => driver.activeRideId || driver.activeCarpoolId).length ?? null,
    ridersOnTrips: riders?.filter((rider) => rider.activeRideId && rider.rideStatus === "in-progress").length ?? null,
    ridersSearching: riders?.filter((rider) => rider.activeRideId && rider.rideStatus === "requested").length ?? null,
    ridersAwaitingPickup: riders?.filter((rider) => rider.activeRideId && ["accepted", "coming", "arrived"].includes(rider.rideStatus)).length ?? null,
  };
}

export function getRegistrationProjection(registrations) {
  const last7 = metricCount(registrations?.last7Days);
  const last30 = metricCount(registrations?.last30Days);
  return {
    recentPace: last7 === null ? null : Math.round(last7 / 7 * 30),
    monthlyPace: last30,
  };
}

// Rolling windows have one explicit end instant shared by every historical metric.
export function getRidePeriod(period, now = new Date()) {
  if (!["7", "30", "all"].includes(period)) throw new Error("Invalid reporting period");
  const end = new Date(now);
  if (!Number.isFinite(end.getTime())) throw new Error("Invalid reporting date");
  return {
    ...(period !== "all" && { startDate: new Date(end.getTime() - Number(period) * 86_400_000).toISOString() }),
    endDate: end.toISOString(),
  };
}

export const DOCUMENT_LABELS = {
  driverLicense: "Driver license",
  vehicleRegistration: "Vehicle registration",
  insurance: "Insurance",
};

export const ONBOARDING_GROUPS = {
  missingVehicle: "Missing vehicle",
  missingDocuments: "Missing documents",
  needsCorrection: "Needs correction",
  readyForReview: "Ready for review",
  approved: "Approved requirements",
  unknown: "Unknown / review required",
};

const requirementLabels = { vehicle: "Vehicle", ...DOCUMENT_LABELS };
const requirementLines = [["missing", "Missing"], ["pending", "Waiting for review"], ["verified", "Verified"], ["old", "Old"], ["unknown", "Unknown"], ["approved", "Approved"]];

// The server owns classification; dates add display information only.
export function describeRequirements(requirements, now = Date.now()) {
  const items = Object.entries(requirementLabels).map(([key, label]) => {
    const item = requirements?.[key];
    const expiry = item?.expiryDate;
    const dateOnly = typeof expiry === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiry);
    let expiryTime = typeof expiry === "string" ? Date.parse(dateOnly ? expiry + "T23:59:59.999Z" : expiry) : NaN;
    if (dateOnly && Number.isFinite(expiryTime) && new Date(expiryTime).toISOString().slice(0, 10) !== expiry) expiryTime = NaN;
    const suffix = expiry == null ? "" : !Number.isFinite(expiryTime) ? " (expiry unknown)" : expiryTime < now ? " (expiry passed)" : "";
    const status = ["missing", "pending", "rejected", "verified", "old", "approved"].includes(item?.status) ? item.status : "unknown";
    return { key, label: label + suffix, status, reason: typeof item?.rejectReason === "string" ? item.rejectReason : null };
  });
  return {
    rejected: items.filter((item) => item.status === "rejected").map(({ key, label, reason }) => ({ key, label, reason })),
    lines: requirementLines.flatMap(([status, title]) => {
      const labels = items.filter((item) => item.status === status).map((item) => item.label);
      return labels.length ? [{ status, title, labels }] : [];
    }),
  };
}
