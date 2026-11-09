import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MapPin, User, Car, Download, XCircle, CheckCircle2 } from "lucide-react";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FilterBar from "../components/ui/FilterBar";

import { formatDate, formatDateTime, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetRides from "../hooks/rides/useGetRides";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";
import { api } from "../lib/services";
import toast from "react-hot-toast";

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const statusBadge = (status) => {
  switch (status) {
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "ongoing":
      return <Badge variant="warning">Ongoing</Badge>;
    default:
      return <Badge variant="default">{status || "—"}</Badge>;
  }
};

const paymentBadge = (status) => {
  if (!status) return <Badge variant="default">—</Badge>;
  const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  switch (status.toLowerCase()) {
    case "paid":
      return <Badge variant="success">{formatted}</Badge>;
    case "pending":
      return <Badge variant="warning">{formatted}</Badge>;
    case "failed":
      return <Badge variant="danger">{formatted}</Badge>;
    default:
      return <Badge variant="default">{formatted}</Badge>;
  }
};

const PrivateRides = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = usePersistentState("privaterides_activeTab", "completed");
  const [search, setSearch] = usePersistentState("privaterides_search", "");
  const [page, setPage] = usePersistentState("privaterides_page", 1);
  const [limit, setLimit] = usePersistentState("privaterides_limit", 10);
  const [startDate, setStartDate] = usePersistentState("privaterides_startDate", "");
  const [endDate, setEndDate] = usePersistentState("privaterides_endDate", "");
  
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const handleViewRide = (id) => {
    navigate(`/private-rides/${id}`);
  };

  const { rides, stats, loading, totalPages, totalData } = useGetRides(
    page,
    limit,
    debouncedSearch,
    activeTab,
    startDate,
    endDate
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, startDate, endDate, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleExport = async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.error("Please select both start and end dates for export.");
      return;
    }

    setIsExporting(true);
    try {
      const response = await api.exportRides(activeTab, startDate, endDate);
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}_Rides_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      key: "pickupPoint",
      label: "Pickup Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
            {typeof val === 'string' ? val : val?.placeName || "—"}
          </span>
        </div>
      ),
    },
    ...(activeTab === "completed" ? [{
      key: "dropOffPoint",
      label: "Dropoff Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
            {typeof val === 'string' ? val : val?.placeName || "—"}
          </span>
        </div>
      ),
    }] : []),
    {
      key: "user",
      label: "Rider",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {fullName(val)}
            </p>
            <p className="text-xs text-gray-400">{val?.phone ? formatPhoneNumber(val.phone) : ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <Car className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {fullName(val)}
            </p>
            <p className="text-xs text-gray-400">{val?.phone ? formatPhoneNumber(val.phone) : ""}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rideType",
      label: "Type",
      render: (val) => (
        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "rideFare",
      label: "Fare",
      render: (val) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {val != null ? `$${val.toFixed(2)}` : "—"}
        </span>
      ),
    },
    ...(activeTab === "cancelled" ? [{
      key: "cancelledBy",
      label: "Cancelled By",
      render: (val) => (
        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
          {val || "—"}
        </span>
      ),
    }] : []),
    {
      key: "createdAt",
      label: "Date",
      render: (val) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {val ? formatDate(val) : "—"}
        </span>
      ),
    },
    {
      key: "_id",
      label: "",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => handleViewRide(row._id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Private Ride
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage your private ride records
          </p>
        </div>
        {hasPermission('downloadExcel') && (
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        )}
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange("completed")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "completed"
              ? "text-[#4338CA] border-b-2 border-[#4338CA]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-4 h-4" />
            Completed Rides
          </div>
        </button>
        <button
          onClick={() => handleTabChange("cancelled")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "cancelled"
              ? "text-[#4338CA] border-b-2 border-[#4338CA]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2 text-base">
            <XCircle className="w-4 h-4" />
            Cancelled Rides
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Total {activeTab === "completed" ? "Completed" : "Cancelled"} Rides
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalRides ?? "—"}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalRevenue != null ? stats.totalRevenue.toFixed(2) : "0.00"}
            </p>
          </Card>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          filters={[
            {
              key: "startDate",
              label: "Start Date",
              type: "date",
              value: startDate,
              onChange: (val) => { setStartDate(val); setPage(1); },
            },
            {
              key: "endDate",
              label: "End Date",
              type: "date",
              value: endDate,
              onChange: (val) => { setEndDate(val); setPage(1); },
            },
          ]}
          onClear={() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          data={rides}
          columns={columns}
          title={`${activeTab === "cancelled" ? "Cancelled" : "Completed"} Rides`}
          loading={loading}
          searchable
          searchTerm={search}
          searchPlaceholder="Search by rider or driver..."
          onSearch={handleSearchChange}
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
    </div>
  );
};

export default PrivateRides;
