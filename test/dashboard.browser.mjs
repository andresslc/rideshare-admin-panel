import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({ server: { host: "127.0.0.1", port: 4174, strictPort: true, open: false } });
await server.listen();
const base = "http://127.0.0.1:4174";
const browser = await chromium.launch({ headless: true });
await mkdir("node_modules/.dashboard-verification", { recursive: true });
// A cold dev server compiles the whole app on first load, which can exceed the
// per-step timeout. Warm it once with every non-local request blocked.
const warmup = await browser.newPage();
await warmup.route("**/*", (route) => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
await warmup.goto(base + "/auth/login", { timeout: 120_000 });
await warmup.close();
const stats = { userMetrics: { totalDrivers: 1234567, totalRiders: 17, totalActiveDrivers: 55, totalActiveRiders: 19,
  newDriverRegistrations: { last7Days: 7, last30Days: 18 }, newRiderRegistrations: { last7Days: 14, last30Days: 60 } },
  rideMetrics: { totalRidesCompleted: { today: 2, thisWeek: 6, thisMonth: 12 }, totalRidesCancelled: { today: 1, thisWeek: 2, thisMonth: 3 } },
  revenueMetrics: { subscriptionRevenueUSD: 40, withdrawalCommissionRevenueUSD: 125.5 },
  pendingActions: { pendingDriverRequests: 3, pendingReports: 2 } };
const reportStats = { totalReportsReceived: 9, pendingReports: 2, resolvedReports: 6, rejectedReports: 1, mostReportedEntities: [] };
const reports = [{ _id: "case-a", reportId: "case-a", reportReason: "Unsafe driving", date: "2026-09-29T12:00:00Z", status: "pending", reporterFirstName: "Rider", reportedPersonFirstName: "Driver" }];
const requirementItems = (statuses) => Object.fromEntries(
  ["vehicle", "driverLicense", "vehicleRegistration", "insurance"].map((key, index) => [key, { id: statuses[index] === "missing" ? null : key + "-id", status: statuses[index], rejectReason: null, expiryDate: null }]),
);
const drivers = [
  { _id: "driver-a", firstName: "Alex", lastName: "Rivera", email: "alex@example.test", phone: "", ssn: "fixture-only", pendingDocuments: [{ _id: "insurance-id", type: "insurance", status: "pending" }], vehicleCount: 1, hasPendingVehicles: false, requiresApproval: true,
    requirementGroup: "readyForReview", requirements: requirementItems(["approved", "approved", "approved", "pending"]) },
  { _id: "driver-b", firstName: "Jamie", lastName: "Taylor", email: "jamie@example.test", phone: "", pendingDocuments: [], vehicleCount: 0, hasPendingVehicles: false, requiresApproval: true,
    requirementGroup: "missingVehicle", requirements: requirementItems(["missing", "missing", "missing", "missing"]) },
  { _id: "driver-c", firstName: "Sam", lastName: "Lee", email: "sam@example.test", phone: "", pendingDocuments: [], vehicleCount: 1, hasPendingVehicles: true, requiresApproval: true,
    requirementGroup: "needsCorrection", requirements: requirementItems(["approved", "rejected", "approved", "verified"]) },
  { _id: "driver-d", firstName: "Robin", lastName: "Park", email: "robin@example.test", phone: "", pendingDocuments: [{ _id: "historical-insurance-id", type: "insurance", status: "pending" }], vehicleCount: 2, hasPendingVehicles: true, requiresApproval: true,
    requirementGroup: "approved", requirements: requirementItems(["approved", "approved", "approved", "approved"]) },
  { _id: "driver-e", firstName: "Casey", lastName: "Lane", email: "casey@example.test", phone: "", pendingDocuments: [], vehicleCount: 1, hasPendingVehicles: false, requiresApproval: true,
    requirementGroup: "unknown", requirements: requirementItems(["approved", "old", "approved", "verified"]) },
];
drivers[2].requirements.driverLicense.rejectReason = "Image unreadable; upload the complete license";
const snapshot = { drivers: [{ id: "one", activeRideId: null, activeCarpoolId: null }, { id: "one", activeRideId: null, activeCarpoolId: null }, { id: "two", activeCarpoolId: "cp" }],
  riders: [{ id: "r1", activeRideId: "ride", rideStatus: "in-progress" }, { id: "r1", activeRideId: "ride", rideStatus: "in-progress" }, { id: "r2", activeRideId: "ride2", rideStatus: "coming" }, { id: "r3", activeRideId: "ride3", rideStatus: "requested" }] };
const analytics = { overview: { totalRides: 12, completedRides: 4, cancelledRides: 2 }, rideDistribution: [{ type: "private", count: 8, percentage: 66.7 }, { type: "economy", count: 7, percentage: 58.3 }, { type: "luxury", count: 2, percentage: 16.7 }, { type: "carpool", count: 4, percentage: 33.3 }] };

async function fixturePage({ role = "super_admin", width = 1440, mode = "healthy", saved = {}, delay = 0, queue = drivers } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 960 } });
  await context.addInitScript(({ role, saved }) => {
    sessionStorage.setItem("authToken", "fixture-token");
    sessionStorage.setItem("userData", JSON.stringify({ id: "fixture-admin", role, firstName: "Fixture", lastName: "Admin", email: "admin@example.test" }));
    for (const [key, value] of Object.entries(saved)) sessionStorage.setItem(key, JSON.stringify(value));
  }, { role, saved });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const requests = [], errors = [];
  let currentMode = mode;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) errors.push(message.text()); });
  await page.route("**/*", async (route) => {
    const request = route.request(), url = new URL(request.url());
    if (!url.pathname.includes("/api/admin/")) {
      if (url.origin === base) return route.continue();
      return route.abort();
    }
    requests.push({ method: request.method(), path: url.pathname, params: Object.fromEntries(url.searchParams) });
    assert.equal(request.method(), "GET", "Browser verification must be read-only");
    const endpoint = url.pathname.split("/api/admin/")[1];
    const empty = currentMode === "empty";
    const pagination = { currentPage: Number(url.searchParams.get("page") || 1), totalPages: 1, total: 0 };
    let data, meta;
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (currentMode === "failed" || currentMode === "stale" && ["birds-eye-view", "ride-analytics"].includes(endpoint)) {
      return route.fulfill({ status: 503, json: { success: false, message: "Fixture source unavailable" } });
    }
    if (currentMode === "malformed" && endpoint === "birds-eye-view") {
      return route.fulfill({ json: { success: true, data: { drivers: [{}], riders: [] } } });
    }
    if (endpoint === "dashboard-stats") data = empty ? { userMetrics: { totalDrivers: 0, newDriverRegistrations: { last7Days: 0, last30Days: 0 }, newRiderRegistrations: { last7Days: 0, last30Days: 0 } }, rideMetrics: {}, revenueMetrics: { withdrawalCommissionRevenueUSD: 0 }, pendingActions: { pendingDriverRequests: 0 } } : stats;
    else if (endpoint === "birds-eye-view") data = empty ? { drivers: [], riders: [] } : snapshot;
    else if (endpoint === "ride-analytics") data = empty ? { overview: { totalRides: 0, completedRides: 0, cancelledRides: 0 }, rideDistribution: [] } : analytics;
    else if (endpoint === "reports") {
      data = { results: empty ? [] : reports.map((report) => ({ ...report, status: url.searchParams.get("status") || "pending" })), stats: empty ? { ...reportStats, totalReportsReceived: 0, pendingReports: 0, resolvedReports: 0, rejectedReports: 0 } : reportStats };
      pagination.total = empty ? 0 : 2;
    } else if (endpoint === "subscription-revenue") data = { results: [], stats: { totalRevenue: empty ? 0 : 400, totalSubscriptionsPurchased: 1, totalActiveSubscriptions: 1, totalExpiredSubscriptions: 0 } };
    else if (endpoint === "withdrawals") data = { results: [], stats: { totalCommissionRevenue: 125.5, totalWithdrawalsProcessed: 1 } };
    else if (endpoint === "users") { data = empty ? [] : [{ id: "rider-a", firstName: "Riley", lastName: "Morgan", email: "riley@example.test", status: "active" }]; pagination.total = empty ? 0 : 7000; pagination.totalPages = empty ? 1 : 700; }
    else if (endpoint === "drivers") {
      const search = (url.searchParams.get("search") || "").toLowerCase();
      const rows = empty ? [] : queue.filter((driver) => [driver.firstName, driver.lastName, driver.email].join(" ").toLowerCase().includes(search));
      const requirementStats = { total: rows.length, missingVehicle: 0, missingDocuments: 0, needsCorrection: 0, readyForReview: 0, approved: 0, unknown: 0 };
      for (const driver of rows) requirementStats[driver.requirementGroup] += 1;
      const group = url.searchParams.get("requirements");
      const filtered = currentMode === "legacy" || !group ? rows : rows.filter((driver) => driver.requirementGroup === group);
      const limit = Number(url.searchParams.get("limit") || 10);
      pagination.total = filtered.length;
      pagination.totalPages = Math.ceil(filtered.length / limit);
      data = filtered.slice((pagination.currentPage - 1) * limit, pagination.currentPage * limit);
      if (currentMode === "legacy") data = data.map(({ requirementGroup: _requirementGroup, requirements: _requirements, ...row }) => row);
      else meta = { requirementStats };
      if (currentMode === "invalidRequirements") meta.requirementStats.total += 1;
    } else if (endpoint === "requests-count") data = { pendingDriverRequests: 3 };
    else data = [];
    return route.fulfill({ json: { success: true, data, pagination, ...(meta && { meta }) } });
  });
  return { page, context, requests, errors, setMode: (mode) => { currentMode = mode; } };
}

async function assertLayout(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= document.documentElement.clientHeight + 1 && document.body.scrollHeight <= document.body.clientHeight + 1), true, label + " must have only one content scrollbar");
  assert.equal(await page.evaluate(() => document.querySelector("main").scrollWidth <= document.querySelector("main").clientWidth + 1), true, label + " must fit the viewport");
  assert.equal(await page.locator("main button button, main a button, main button a, main a a").count(), 0, label + " must have valid interactive nesting");
  const clipped = await page.locator("main button, main select, main input, main a, main summary").evaluateAll((elements) => elements.flatMap((element) => {
    if (element.closest("table")) return [];
    const bounds = element.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0 || getComputedStyle(element).pointerEvents === "none") return [];
    for (let parent = element; parent && parent.tagName !== "MAIN"; parent = parent.parentElement) {
      if (getComputedStyle(parent).opacity === "0") return [];
    }
    const main = element.closest("main").getBoundingClientRect();
    return bounds.left < main.left - 1 || bounds.right > main.right + 1 ? [element.textContent || element.getAttribute("aria-label") || element.tagName] : [];
  }));
  assert.deepEqual(clipped, [], label + " must not clip controls outside horizontally scrollable tables");
}

async function healthyAndLinks() {
  const fixture = await fixturePage({ saved: { reports_statusFilter: "resolved", users_activeTab: "driver", users_currentPage: 8, users_search: "old search", users_startDate: "2020-01-01", users_endDate: "2020-02-01" } });
  const { page, requests } = fixture;
  await page.goto(base + "/dashboard");
  await page.locator('[aria-label="Registered riders"]').getByText("7,000", { exact: true }).waitFor();
  assert.match(await page.locator('[aria-label="Drivers online"]').innerText(), /\b2\b/);
  assert.match(await page.locator('[aria-label="Riders on private trips"]').innerText(), /\b1\b/);
  assert.match(await page.locator('[aria-label="Lifetime subscription collections"]').innerText(), /\$400\.00/);
  assert.match(await page.locator('[aria-label="Registered drivers"]').innerText(), /1,234,567/);
  const organization = await page.evaluate(() => {
    const rect = (label) => {
      const bounds = document.querySelector('[aria-label="' + label + '"]').getBoundingClientRect();
      return { left: bounds.left, top: bounds.top };
    };
    return { drivers: rect("Registered drivers"), riders: rect("Registered riders"), online: rect("Drivers online"), riding: rect("Riders on private trips"), subscriptions: rect("Lifetime subscription collections"), commission: rect("Withdrawal commission"), outcomes: rect("Ride metrics"), categories: rect("Ride type distribution"), ridersGrowth: rect("Riders registration growth"), driversGrowth: rect("Drivers registration growth") };
  });
  assert.equal(organization.drivers.top, organization.online.top);
  assert.equal(organization.online.top, organization.riding.top);
  assert.equal(organization.subscriptions.top, organization.commission.top);
  assert.equal(organization.commission.top, organization.riders.top);
  assert.equal(organization.riding.left, organization.riders.left);
  assert.equal(organization.drivers.left, organization.subscriptions.left);
  assert.equal(organization.online.left, organization.commission.left);
  assert.equal(organization.outcomes.top, organization.categories.top);
  assert.equal(organization.ridersGrowth.top, organization.driversGrowth.top);
  assert.ok(organization.categories.left > organization.outcomes.left);
  assert.ok(organization.driversGrowth.left > organization.ridersGrowth.left);
  await page.locator('summary[title="Preview pending cases"]').click();
  assert.equal(await page.getByRole("link", { name: /^Unsafe driving/ }).getAttribute("href"), "/reports-detail/case-a");
  const firstRange = requests.find((request) => request.path.endsWith("/ride-analytics")).params;
  assert.equal((Date.parse(firstRange.endDate) - Date.parse(firstRange.startDate)) / 86_400_000, 30);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/ride-analytics") && new URL(response.url()).searchParams.get("startDate") !== firstRange.startDate),
    page.getByLabel("Reporting period", { exact: true }).selectOption("7"),
  ]);
  const lastRange = requests.filter((request) => request.path.endsWith("/ride-analytics")).at(-1).params;
  assert.equal((Date.parse(lastRange.endDate) - Date.parse(lastRange.startDate)) / 86_400_000, 7);

  const driverMetric = page.locator('[aria-label="Registered drivers"]');
  await driverMetric.locator("summary").focus();
  await page.keyboard.press("Enter");
  assert.equal(await driverMetric.getByText(/Visible, non-deleted driver accounts/).isVisible(), true);
  await driverMetric.locator("summary").click();
  const liveMetric = page.locator('[aria-label="Drivers online"]');
  await liveMetric.locator("summary").click();
  assert.equal(await liveMetric.getByText("No assigned trip:", { exact: false }).isVisible(), true);
  assert.match(await liveMetric.innerText(), /Assigned to a trip: 1/);
  await liveMetric.locator("summary").click();

  const categories = page.locator('section[aria-label="Recorded ride outcomes"]');
  const categoryChart = categories.getByLabel("Recorded category count chart", { exact: true });
  assert.equal(await categoryChart.getByRole("status").getByText("12", { exact: true }).isVisible(), true);
  const privateCategory = categoryChart.getByRole("button", { name: "private: 8 records", exact: true });
  await privateCategory.hover();
  await categoryChart.getByRole("status").getByText("8", { exact: true }).waitFor();
  await privateCategory.click();
  await page.getByRole("heading", { name: "Ride Metrics", exact: true }).hover();
  assert.equal(await categoryChart.getByRole("status").getByText("8", { exact: true }).isVisible(), true);
  assert.equal(await privateCategory.getAttribute("aria-pressed"), "true");
  await privateCategory.click();
  await page.getByRole("heading", { name: "Ride Metrics", exact: true }).hover();
  assert.equal(await categoryChart.getByRole("status").getByText("12", { exact: true }).isVisible(), true);
  await page.getByRole("group", { name: "Category display" }).getByRole("button", { name: "Table", exact: true }).click();
  assert.equal(await categories.getByRole("row", { name: "private 8", exact: true }).count(), 1);
  assert.equal(await categories.getByRole("row", { name: "economy 7", exact: true }).count(), 1);
  await assertLayout(page, "desktop category table");
  await page.getByRole("group", { name: "Category display" }).getByRole("button", { name: "Chart", exact: true }).click();

  const growth = page.locator('section[aria-label="Registration growth"]');
  const driverGrowth = growth.locator('[aria-label="Drivers registration growth"]');
  await driverGrowth.getByRole("button", { name: "Show chart", exact: true }).click();
  await driverGrowth.locator(".recharts-bar-rectangle").first().hover();
  await driverGrowth.locator('.recharts-tooltip-wrapper [role="status"]').getByText("7", { exact: true }).waitFor();
  await page.getByRole("group", { name: "Drivers registration display" }).getByRole("button", { name: "Table", exact: true }).click();
  assert.equal(await driverGrowth.getByRole("row", { name: "Drivers 7 18", exact: true }).count(), 1);
  await driverGrowth.locator('summary[title="30-day scenarios"]').click();
  assert.equal(await driverGrowth.getByText("30", { exact: true }).isVisible(), true);
  assert.equal(await driverGrowth.getByText(/estimates, not validated forecasts/).isVisible(), true);
  await assertLayout(page, "desktop registration scenario table");
  await driverGrowth.locator('summary[title="30-day scenarios"]').click();
  await driverGrowth.getByRole("button", { name: "Show totals", exact: true }).click();
  await growth.scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(() => document.querySelector("main").scrollTop > 100 && scrollY === 0), true);
  await page.locator("main").evaluate((main) => { main.scrollTop = main.scrollHeight; });
  assert.equal(await page.getByRole("link", { name: "Peak window configuration" }).isVisible(), true);
  await page.locator("main").evaluate((main) => { main.scrollTop = 0; });
  await assertLayout(page, "desktop dashboard");
  await page.screenshot({ path: "node_modules/.dashboard-verification/dashboard-desktop-light.png", animations: "disabled" });
  for (const section of ["Review queues", "Recorded ride outcomes", "Registration growth"]) {
    await page.locator('section[aria-label="' + section + '"]').screenshot({ path: "node_modules/.dashboard-verification/desktop-" + section.replaceAll(" ", "-") + ".png", animations: "disabled" });
  }

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/reports?")),
    page.getByRole("link", { name: "View all pending reports" }).click(),
  ]);
  await page.getByRole("heading", { name: "Reports Management" }).waitFor();
  assert.equal(await page.getByLabel("Filter by Status").innerText(), "Pending");
  assert.equal(requests.filter((request) => request.path.endsWith("/reports")).at(-1).params.status, "pending");
  await assertLayout(page, "desktop reports");
  await page.goto(base + "/dashboard");
  await page.locator('[aria-label="Registered riders"] summary').click();
  await page.locator('[aria-label="Registered riders"]').getByRole("link", { name: "View details" }).click();
  await page.getByText("Riley Morgan", { exact: true }).waitFor();
  const riderRequest = requests.filter((request) => request.path.endsWith("/users")).at(-1).params;
  assert.equal(riderRequest.type, "rider"); assert.equal(riderRequest.page, "1");
  assert.equal(riderRequest.search, undefined); assert.equal(riderRequest.startDate, undefined); assert.equal(riderRequest.endDate, undefined);
  await page.goto(base + "/dashboard");
  await page.locator('[aria-label="Withdrawal commission"]').getByRole("link", { name: "View details" }).click();
  await page.getByText("Withdrawal Commission", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Subscription Revenue", exact: true }).click();
  await page.getByText("Total Subscriptions", { exact: true }).waitFor();
  // Same pathname navigation must override a tab already selected in memory.
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent("popstate")));
  await page.goto(base + "/revenue?tab=withdrawal&scope=all");
  await page.getByText("Withdrawal Commission", { exact: true }).waitFor();
  assert.deepEqual(fixture.errors, []);
  await fixture.context.close();
  console.log("PASS: metric sources, shared periods and persisted-filter links");
}

async function mobileReview() {
  const fixture = await fixturePage({ width: 390 });
  const { page } = fixture;
  await page.goto(base + "/dashboard");
  await page.locator('[aria-label="Registered drivers"]').getByText("1,234,567", { exact: true }).waitFor();
  await page.getByRole("group", { name: "Category display" }).getByRole("button", { name: "Table", exact: true }).click();
  for (const label of ["Riders", "Drivers"]) {
    await page.locator('[aria-label="' + label + ' registration growth"]').getByRole("button", { name: "Show chart", exact: true }).click();
    await page.getByRole("group", { name: label + " registration display" }).getByRole("button", { name: "Table", exact: true }).click();
  }
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => document.documentElement.classList.toggle("dark", theme === "dark"), theme);
    await assertLayout(page, "mobile " + theme + " dashboard");
    await page.locator('section[aria-label="Recorded ride outcomes"]').screenshot({ path: "node_modules/.dashboard-verification/dashboard-mobile-" + theme + ".png", animations: "disabled" });
  }
  await page.goto(base + "/driver-requests");
  await page.getByText("alex@example.test", { exact: true }).waitFor();
  assert.match(await page.locator("main").innerText(), /Missing vehicle/);
  assert.match(await page.locator("main").innerText(), /Missing: Vehicle, Driver license, Vehicle registration, Insurance/);
  assert.match(await page.locator("main").innerText(), /Image unreadable; upload the complete license/);
  assert.match(await page.locator("main").innerText(), /Rejected: Driver license · Image unreadable/);
  assert.match(await page.locator("main").innerText(), /Verified: Insurance/);
  assert.match(await page.locator("main").innerText(), /Waiting for review: Insurance/);
  assert.equal(fixture.requests.some((request) => request.path.includes("/users/")), false);
  // Returning to the tab must not refetch the unpolled list and wipe the results.
  const driverListRequests = fixture.requests.filter((request) => request.path.endsWith("/drivers")).length;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.waitForTimeout(300);
  assert.equal(fixture.requests.filter((request) => request.path.endsWith("/drivers")).length, driverListRequests);
  await page.getByRole("group", { name: "Requirement filters" }).waitFor();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => document.documentElement.classList.toggle("dark", theme === "dark"), theme);
    await assertLayout(page, "mobile " + theme + " review");
    await page.screenshot({ path: "node_modules/.dashboard-verification/driver-requests-mobile-" + theme + ".png", animations: "disabled" });
  }
  await page.goto(base + "/reports?status=pending");
  await page.getByText("Unsafe driving", { exact: true }).waitFor();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => document.documentElement.classList.toggle("dark", theme === "dark"), theme);
    await assertLayout(page, "mobile " + theme + " reports");
  }
  assert.deepEqual(fixture.errors, []);
  await fixture.context.close();
  console.log("PASS: 390px light/dark dashboard, requirement groups and reports");
}

async function driverRequirementFilters() {
  const fixture = await fixturePage();
  const { page, requests } = fixture;
  await page.goto(base + "/driver-requests");
  const filters = page.getByRole("group", { name: "Requirement filters" });
  await filters.getByRole("button", { name: "All 5", exact: true }).waitFor();
  assert.equal(await filters.getByRole("button", { name: "All 5", exact: true }).getAttribute("aria-pressed"), "true");
  assert.equal(await filters.getByRole("button").count(), 7);
  assert.match(await page.locator("main").innerText(), /Newer upload waiting: Insurance/);
  assert.match(await page.locator("main").innerText(), /Another vehicle pending or rejected/);
  assert.match(await page.locator("main").innerText(), /Old: Driver license/);
  assert.equal(await page.getByRole("button", { name: "Check requirements", exact: true }).count(), 0);
  await filters.getByRole("button", { name: "Ready for review 1", exact: true }).click();
  await page.getByText("alex@example.test", { exact: true }).waitFor();
  assert.equal(new URL(page.url()).searchParams.get("requirements"), "readyForReview");
  assert.equal(requests.filter((request) => request.path.endsWith("/drivers")).at(-1).params.requirements, "readyForReview");
  assert.equal(requests.filter((request) => request.path.endsWith("/drivers")).at(-1).params.page, "1");
  assert.equal(await page.locator("tbody tr").count(), 1);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const csv = await readFile(await (await downloadPromise).path(), "utf8");
  for (const header of ["Requirement Group", "Vehicle Status", "Driver License Status", "Vehicle Registration Status", "Insurance Status"]) assert.ok(csv.includes(header));
  assert.ok(csv.includes("Ready for review"));
  assert.ok(csv.includes("pending"));
  assert.ok(csv.includes("alex@example.test"));
  assert.equal(csv.includes("jamie@example.test"), false);
  assert.equal(await filters.getByRole("button", { name: "All 5", exact: true }).count(), 1);
  await page.goBack();
  await page.getByText("jamie@example.test", { exact: true }).waitFor();
  assert.equal(new URL(page.url()).searchParams.has("requirements"), false);
  assert.equal(await filters.getByRole("button", { name: "All 5", exact: true }).getAttribute("aria-pressed"), "true");
  await page.goForward();
  await page.getByText("alex@example.test", { exact: true }).waitFor();
  assert.equal(await filters.getByRole("button", { name: "Ready for review 1", exact: true }).getAttribute("aria-pressed"), "true");
  await page.goto(base + "/driver-requests?requirements=missingVehicle");
  await page.getByText("jamie@example.test", { exact: true }).waitFor();
  assert.equal(await filters.getByRole("button", { name: "Missing vehicle 1", exact: true }).getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator("tbody tr").count(), 1);
  await filters.getByRole("button", { name: "Missing documents 0", exact: true }).click();
  await page.getByText("No drivers in this group.", { exact: true }).waitFor();
  await page.goto(base + "/driver-requests?requirements=unsupported");
  await filters.getByRole("button", { name: "All 5", exact: true }).waitFor();
  assert.equal(requests.filter((request) => request.path.endsWith("/drivers")).at(-1).params.requirements, undefined);
  await page.getByPlaceholder("Search by name, email or phone...").fill("Alex");
  await filters.getByRole("button", { name: "All 1", exact: true }).waitFor();
  await filters.getByRole("button", { name: "Ready for review 1", exact: true }).click();
  await page.getByText("alex@example.test", { exact: true }).waitFor();
  assert.equal(await page.getByPlaceholder("Search by name, email or phone...").inputValue(), "Alex");
  assert.equal(requests.filter((request) => request.path.endsWith("/drivers")).at(-1).params.search, "Alex");
  assert.match(await page.locator("main").innerText(), /Counts cover every driver in this queue matching the search/);
  assert.equal(requests.some((request) => request.path.includes("/users/")), false);
  assert.deepEqual(fixture.errors, []);
  await fixture.context.close();

  // Counts stay on screen while a slow filter request loads.
  const slow = await fixturePage({ delay: 700 });
  await slow.page.goto(base + "/driver-requests");
  const slowFilters = slow.page.getByRole("group", { name: "Requirement filters" });
  await slowFilters.getByRole("button", { name: "All 5", exact: true }).waitFor();
  await slowFilters.getByRole("button", { name: "Ready for review 1", exact: true }).click();
  await slow.page.getByText("Updating counts…", { exact: true }).waitFor();
  assert.equal(await slowFilters.getByRole("button").count(), 7);
  await slow.page.getByText("alex@example.test", { exact: true }).waitFor();
  assert.match(await slow.page.locator("main").innerText(), /Counts cover every driver in this queue\./);
  assert.deepEqual(slow.errors, []);
  await slow.context.close();

  // A rejected current vehicle already explains the list's pending-or-rejected vehicle flag.
  const rejectedVehicle = await fixturePage({ queue: [{ ...drivers[2], _id: "driver-f", email: "fran@example.test", requirements: requirementItems(["rejected", "approved", "approved", "approved"]) }] });
  await rejectedVehicle.page.goto(base + "/driver-requests");
  await rejectedVehicle.page.getByText("fran@example.test", { exact: true }).waitFor();
  assert.match(await rejectedVehicle.page.locator("main").innerText(), /Rejected: Vehicle/);
  assert.doesNotMatch(await rejectedVehicle.page.locator("main").innerText(), /Another vehicle pending or rejected/);
  assert.deepEqual(rejectedVehicle.errors, []);
  await rejectedVehicle.context.close();

  const paginated = await fixturePage({ queue: [...drivers, ...Array.from({ length: 8 }, (_, index) => ({ ...drivers[3], _id: "extra-" + index, email: "extra-" + index + "@example.test" }))] });
  await paginated.page.goto(base + "/driver-requests");
  await paginated.page.getByRole("button", { name: "2", exact: true }).click();
  await paginated.page.getByText("extra-5@example.test", { exact: true }).waitFor();
  await paginated.page.getByRole("group", { name: "Requirement filters" }).getByRole("button", { name: "Ready for review 1", exact: true }).click();
  await paginated.page.getByText("alex@example.test", { exact: true }).waitFor();
  assert.equal(paginated.requests.filter((request) => request.path.endsWith("/drivers")).at(-1).params.page, "1");
  await paginated.page.goBack();
  await paginated.page.getByText("jamie@example.test", { exact: true }).waitFor();
  assert.equal(paginated.requests.filter((request) => request.path.endsWith("/drivers")).at(-1).params.page, "1");
  assert.deepEqual(paginated.errors, []);
  await paginated.context.close();

  const legacy = await fixturePage({ mode: "legacy" });
  await legacy.page.goto(base + "/driver-requests?requirements=readyForReview");
  await legacy.page.getByText("Requirement filters need the updated server.", { exact: true }).waitFor();
  assert.equal(await legacy.page.getByRole("group", { name: "Requirement filters" }).count(), 0);
  assert.match(await legacy.page.locator("main").innerText(), /Waiting: Insurance/);
  assert.match(await legacy.page.locator("main").innerText(), /No vehicle added/);
  assert.match(await legacy.page.locator("main").innerText(), /Vehicle pending or rejected/);
  assert.equal(legacy.requests.some((request) => request.path.includes("/users/")), false);
  assert.deepEqual(legacy.errors, []);
  await legacy.context.close();

  const invalid = await fixturePage({ mode: "invalidRequirements" });
  await invalid.page.goto(base + "/driver-requests");
  await invalid.page.getByText("Submission queue unavailable. Retry the source above.", { exact: true }).waitFor();
  assert.equal(await invalid.page.getByRole("group", { name: "Requirement filters" }).count(), 0);
  assert.deepEqual(invalid.errors, []);
  await invalid.context.close();
  console.log("PASS: whole-queue counts, URL filters/history, search, page reset, empty groups, legacy mode and no profile requests");
}

async function sourceStatesAndPermissions() {
  for (const mode of ["empty", "malformed", "failed"]) {
    const fixture = await fixturePage({ mode });
    await fixture.page.goto(base + "/dashboard");
    if (mode === "empty") {
      await fixture.page.getByText("No ride or booking records in this period.").waitFor();
      assert.match(await fixture.page.locator('[aria-label="Drivers online"]').innerText(), /\b0\b/);
      assert.match(await fixture.page.locator('[aria-label="Lifetime subscription collections"]').innerText(), /\$0\.00/);
      await fixture.page.getByText("No pending reports.", { exact: true }).waitFor();
    } else {
      await fixture.page.locator('[aria-label="Drivers online"]').getByText("Unavailable", { exact: true }).waitFor();
      if (mode === "malformed") assert.match(await fixture.page.locator('[aria-label="Lifetime subscription collections"]').innerText(), /\$400\.00/);
      else assert.match(await fixture.page.locator('[aria-label="Registered riders"]').innerText(), /—/);
    }
    assert.deepEqual(fixture.errors, []);
    await fixture.context.close();
  }
  const stale = await fixturePage();
  await stale.page.goto(base + "/dashboard");
  await stale.page.locator('[aria-label="Drivers online"] summary').click();
  await stale.page.locator('[aria-label="Drivers online"] time').waitFor();
  const timestamp = await stale.page.locator('[aria-label="Drivers online"] time').getAttribute("datetime");
  stale.setMode("stale");
  await stale.page.getByRole("button", { name: "Refresh", exact: true }).click();
  await stale.page.locator('[aria-label="Drivers online"]').getByText(/^Stale · refresh failed/).waitFor();
  assert.equal(await stale.page.locator('[aria-label="Drivers online"] time').getAttribute("datetime"), timestamp);
  assert.match(await stale.page.locator('[aria-label="Drivers online"]').innerText(), /\b2\b/);
  assert.match(await stale.page.locator('[aria-label="Lifetime subscription collections"]').innerText(), /\$400\.00/);
  const rideMetrics = stale.page.locator('[aria-label="Ride metrics"]');
  await rideMetrics.getByText(/^Stale · refresh failed/).first().waitFor();
  assert.match(await rideMetrics.getByLabel("Ride and booking records", { exact: true }).innerText(), /^12\s+Records$/);
  stale.setMode("healthy");
  await stale.page.locator('[aria-label="Drivers online"]').getByRole("button", { name: "Retry" }).click();
  await stale.page.locator('[aria-label="Drivers online"]').getByText(/^Updated/).waitFor();
  assert.deepEqual(stale.errors, []);
  await stale.context.close();

  const loading = await fixturePage({ delay: 700 });
  await loading.page.goto(base + "/dashboard");
  await loading.page.locator('[aria-label="Registered riders"]').getByText("Loading…", { exact: true }).waitFor();
  await loading.page.locator('[aria-label="Registered riders"]').getByText("7,000", { exact: true }).waitFor();
  await loading.context.close();

  for (const role of ["admin", "general"]) {
    const fixture = await fixturePage({ role });
    await fixture.page.goto(base + "/dashboard");
    await fixture.page.locator('[aria-label="Registered riders"]').getByText("7,000", { exact: true }).waitFor();
    assert.equal(await fixture.page.locator('section[aria-label="Collections"]').count(), 0);
    assert.equal(fixture.requests.some((request) => request.path.endsWith("/subscription-revenue") || request.path.endsWith("/withdrawals")), false);
    assert.equal(await fixture.page.getByRole("link", { name: "Peak window configuration" }).count(), 0);
    assert.equal(await fixture.page.locator('[aria-label="Drivers with pending submissions"]').count(), role === "general" ? 0 : 1);
    assert.deepEqual(fixture.errors, []);
    await fixture.context.close();
  }
  console.log("PASS: zero/loading/unavailable/stale/partial failure/retry states and financial permissions");
}

async function affectedPageLayouts() {
  const screens = [
    ["dashboard", "/dashboard", "Registered accounts"],
    ["driver-requests", "/driver-requests", "alex@example.test"],
    ["reports", "/reports?status=pending", "Unsafe driving"],
    ["users", "/user-management?type=rider&scope=all", "Riley Morgan"],
    ["subscription", "/revenue?tab=subscription&scope=all", "Total Subscriptions"],
    ["withdrawal", "/revenue?tab=withdrawal&scope=all", "Withdrawal Commission"],
  ];
  for (const width of [1920, 1440, 390]) {
    const fixture = await fixturePage({ width });
    for (const [name, route, ready] of screens) {
      await fixture.page.goto(base + route);
      await fixture.page.getByText(ready, { exact: true }).waitFor();
      for (const theme of ["light", "dark"]) {
        await fixture.page.evaluate((theme) => document.documentElement.classList.toggle("dark", theme === "dark"), theme);
        await assertLayout(fixture.page, width + "px " + theme + " " + name);
        if (name === "driver-requests" && width >= 1440) {
          assert.equal(await fixture.page.locator("main table").evaluate((table) => table.parentElement.scrollWidth <= table.parentElement.clientWidth + 1), true, "Driver Details must remain visible without horizontal table scrolling");
        }
        await fixture.page.screenshot({ path: "node_modules/.dashboard-verification/" + name + "-" + width + "-" + theme + ".png", animations: "disabled" });
      }
    }
    assert.deepEqual(fixture.errors, []);
    await fixture.context.close();
  }
  console.log("PASS: every affected page at desktop/390px in light and dark modes");
}

async function hookLifecycle() {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.route(base + "/dashboard-hook-fixture", (route) => route.fulfill({ contentType: "text/html", body: '<div id="root"></div><script type="module" src="/test/dashboard-hook-fixture.jsx"></script>' }));
  // Vite transforms the fixture module so it uses the same React instance.
  await page.route(base + "/test/dashboard-hook-fixture.jsx", async (route) => {
    const source = [
      'import React from "react"; const { useState, useCallback, StrictMode } = React;',
      'import ReactDOM from "react-dom/client"; const { createRoot } = ReactDOM;',
      'import useDashboardResource from "/src/hooks/dashboard-analytics/useDashboardResource.js";',
      'window.calls=[]; window.ticks=[]; window.hidden=false;',
      'Object.defineProperty(document,"hidden",{configurable:true,get:()=>window.hidden});',
      'window.setInterval=(fn)=>{window.ticks.push(fn); return window.ticks.length}; window.clearInterval=()=>{};',
      'function Harness(){const [identity,setIdentity]=useState("first"); const [enabled,setEnabled]=useState(true); window.changeIdentity=setIdentity; window.changeEnabled=setEnabled;',
      'const fetcher=useCallback(signal=>new Promise((resolve,reject)=>window.calls.push({signal,resolve,reject,identity})),[identity]);',
      'const resource=useDashboardResource(fetcher,{interval:100,identity,enabled}); window.resource=resource; return <pre>{JSON.stringify(resource)}</pre>;}',
      'window.root=createRoot(document.getElementById("root")); window.root.render(<StrictMode><Harness/></StrictMode>);',
    ].join("\n");
    // Use Vite's JSX transform and the optimized React modules used by the app.
    const { transformWithEsbuild } = await import("vite");
    const jsx = await transformWithEsbuild(source, "dashboard-hook-fixture.jsx", { loader: "jsx" });
    const resolved = jsx.code.replaceAll('from "react"', 'from "/node_modules/.vite/deps/react.js"').replaceAll('from "react-dom/client"', 'from "/node_modules/.vite/deps/react-dom_client.js"');
    await route.fulfill({ contentType: "application/javascript", body: resolved });
  });
  await page.goto(base + "/dashboard-hook-fixture");
  await page.waitForFunction(() => window.calls?.length === 2).catch((error) => {
    throw new Error(error.message + " · Hook fixture errors: " + errors.join("; "));
  });
  assert.equal(await page.evaluate(() => window.calls[0].signal.aborted), true);
  await page.evaluate(() => { window.ticks.at(-1)(); window.ticks.at(-1)(); });
  assert.equal(await page.evaluate(() => window.calls.length), 2);
  await page.evaluate(() => window.calls[1].resolve("first-value"));
  await page.waitForFunction(() => window.resource.data === "first-value");
  await page.evaluate(() => { window.hidden = true; document.dispatchEvent(new Event("visibilitychange")); window.ticks.at(-1)(); });
  assert.equal(await page.evaluate(() => window.calls.length), 2);
  await page.evaluate(() => { window.hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForFunction(() => window.calls.length === 3);
  await page.evaluate(() => { window.resource.refresh(); });
  await page.waitForFunction(() => window.calls.length === 4);
  assert.equal(await page.evaluate(() => window.calls[2].signal.aborted), true);
  await page.evaluate(() => { window.calls[3].resolve("latest"); window.calls[2].resolve("obsolete"); });
  await page.waitForFunction(() => window.resource.data === "latest");
  await page.evaluate(() => window.changeIdentity("second"));
  await page.waitForFunction(() => window.calls.length === 5);
  assert.equal(await page.evaluate(() => window.resource.data), null);
  await page.evaluate(() => window.calls[4].resolve("second-value"));
  await page.waitForFunction(() => window.resource.data === "second-value");
  await page.evaluate(() => window.changeEnabled(false));
  await page.waitForFunction(() => window.resource.data === null && window.resource.loading === false);
  assert.equal(await page.evaluate(() => window.calls.length), 5);
  await page.evaluate(() => window.changeEnabled(true));
  await page.waitForFunction(() => window.calls.length === 6);
  await page.evaluate(() => window.calls[5].resolve("enabled-again"));
  await page.waitForFunction(() => window.resource.data === "enabled-again");
  await page.evaluate(() => { window.resource.refresh(); window.root.unmount(); });
  assert.equal(await page.evaluate(() => window.calls.at(-1).signal.aborted), true);
  assert.deepEqual(errors, []);
  await page.close();
  console.log("PASS: React Strict Mode, visibility polling, slow fetches, manual replacement, identity changes and unmount");
}

try {
  await healthyAndLinks();
  await mobileReview();
  await driverRequirementFilters();
  await sourceStatesAndPermissions();
  await affectedPageLayouts();
  await hookLifecycle();
  console.log("All dashboard browser checks passed. Screenshots: node_modules/.dashboard-verification/");
} finally {
  await browser.close();
  await server.close();
}
