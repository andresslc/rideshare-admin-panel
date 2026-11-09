import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import FilterBar from "../components/ui/FilterBar";
import { ResourceStatus } from "../components/dashboard/DashboardMetric";
import { Download, Eye } from "lucide-react";
import { downloadCSV, formatDate, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/services";
import useDashboardResource from "../hooks/dashboard-analytics/useDashboardResource";
import { describeRequirements, DOCUMENT_LABELS, entityId, metricCount, ONBOARDING_GROUPS } from "../utils/dashboardMetrics";
import { driverRequirementQueue } from "../utils/dashboardSources";

// The pending list can include vehicle-detail submissions alongside documents.
const SUBMISSION_LABELS = { ...DOCUMENT_LABELS, vehicleDetails: "Vehicle details" };
const GROUP_BADGES = { missingVehicle: "warning", missingDocuments: "warning", needsCorrection: "danger", readyForReview: "info", approved: "success", unknown: "default" };

const DriverRequests = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGroup = searchParams.get("requirements");
  const requirements = Object.hasOwn(ONBOARDING_GROUPS, requestedGroup) ? requestedGroup : "";
  // History navigation changes the group immediately and starts at page one.
  const [pageState, setPageState] = useState({ requirements, value: 1 });
  const page = pageState.requirements === requirements ? pageState.value : 1;
  const setPage = (value) => setPageState({ requirements, value });
  const selectRequirements = (group) => {
    setPageState({ requirements: group, value: 1 });
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (group) next.set("requirements", group);
      else next.delete("requirements");
      return next;
    });
  };
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchDrivers = useCallback(async (signal) => {
    const response = await api.getDrivers(page, limit, debouncedSearch, "pending", { signal }, requirements);
    return driverRequirementQueue(response);
  }, [page, limit, debouncedSearch, requirements]);
  const identity = [user?.id ?? user?._id ?? user?.email, user?.role].join(":");
  const resource = useDashboardResource(fetchDrivers, { interval: 0, identity });
  const drivers = resource.data?.rows ?? [];
  // A new filter, page or search starts a fresh request; keep the last counts
  // on screen meanwhile so the filter buttons do not disappear.
  const [lastStats, setLastStats] = useState(null);
  useEffect(() => {
    if (resource.data) setLastStats(resource.data.stats);
  }, [resource.data]);
  const stats = resource.data ? resource.data.stats : lastStats;
  const previousCounts = !resource.data && stats !== null;

  const handleExport = () => {
    if (!drivers.length) return;
    downloadCSV(drivers.map((driver) => ({
      ID: entityId(driver),
      Name: [driver.firstName, driver.lastName].filter(Boolean).join(" ") || "—",
      Email: driver.email,
      Phone: formatPhoneNumber(driver.phone) || "—",
      "Registration Date": formatDate(driver.createdAt),
      "Submission Review": driver.requiresApproval === true ? "Pending submissions" : driver.requiresApproval === false ? "No pending submissions" : "Unknown",
      "Vehicle Records": metricCount(driver.vehicleCount) ?? "Unavailable",
      "Account Status": driver.isDeactivatedByAdmin ? "Deactivated" : "Active",
      "Requirement Group": ONBOARDING_GROUPS[driver.requirementGroup] ?? "Unavailable",
      "Vehicle Status": driver.requirements?.vehicle?.status ?? "Unavailable",
      "Driver License Status": driver.requirements?.driverLicense?.status ?? "Unavailable",
      "Vehicle Registration Status": driver.requirements?.vehicleRegistration?.status ?? "Unavailable",
      "Insurance Status": driver.requirements?.insurance?.status ?? "Unavailable",
    })), "driver_requests_export");
  };

  const columns = [
    {
      key: "firstName", label: "Driver Name",
      render: (_, row) => {
        const name = [row.firstName, row.lastName].filter(Boolean).join(" ") || "—";
        return <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-gray-900 dark:text-white capitalize truncate max-w-[200px]">{name}</span>
        </div>;
      },
    },
    { key: "email", label: "Email", render: (value) => <span className="text-gray-600 dark:text-gray-300 truncate max-w-[220px] block">{value || "—"}</span> },
    ...(hasPermission("seeSensitiveData") ? [{ key: "ssn", label: "SSN Number", render: (value) => <span className="text-gray-600 dark:text-gray-300 truncate max-w-[220px] block">{value || "—"}</span> }] : []),
    { key: "phone", label: "Phone Number", render: (value) => <span className="text-gray-600 dark:text-gray-300">{formatPhoneNumber(value) || "—"}</span> },
    {
      key: "requirements", label: "Current Status", truncate: false,
      render: (_, row) => {
        if (stats === null) {
          const waiting = Array.isArray(row.pendingDocuments) ? row.pendingDocuments.map((document) => SUBMISSION_LABELS[document?.type] || document?.type || "Unknown document") : [];
          return <div className="space-y-1 whitespace-normal min-w-[100px] max-w-[180px] text-xs">
            {waiting.length > 0 && <p className="text-gray-700 dark:text-gray-300">Waiting: {waiting.join(", ")}</p>}
            {row.hasPendingVehicles === true && <p className="text-gray-700 dark:text-gray-300">Vehicle pending or rejected</p>}
            {metricCount(row.vehicleCount) === 0 && <p className="text-gray-700 dark:text-gray-300">No vehicle added</p>}
          </div>;
        }
        const description = describeRequirements(row.requirements);
        const otherUploads = (row.pendingDocuments ?? []).filter((document) => {
          const key = document.type === "vehicleDetails" ? "vehicle" : document.type;
          return entityId(document) && entityId(document) !== row.requirements[key]?.id;
        }).map((document) => SUBMISSION_LABELS[document.type] || document.type || "Unknown document");
        return <div className="space-y-1 whitespace-normal min-w-[120px] max-w-[180px] text-xs">
          <Badge variant={GROUP_BADGES[row.requirementGroup]} size="sm" className="w-fit whitespace-normal">{ONBOARDING_GROUPS[row.requirementGroup]}</Badge>
          {description.rejected.map((item) => <p key={item.key} className="text-red-700 dark:text-red-400">
            Rejected: {item.label}{item.reason && " · " + item.reason}
          </p>)}
          {description.lines.map((line) => <p key={line.status} className="text-gray-700 dark:text-gray-300">{line.title}: {line.labels.join(", ")}</p>)}
          {otherUploads.length > 0 && <p className="text-gray-700 dark:text-gray-300">Newer upload waiting: {otherUploads.join(", ")}</p>}
          {/* The list flag covers pending and rejected vehicles, so the current vehicle in either state explains it. */}
          {row.hasPendingVehicles && !["pending", "rejected"].includes(row.requirements.vehicle.status) && <p className="text-gray-700 dark:text-gray-300">Another vehicle pending or rejected</p>}
        </div>;
      },
    },
    {
      key: "action", label: "Actions",
      render: (_, row) => <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => navigate("/driver/" + entityId(row))}>Details</Button>,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage driver registration requests and document verification.</p>
        </div>
        {hasPermission("downloadExcel") && <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExport} disabled={!drivers.length || resource.loading}>Export CSV</Button>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar searchable searchValue={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} searchPlaceholder="Search by name, email or phone..."
          onClear={() => { setSearch(""); setPage(1); }} />
      </div>

      <Card padding="p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Current account requirements</h2>
        {stats !== null ? <>
          <div role="group" aria-label="Requirement filters" aria-busy={previousCounts && resource.loading} className={"flex flex-wrap gap-2 mt-3 transition-opacity " + (previousCounts ? "opacity-60" : "")}>
            {[["", "All"], ...Object.entries(ONBOARDING_GROUPS)].map(([key, label]) => <Button key={key} size="sm"
              variant={requirements === key ? "primary" : "outline"} aria-pressed={requirements === key}
              className="whitespace-normal text-left" onClick={() => selectRequirements(key)}>
              {label} <span className="ml-2 font-semibold">{(stats[key || "total"]).toLocaleString()}</span>
            </Button>)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3" aria-live="polite">{previousCounts ? (resource.loading ? "Updating counts…" : "Counts from the last successful update.") : <>Counts cover every driver in this queue{debouncedSearch && " matching the search"}.</>}</p>
        </> : resource.data && <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Requirement filters need the updated server.</p>}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">This queue lists drivers with pending submissions; registrations with no uploads are not included.</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Approval here does not establish every condition for working.</p>
      </Card>

      <ResourceStatus resource={resource} label="Driver submissions" />
      <Card className="overflow-hidden">
        {!resource.data && !resource.loading ? <p className="text-sm text-gray-500 dark:text-gray-400">Submission queue unavailable. Retry the source above.</p> : <DataTable title="Verification Requests" data={drivers} columns={columns} loading={resource.loading}
          totalPages={Math.max(1, resource.data?.pagination?.totalPages ?? 1)} totalData={resource.data?.pagination?.total ?? 0}
          emptyMessage={requirements && stats !== null ? "No drivers in this group." : "No data available"}
          currentPage={page} onPageChange={setPage} onPageSizeChange={(size) => { setLimit(size); setPage(1); }} pageSize={limit} addButton={false} />}
      </Card>
    </div>
  );
};

export default DriverRequests;
