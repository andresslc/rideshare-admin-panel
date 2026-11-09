import { useState, useEffect, useRef } from "react";
import { Users as UsersIcon, UserCheck, Eye, Loader2, Download } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetUsers from "../hooks/users/useGetUsers";
import useUserActions from "../hooks/users/useUserActions";
import useDebounce from "../hooks/global/useDebounce";
import { useNavigate, useLocation } from "react-router-dom";
import FilterBar from "../components/ui/FilterBar";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { formatPhoneNumber } from "../utils/helpers";
import { linkedUserType } from "../utils/dashboardLinks";

const EXPORT_FIELDS = [
  { key: "firstName",   label: "First Name" },
  { key: "lastName",    label: "Last Name" },
  { key: "email",       label: "Email" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "status",      label: "Status" },
];

/* ── Export Dialog ────────────────────────────────────────────────────── */
const ExportDialog = ({ isOpen, onClose, type }) => {
  const [fields, setFields] = useState(["firstName", "lastName", "email"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleField = (key) =>
    setFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );

  const handleExport = async () => {
    if (!fields.length) {
      toast.error("Please select at least one field.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.exportUsers(type, {
        startDate: startDate || null,
        endDate: endDate || null,
        fields,
      });

      // response.data is a Blob (responseType: "blob")
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}s_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded successfully");
      onClose();
    } catch (_e) {
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Export ${type === "rider" ? "Riders" : "Drivers"}`} size="sm">
      <div className="space-y-5">
        {/* Fields */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Fields to Export</p>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_FIELDS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fields.includes(key)}
                  onChange={() => toggleField(key)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            loading={loading}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Main Component ───────────────────────────────────────────────────── */
const Users = ({ linkedType }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentState("users_activeTab", "rider", false, linkedType);
  const [currentPage, setCurrentPage] = usePersistentState("users_currentPage", 1, false, linkedType ? 1 : undefined);
  const [pageSize, setPageSize] = usePersistentState("users_pageSize", PAGINATION_CONFIG.defaultPageSize);
  const [search, setSearch] = usePersistentState("users_search", "", false, linkedType ? "" : undefined);
  const [startDate, setStartDate] = usePersistentState("users_startDate", "", false, linkedType ? "" : undefined);
  const [endDate, setEndDate] = usePersistentState("users_endDate", "", false, linkedType ? "" : undefined);
  const [exportOpen, setExportOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const { users, loading, totalPages, totalData, refresh } = useGetUsers(
    activeTab,
    currentPage,
    pageSize,
    debouncedSearch,
    startDate,
    endDate
  );

  const { loading: loadingAction, updateStatus } = useUserActions();
  const { hasPermission } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status?.toLowerCase() === "active" ? "deactivated" : "active";
    const success = await updateStatus(user.id, activeTab, newStatus);
    if (success) refresh();
  };

  const columns = [
    {
      key: "firstName",
      label: "Name",
      render: (_, row) => {
        const name = [row.firstName, row.lastName].filter(Boolean).join(" ") || "—";
        return (
          <div className="flex items-center gap-3 min-w-0" title={name}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900 dark:text-white truncate">{name}</span>
          </div>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-gray-600 dark:text-gray-300">{value}</span>,
    },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value) => <span className="text-gray-600 dark:text-gray-300">{formatPhoneNumber(value) || "—"}</span>,
    },
    ...(activeTab === "driver" ? [{
      key: "subscriptionStatus",
      label: "Subscription",
      render: (value) => {
        const v = value?.toLowerCase();
        const variant = v === "active" ? "success" : v === "expired" ? "danger" : "warning";
        return <Badge variant={variant}>{value === null ? "Unpaid" : value?.toLowerCase() === "active" ? "Paid" : "Unpaid"}</Badge>;
      },
    }] : []),
    {
      key: "status",
      label: "Access",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Badge variant={value?.toLowerCase() === "active" ? "success" : "danger"}>{value}</Badge>
          <button
            onClick={() => handleStatusToggle(row)}
            disabled={loadingAction || !hasPermission('manageUsers')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              value?.toLowerCase() === "active" ? "bg-[#4338CA]" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                value?.toLowerCase() === "active" ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => navigate(`/user-management/${activeTab}/${row.id}`)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your riders and drivers across the platform
          </p>
        </div>
        {hasPermission('downloadExcel') && (
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={() => setExportOpen(true)}
          >
            Export CSV
          </Button>
        )}
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange("rider")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "rider"
              ? "text-[#4338CA] border-b-2 border-[#4338CA]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <UsersIcon className="w-4 h-4" />
            Riders
          </div>
        </button>
        <button
          onClick={() => handleTabChange("driver")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "driver"
              ? "text-[#4338CA] border-b-2 border-[#4338CA]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <UserCheck className="w-4 h-4" />
            Drivers
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email or phone..."
          filters={[
            { key: "startDate", label: "Start Date", type: "date", value: startDate, onChange: setStartDate },
            { key: "endDate",   label: "End Date",   type: "date", value: endDate,   onChange: setEndDate   },
          ]}
          onClear={() => { setSearch(""); setStartDate(""); setEndDate(""); }}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          title={activeTab === "rider" ? "Riders List" : "Drivers List"}
          data={users}
          columns={columns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          addButton={false}
        />
      </Card>

      {loadingAction && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#4338CA]" />
            <span className="font-medium text-gray-700">Updating status...</span>
          </div>
        </div>
      )}

      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        type={activeTab}
      />
    </div>
  );
};

export default function UsersPage() {
  const location = useLocation();
  return <Users key={location.key} linkedType={linkedUserType(location.search)} />;
}
