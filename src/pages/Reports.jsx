import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, CheckCircle, Clock, Users, Eye } from "lucide-react";
import StatsCard from "../components/common/StatsCard";
import DataTable from "../components/common/DataTable";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { api } from "../lib/services";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { formatDate } from "../utils/helpers";
import { linkedReportStatus } from "../utils/dashboardLinks";
import { formatMetric } from "../utils/dashboardMetrics";
import { reportPreview, paginationTotals } from "../utils/dashboardSources";
import useDashboardResource from "../hooks/dashboard-analytics/useDashboardResource";
import { ResourceStatus } from "../components/dashboard/DashboardMetric";
import { useAuth } from "../contexts/AuthContext";

const Reports = ({ linkedStatus }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = usePersistentState("reports_statusFilter", "", false, linkedStatus);
  const [pageSize, setPageSize] = usePersistentState("reports_pageSize", 10);

  const fetchReports = useCallback(async (signal) => {
    const response = await api.getReports(currentPage, pageSize, statusFilter, "desc", { signal });
    reportPreview(response);
    paginationTotals(response);
    return response;
  }, [currentPage, pageSize, statusFilter]);
  const resource = useDashboardResource(fetchReports, { interval: 0, identity: [user?.id ?? user?._id ?? user?.email, user?.role].join(":") });
  const loading = resource.loading;
  const reports = resource.data?.data?.results ?? [];
  const stats = resource.data?.data?.stats;
  const pagination = resource.data?.pagination;

  const columns = [
    {
      key: "reporterName",
      label: "Reporter Name",
      render: (_, row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {`${row?.reporterFirstName || ""} ${row?.reporterLastName || ""}`.trim() || "N/A"}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {row?.reporterType}
          </span>
        </div>
      ),
    },
    {
      key: "reportedPersonName",
      label: "Reported Person",
      render: (_, row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {`${row?.reportedPersonFirstName || ""} ${row?.reportedPersonLastName || ""}`.trim() || "N/A"}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {row?.reportedPersonType}
          </span>
        </div>
      ),
    },
    {
      key: "reportReason",
      label: "Reason / Type",
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={value === "pending" ? "warning" : value === "resolved" ? "success" : value === "rejected" ? "danger" : "default"}
          className="capitalize"
        >
          {value || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "_id",
      label: "Actions",
      render: (value, row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/reports-detail/${value ?? row.reportId ?? row.id}`)}
          icon={<Eye className="w-4 h-4" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  const mostReported = stats?.mostReportedEntities?.[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports Management
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reports Received"
          value={formatMetric(stats?.totalReportsReceived)}
          icon={<AlertTriangle />}
          index={0}
        />
        <StatsCard
          title="Pending Reports"
          value={formatMetric(stats?.pendingReports)}
          icon={<Clock />}
          index={1}
          colored
        />
        <StatsCard
          title="Resolved Reports"
          value={formatMetric(stats?.resolvedReports)}
          icon={<CheckCircle />}
          index={2}
          colored
        />
        <StatsCard
          title="Most Reported (list filter)"
          value={mostReported ? `${mostReported.firstName || ""} ${mostReported.lastName || ""}`.trim() || "N/A" : "N/A"}
          description={
            mostReported
              ? `${mostReported.reportCount} reports (${mostReported.type})`
              : "No reported entities"
          }
          icon={<Users />}
          index={3}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">Received, pending, resolved and rejected totals cover all visible reports. The list follows the selected status. Rejected: {formatMetric(stats?.rejectedReports)}.</p>
      <ResourceStatus resource={resource} label="Reports" />

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-end gap-4 border border-gray-100 dark:border-gray-700">
        <div className="flex-1 max-w-xs">
          <Select
            label="Filter by Status"
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: "", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
        </div>
        {/* <div className="flex-1 max-w-xs">
          <Select
            label="Sort by Date"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: "desc", label: "Newest First" },
              { value: "asc", label: "Oldest First" },
            ]}
          />
        </div> */}
      </div>

      {/* Reports Table */}
      <div className="bg-white p-6 dark:bg-gray-800 rounded-lg shadow-sm">
        {!resource.data && !loading ? <p className="text-sm text-gray-500 dark:text-gray-400">Report list unavailable. Retry the source above.</p> : <DataTable
          title="All Reports"
          columns={columns}
          data={reports}
          loading={loading}
          totalPages={Math.max(1, pagination?.totalPages ?? 1)}
          currentPage={currentPage}
          totalData={pagination?.total ?? 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          pageSize={pageSize}
          addButton={false}
        />}
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const location = useLocation();
  return <Reports key={location.key} linkedStatus={linkedReportStatus(location.search)} />;
}
