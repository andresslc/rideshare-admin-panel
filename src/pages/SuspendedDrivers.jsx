import React, { useState, useRef, useEffect } from "react";
import { UserX, ShieldOff, Search, Clock, RotateCcw, AlertTriangle, List, Eye } from "lucide-react";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import FilterBar from "../components/ui/FilterBar";

import { formatDateTime } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetSuspendedDrivers from "../hooks/users/useGetSuspendedDrivers";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { api } from "../lib/services";
import toast from "react-hot-toast";

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const typeBadge = (type) => {
  switch (type) {
    case "cancellation":
      return <Badge variant="warning">Auto (Cancellations)</Badge>;
    case "admin_manual":
      return <Badge variant="danger">Admin (Timed)</Badge>;
    case "admin_permanent":
      return <Badge variant="danger">Permanent</Badge>;
    default:
      return <Badge variant="default">{type || "—"}</Badge>;
  }
};

const formatRemainingTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "Indefinite";
  if (seconds <= 0) return "Expired";

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  
  return parts.join(" ") || "< 1m";
};

const SuspensionDetailDialog = ({ selectedData, onClose, onRefresh }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [confirmUnsuspend, setConfirmUnsuspend] = useState(false);

  useEffect(() => {
    if (selectedData?.driverId) {
      fetchDetails();
    }
  }, [selectedData]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getDriverSuspensionDetails(selectedData.driverId);
      setDetails(res.data);
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = () => {
    setConfirmUnsuspend(true);
  };

  const confirmUnsuspendAction = async () => {
    setUnsuspendLoading(true);
    try {
      await api.unsuspendDriver(selectedData.driverId);
      toast.success("Driver unsuspended successfully");
      onRefresh();
      setConfirmUnsuspend(false);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to unsuspend driver");
    } finally {
      setUnsuspendLoading(false);
    }
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right break-words max-w-[60%]">
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <Modal isOpen={!!selectedData} onClose={onClose} title="Suspension Details" size="md">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading details...</div>
        ) : !details ? (
          <div className="py-8 text-center text-sm text-red-500">Could not load details.</div>
        ) : (
          <>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Driver Info</h4>
              <Row label="Name" value={fullName(details.driver)} />
              <Row label="Email" value={details.driver?.email} />
              <Row label="Status" value={details.isSuspended ? <Badge variant="danger">Suspended</Badge> : <Badge variant="success">Active</Badge>} />
            </div>

            {details.suspensions?.map((suspension, idx) => (
              <div key={idx} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Record #{idx + 1}
                </h4>
                <Row label="Type" value={typeBadge(suspension.suspensionType)} />
                <Row label="Reason" value={suspension.reason === "admin_deactivated" ? "Deactivated by Admin" : suspension.reason === "ride_cancellations" ? "Ride Cancelled" : suspension.reason} />
                <Row label="Suspended At" value={suspension.suspendedAt ? formatDateTime(suspension.suspendedAt) : "—"} />
                <Row label="Time Left" value={formatRemainingTime(suspension.remainingSeconds)} />
                
                {suspension.suspensionType === "cancellation" && (
                  <>
                    <Row label="Cancellations" value={`${suspension.cancellationCount} / ${suspension.maxCancellations}`} />
                  </>
                )}
                {suspension.suspendedByAdminId && (
                  <Row label="Admin ID" value={<span className="font-mono text-xs">{suspension.suspendedByAdminId}</span>} />
                )}
              </div>
            ))}
          </>
        )}
      </div>
      
      {details?.isSuspended && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <Button 
            variant="danger" 
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleUnsuspend}
            loading={unsuspendLoading}
          >
            Unsuspend Driver
          </Button>
        </div>
      )}

      {/* Unsuspend Confirmation Modal for Dialog */}
      <Modal
        isOpen={confirmUnsuspend}
        onClose={() => setConfirmUnsuspend(false)}
        title="Confirm Unsuspend"
        size="sm"
      >
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to unsuspend this driver? This clears all active suspensions.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmUnsuspend(false)} disabled={unsuspendLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            loading={unsuspendLoading}
            disabled={unsuspendLoading}
            onClick={confirmUnsuspendAction}
          >
            Yes, Unsuspend
          </Button>
        </div>
      </Modal>
    </Modal>
  );
};

const SuspendedDrivers = () => {
  const { hasPermission } = useAuth();
  
  const [activeTab, setActiveTab] = usePersistentState("suspendeddrivers_activeTab", "all");
  const [search, setSearch] = usePersistentState("suspendeddrivers_search", "");
  const [page, setPage] = usePersistentState("suspendeddrivers_page", 1);
  const [limit, setLimit] = usePersistentState("suspendeddrivers_limit", 10);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [confirmUnsuspend, setConfirmUnsuspend] = useState(null);

  const debouncedSearch = useDebounce(search, 500);

  const { drivers, loading, totalPages, totalData, refresh } = useGetSuspendedDrivers(
    page,
    limit,
    debouncedSearch,
    activeTab
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleUnsuspendQuick = (driverId) => {
    setConfirmUnsuspend(driverId);
  };

  const confirmUnsuspendAction = async () => {
    if (!confirmUnsuspend) return;
    
    setUnsuspendLoading(true);
    try {
      await api.unsuspendDriver(confirmUnsuspend);
      toast.success("Driver unsuspended successfully");
      refresh();
      setConfirmUnsuspend(null);
    } catch (err) {
      toast.error(err.message || "Failed to unsuspend driver");
    } finally {
      setUnsuspendLoading(false);
    }
  };

  const columns = [
    {
      key: "driver",
      label: "Driver",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {fullName(val)}
            </p>
            <p className="text-xs text-gray-400">{val?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "suspensionType",
      label: "Type",
      render: (val) => typeBadge(val),
    },
    {
      key: "reason",
      label: "Reason",
      render: (val) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate block" title={val}>
          {val === "admin_deactivated" ? "Deactivated by Admin" : val === "ride_cancellations" ? "Ride Cancelled" : (val || "—")}
        </span>
      ),
    },
    {
      key: "remainingSeconds",
      label: "Time Left",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          {formatRemainingTime(val)}
        </div>
      ),
    },
    {
      key: "suspendedAt",
      label: "Date",
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {val ? formatDateTime(val) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => setSelectedRecord(row)}>
            Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-600 hover:text-green-600 hover:border-green-600 border-gray-200"
            icon={<RotateCcw className="w-3.5 h-3.5" />} 
            onClick={() => handleUnsuspendQuick(row.driverId)}
            disabled={unsuspendLoading}
          >
            Unsuspend
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suspended Drivers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and manage driver suspensions across the platform
          </p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => handleTabChange("all")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === "all"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <List className="w-4 h-4" />
            All Suspensions
          </div>
        </button>
        <button
          onClick={() => handleTabChange("cancellation")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === "cancellation"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-4 h-4" />
            Auto (Cancellations)
          </div>
        </button>
        <button
          onClick={() => handleTabChange("admin_permanent")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === "admin_permanent"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <ShieldOff className="w-4 h-4" />
            Permanent
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          searchPlaceholder="Search by driver name or email..."
          onSearchChange={setSearch}
          onClear={() => setSearch("")}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          data={drivers}
          columns={columns}
          title="Suspended Drivers List"
          loading={loading || unsuspendLoading}
          addButton={false}
          exportable={false}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={page}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
        />
      </Card>

      {/* Detail Dialog */}
      <SuspensionDetailDialog
        selectedData={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onRefresh={refresh}
      />

      {/* Unsuspend Confirmation Modal */}
      <Modal
        isOpen={!!confirmUnsuspend}
        onClose={() => setConfirmUnsuspend(null)}
        title="Confirm Unsuspend"
        size="sm"
      >
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to unsuspend this driver?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmUnsuspend(null)} disabled={unsuspendLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            loading={unsuspendLoading}
            disabled={unsuspendLoading}
            onClick={confirmUnsuspendAction}
          >
            Yes, Unsuspend
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SuspendedDrivers;
