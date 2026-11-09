import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Users, DollarSign, FileWarning, RefreshCw, MapPin, Clock, ArrowUpRight, CheckCircle, XCircle, Activity, Bell, TrendingUp, Info } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DashboardMetric, { ResourceStatus } from "../components/dashboard/DashboardMetric";
import { RideCategoryChart, RegistrationPanel } from "../components/dashboard/DashboardCharts";
import useDashboardResource from "../hooks/dashboard-analytics/useDashboardResource";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/services";
import { formatMetric, formatMoney, getLiveMetrics, getRidePeriod, metricCount } from "../utils/dashboardMetrics";
import { dashboardStats, registeredRiders, liveSnapshot, subscriptionCollections, rideAnalytics, reportPreview } from "../utils/dashboardSources";

const fetchStats = async (signal) => dashboardStats(await api.getDashboardStats({ signal }));
const fetchRiders = async (signal) => registeredRiders(await api.getUsers("rider", 1, 1, "", "", "", { signal }));
const fetchLive = async (signal) => liveSnapshot(await api.getBirdsEyeView({ signal }));
const fetchCollections = async (signal) => subscriptionCollections(await api.getSubscriptionRevenue(1, 1, "", "", "", "", { signal }));
const fetchReports = async (signal) => reportPreview(await api.getReports(1, 5, "pending", "desc", { signal }));
const smallText = "text-xs leading-5 text-gray-500 dark:text-gray-400";
const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";

function ReportAge({ date }) {
  const time = Date.parse(date);
  if (!Number.isFinite(time)) return <span>Date unavailable</span>;
  const hours = Math.max(0, Math.floor((Date.now() - time) / 3_600_000));
  const days = Math.floor(hours / 24);
  const age = hours < 1 ? "Under 1 hour" : hours < 24 ? hours + (hours === 1 ? " hour" : " hours") : days + (days === 1 ? " day" : " days");
  return <time dateTime={new Date(time).toISOString()} title={new Date(time).toLocaleString()}>{age} old</time>;
}

function OutcomeBar({ label, count, total, color }) {
  const validCount = metricCount(count);
  const validTotal = metricCount(total);
  const percent = validCount !== null && validTotal > 0 && validCount <= validTotal ? validCount / validTotal * 100 : null;
  return <div>
    <div className="flex justify-between gap-3 text-xs mb-1.5">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{formatMetric(count)}{percent !== null && " (" + percent.toFixed(1) + "%)"}</span>
    </div>
    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden" aria-hidden="true"><div className={"h-full rounded-full " + color} style={{ width: (percent ?? 0) + "%" }} /></div>
  </div>;
}

function RegularRideSummary({ stats }) {
  return <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
    <p className="sr-only">Regular rides · server reporting periods</p>
    <div className="grid grid-cols-3 gap-2">
      {[["Today", "today"], ["This week", "thisWeek"], ["This month", "thisMonth"]].map(([label, key]) => <div key={key} className="rounded-lg bg-gray-50 dark:bg-gray-900/60 py-3 px-1.5 text-center">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</h4>
        <p className="flex items-center justify-center gap-1 text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-400"><CheckCircle aria-hidden="true" className="w-3.5 h-3.5" /><span><span className="sr-only">Completed: </span>{formatMetric(stats.data?.rideMetrics?.totalRidesCompleted?.[key])}</span></p>
        <p className="flex items-center justify-center gap-1 text-xs font-medium tabular-nums text-rose-700 dark:text-rose-400 mt-1"><XCircle aria-hidden="true" className="w-3.5 h-3.5" /><span><span className="sr-only">Cancelled: </span>{formatMetric(stats.data?.rideMetrics?.totalRidesCancelled?.[key])}</span></p>
      </div>)}
    </div>
    <details className={smallText}><summary title="About server reporting periods" className={"absolute bottom-3 right-3 cursor-pointer rounded p-1 list-none " + focus}><Info aria-hidden="true" className="w-3.5 h-3.5" /><span className="sr-only">About these periods</span></summary><p className="mt-3">Regular rides only, grouped by request creation time. Today, week and month boundaries use server time, which may differ from UTC and the selected analytics range.</p>{!stats.error && <ResourceStatus resource={stats} label="Regular rides" />}</details>
    {stats.error && <div className="mt-2"><ResourceStatus resource={stats} label="Regular rides" /></div>}
  </div>;
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const identity = [user?.id ?? user?._id ?? user?.email, user?.role].join(":");
  const financials = hasPermission("financials");
  const reviewDrivers = hasPermission("viewDriverRequests");
  const mapAllowed = hasPermission("birdsEye");
  const [period, setPeriod] = useState("30");
  // Each request computes its own rolling window, so a manual refresh reuses the
  // same source and keeps the last result (marked stale) if the refresh fails.
  const fetchAnalytics = useCallback(async (signal) => {
    const requested = getRidePeriod(period);
    return { ...rideAnalytics(await api.getRideAnalytics(requested, { signal })), range: requested };
  }, [period]);

  const stats = useDashboardResource(fetchStats, { identity });
  const riders = useDashboardResource(fetchRiders, { identity });
  const live = useDashboardResource(fetchLive, { interval: 15_000, enabled: mapAllowed, identity });
  const collections = useDashboardResource(fetchCollections, { enabled: financials, identity });
  const analytics = useDashboardResource(fetchAnalytics, { interval: 0, identity });
  const reports = useDashboardResource(fetchReports, { identity });
  const resources = [stats, riders, ...(mapAllowed ? [live] : []), ...(financials ? [collections] : []), analytics, reports];
  const updating = resources.some((resource) => resource.loading);
  const failed = resources.filter((resource) => resource.error).length;
  const um = stats.data?.userMetrics;
  const current = getLiveMetrics(live.data);
  const overview = analytics.data?.overview;
  const distribution = analytics.data?.rideDistribution;

  const refreshAll = () => {
    stats.refresh(); riders.refresh(); live.refresh(); collections.refresh(); analytics.refresh(); reports.refresh();
  };
  const changePeriod = (event) => setPeriod(event.target.value);
  const formatUtc = (date) => new Date(date).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const range = analytics.data?.range;
  const rangeLabel = range ? (range.startDate ? formatUtc(range.startDate) : "All history") + " through " + formatUtc(range.endDate) : "Range not loaded";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1><Button variant="ghost" size="sm" aria-label="Refresh" title="Refresh sources" icon={<RefreshCw className={"w-4 h-4 " + (updating ? "animate-spin" : "")} />} onClick={refreshAll} /></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform overview & live metrics</p>
          <p className={failed ? smallText : "sr-only"} aria-live="polite">{updating ? "Updating sources…" : failed ? failed + (failed === 1 ? " source needs attention" : " sources need attention") : "Sources updated independently"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasPermission("sendNotifications") && <Link to="/notifications" className={"inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 text-sm font-medium transition-colors " + focus}><Bell aria-hidden="true" className="w-4 h-4" />Send Notification</Link>}
          <Link to="/reports?status=pending" className={"inline-flex items-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-gray-950 px-3 py-2 text-sm font-medium transition-colors " + focus}><FileWarning aria-hidden="true" className="w-4 h-4" />View Reports</Link>
        </div>
      </div>

      <section aria-label="Account totals" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <h2 className="sr-only">Registered accounts</h2>
        <DashboardMetric title="Registered drivers" value={um?.totalDrivers} resource={stats} description="Visible, non-deleted driver accounts, including deactivated accounts and registrations with no submissions." note={formatMetric(um?.newDriverRegistrations?.last7Days) + " registrations · last 7 days"} icon={Car} tone="amber" />
        {mapAllowed && <section aria-label="Current activity" className="contents">
          <DashboardMetric title="Drivers online" value={current.onlineDrivers} resource={live} description="Unique online drivers with map locations. Assignment can include trips awaiting pickup. Refreshes every 15 seconds while visible; timestamps show fetch time, not device heartbeats." note="Current map snapshot" icon={Car} tone="blue" href="/birds-eye-view">
            <p>No assigned trip: <strong>{formatMetric(current.unassignedDrivers)}</strong></p><p>Assigned to a trip: <strong>{formatMetric(current.assignedDrivers)}</strong></p>
          </DashboardMetric>
          <DashboardMetric title="Riders on private trips" value={current.ridersOnTrips} resource={live} description="Unique mapped riders with a private ride in progress. Carpool passengers are not covered. Refreshes every 15 seconds while visible; timestamps show fetch time, not device heartbeats." note="Current map snapshot" icon={Users} tone="emerald" href="/birds-eye-view">
            <p>Searching now: <strong>{formatMetric(current.ridersSearching)}</strong></p><p>Awaiting pickup: <strong>{formatMetric(current.ridersAwaitingPickup)}</strong></p>
          </DashboardMetric>
        </section>}
        {financials && <section aria-label="Collections" className="contents">
          <DashboardMetric title="Lifetime subscription collections" value={formatMoney(collections.data)} money resource={collections} description="Successful driver subscription charges, including renewals. Gross collections; not adjusted for refunds." note="Successful charges, including renewals" icon={DollarSign} tone="emerald" href="/revenue?tab=subscription&scope=all" />
          <DashboardMetric title="Withdrawal commission" value={formatMoney(stats.data?.revenueMetrics?.withdrawalCommissionRevenueUSD)} money resource={stats} description="Commission from successful driver withdrawals. Separate from ride commission." note="Successful driver withdrawals" icon={TrendingUp} tone="violet" href="/revenue?tab=withdrawal&scope=all" />
        </section>}
        <DashboardMetric title="Registered riders" value={riders.data} resource={riders} description="Visible, non-deleted rider accounts, including deactivated accounts. Total from the full account list." note={formatMetric(um?.newRiderRegistrations?.last7Days) + " registrations · last 7 days"} icon={Users} tone="cyan" href="/user-management?type=rider&scope=all" />
      </section>

      <section aria-label="Review queues" className={"grid grid-cols-1 gap-4 " + (reviewDrivers ? "lg:grid-cols-2" : "")}>
        <h2 className="sr-only">Needs review</h2>
        {reviewDrivers && <Card padding="p-4" aria-label="Drivers with pending submissions" className="relative min-w-0 min-h-[84px] !border-amber-300 !bg-amber-50/70 dark:!border-amber-900 dark:!bg-amber-950/30">
          <Link to="/driver-requests" className={"flex items-center gap-4 rounded " + focus}>
            <span className="p-2.5 rounded-xl bg-white/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"><Car aria-hidden="true" className="w-5 h-5" /></span>
            <div className="min-w-0 flex-1"><h3 className="text-xs uppercase tracking-wide font-medium text-amber-800 dark:text-amber-300">Pending driver submissions</h3><p className="text-2xl font-bold text-amber-900 dark:text-amber-200 tabular-nums">{stats.loading && stats.data === null ? "…" : formatMetric(stats.data?.pendingActions?.pendingDriverRequests)}</p></div>
            <ArrowUpRight aria-hidden="true" className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
          </Link>
          {stats.error && <div className="mt-2"><ResourceStatus resource={stats} label="Pending submissions" /></div>}
          <details className={smallText}><summary title="Queue details" className={"absolute bottom-1 right-1 cursor-pointer rounded p-1 list-none " + focus}><Info aria-hidden="true" className="w-3 h-3" /><span className="sr-only">Queue details</span></summary><p className="mt-3">Drivers with pending document or vehicle submissions. Registrations with no uploads are outside this queue. Check current requirements from the driver requests page.</p>{!stats.error && <ResourceStatus resource={stats} label="Pending submissions" />}</details>
        </Card>}
        <Card padding="p-4" className="relative min-w-0 min-h-[84px] !border-rose-300 !bg-rose-50/70 dark:!border-rose-900 dark:!bg-rose-950/30">
          <Link to="/reports?status=pending" aria-label="View all pending reports" className={"flex items-center gap-4 rounded " + focus}>
            <span className="p-2.5 rounded-xl bg-white/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"><FileWarning aria-hidden="true" className="w-5 h-5" /></span>
            <div className="min-w-0 flex-1"><h3 className="text-xs uppercase tracking-wide font-medium text-rose-800 dark:text-rose-300">Pending reports</h3><p className="text-2xl font-bold text-rose-900 dark:text-rose-200 tabular-nums">{reports.loading && reports.data === null ? "…" : formatMetric(reports.data?.stats?.pendingReports)}</p></div>
            <ArrowUpRight aria-hidden="true" className="w-4 h-4 shrink-0 text-rose-700 dark:text-rose-400" />
          </Link>
          {reports.data?.stats?.pendingReports === 0 && <p className={smallText + " mt-2"}>No pending reports.</p>}
          {reports.error && <div className="mt-2"><ResourceStatus resource={reports} label="Reports" /></div>}
          <details className={smallText}>
            <summary title="Preview pending cases" className={"absolute bottom-1 right-1 cursor-pointer rounded p-1 list-none " + focus}><Info aria-hidden="true" className="w-3 h-3" /><span className="sr-only">Preview pending cases</span></summary>
            <p className="mt-2">Global visible totals: {formatMetric(reports.data?.stats?.totalReportsReceived)} received · {formatMetric(reports.data?.stats?.resolvedReports)} resolved · {formatMetric(reports.data?.stats?.rejectedReports)} rejected</p>
            <ul className="divide-y divide-rose-200 dark:divide-rose-900 mt-1">
              {reports.data?.results.map((report) => {
                const id = report._id ?? report.reportId ?? report.id;
                return <li key={id} className="py-2"><Link to={"/reports-detail/" + id} className={"block rounded p-2 -mx-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 " + focus}>
                  <span className="flex items-start justify-between gap-2 text-sm font-medium text-gray-900 dark:text-white"><span className="break-words">{report.reportReason || "Reason unavailable"}</span><ArrowUpRight aria-hidden="true" className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" /></span>
                  <span className="flex flex-wrap gap-x-3 mt-1"><span>{report.status || "Status unavailable"}</span><ReportAge date={report.date} /></span>
                </Link></li>;
              })}
            </ul>
            {reports.data?.results.length === 0 && reports.data.stats.pendingReports !== 0 && <p className="py-2">No pending cases returned in this preview.</p>}
            <p className="mb-2">Up to 5 pending cases; reasons are not a global frequency breakdown.</p>
            {!reports.error && <ResourceStatus resource={reports} label="Reports" />}
          </details>
        </Card>
      </section>

      <section aria-label="Recorded ride outcomes">
        <h2 className="sr-only">Recorded ride outcomes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <Card padding="p-5 sm:p-6 xl:p-12" className="relative min-w-0" aria-label="Ride metrics">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5"><h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Activity aria-hidden="true" className="w-5 h-5 text-primary-600 dark:text-primary-400" />Ride Metrics</h3>
              <label><span className="sr-only">Reporting period</span><select aria-label="Reporting period" className={"rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 " + focus} value={period} onChange={changePeriod}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All time</option></select></label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["Ride and booking records", "Records", overview?.totalRides, "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300"], ["Completed records", "Completed", overview?.completedRides, "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"], ["Cancelled records", "Cancelled", overview?.cancelledRides, "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"]].map(([label, short, value, color]) => <div key={label} aria-label={label} className={"rounded-xl border px-2 py-3 text-center min-w-0 " + color}><p className="text-xl sm:text-2xl font-bold tabular-nums break-words">{analytics.loading && analytics.data === null ? "…" : formatMetric(value)}</p><h4 className="text-xs mt-1">{short}</h4></div>)}
            </div>
            {overview?.totalRides === 0 ? <p className={smallText + " mt-4"}>No ride or booking records in this period.</p> : <div className="space-y-3 mt-4">
              <OutcomeBar label="Completed records" count={overview?.completedRides} total={overview?.totalRides} color="bg-emerald-500" />
              <OutcomeBar label="Cancelled records" count={overview?.cancelledRides} total={overview?.totalRides} color="bg-rose-500" />
            </div>}
            <details className={smallText}><summary title="About recorded outcomes" className={"absolute bottom-3 left-3 cursor-pointer rounded p-1 list-none " + focus}><Info aria-hidden="true" className="w-3.5 h-3.5" /><span className="sr-only">About recorded outcomes</span></summary><div className="mt-3"><p>Regular ride records + individual carpool bookings; not unique vehicle journeys. Percentages use the recorded total. Cancelled records do not establish a complete count of unsuccessful searches or cancellations before a trip started.</p><p className="mt-2">Record creation time · UTC · {rangeLabel}</p>{!analytics.error && <ResourceStatus resource={analytics} label="Ride analytics" />}</div></details>
            {analytics.error && <div className="mt-2"><ResourceStatus resource={analytics} label="Ride analytics" /></div>}
            <RegularRideSummary stats={stats} />
          </Card>

          <Card padding="p-5 sm:p-6 xl:p-12" className="relative min-w-0" aria-label="Ride type distribution">
            <RideCategoryChart distribution={distribution} total={overview?.totalRides} />
            <details className={smallText}><summary title="About recorded categories" className={"absolute bottom-3 left-3 cursor-pointer rounded p-1 list-none " + focus}><Info aria-hidden="true" className="w-3.5 h-3.5" /><span className="sr-only">About recorded categories</span></summary><p className="mt-3">Category labels and units follow recorded data. Categories changed historically; counts are shown independently, without combining potentially overlapping categories. The circle shows the total record count, or the selected category count, without treating overlapping categories as parts of a whole.</p><p className="mt-2">Record creation time · UTC · {rangeLabel}</p>{!analytics.error && <ResourceStatus resource={analytics} label="Recorded categories" />}</details>
            {analytics.error && <div className="mt-2"><ResourceStatus resource={analytics} label="Recorded categories" /></div>}
            {financials && <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className={smallText + " mb-2"}>Lifetime collections · independent of the ride period</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/revenue?tab=subscription&scope=all" title={collections.updatedAt ? "Collections updated " + collections.updatedAt.toLocaleString() : undefined} className={"rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 p-3 hover:border-violet-400 transition-colors " + focus}><p className="text-xs">Subscription collections</p><p className="text-lg font-bold tabular-nums break-words mt-1">{collections.loading && collections.data === null ? "…" : formatMoney(collections.data)}</p>{collections.error && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{collections.data !== null ? "Stale · refresh failed" : "Unavailable"}</p>}</Link>
                <Link to="/revenue?tab=withdrawal&scope=all" title={stats.updatedAt ? "Commission updated " + stats.updatedAt.toLocaleString() : undefined} className={"rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-3 hover:border-emerald-400 transition-colors " + focus}><p className="text-xs">Withdrawal commission</p><p className="text-lg font-bold tabular-nums break-words mt-1">{stats.loading && stats.data === null ? "…" : formatMoney(stats.data?.revenueMetrics?.withdrawalCommissionRevenueUSD)}</p>{stats.error && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{stats.data !== null ? "Stale · refresh failed" : "Unavailable"}</p>}</Link>
              </div>
            </div>}
          </Card>
        </div>
      </section>

      <section aria-label="Registration growth" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <h2 className="sr-only">Registration growth</h2>
        <RegistrationPanel label="Riders" registrations={um?.newRiderRegistrations} resource={stats} />
        <RegistrationPanel label="Drivers" registrations={um?.newDriverRegistrations} resource={stats} />
      </section>

      {(mapAllowed || financials) && <nav aria-label="Operational shortcuts" className="flex flex-wrap gap-3">
        {mapAllowed && <Link to="/birds-eye-view" className={"inline-flex items-center gap-2 text-xs text-primary-900 dark:text-primary-400 hover:underline rounded " + focus}><MapPin className="w-4 h-4" />Live map and searches</Link>}
        {financials && <Link to="/peak-windows" className={"inline-flex items-center gap-2 text-xs text-primary-900 dark:text-primary-400 hover:underline rounded " + focus}><Clock className="w-4 h-4" />Peak window configuration</Link>}
      </nav>}
    </div>
  );
}
