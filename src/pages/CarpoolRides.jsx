import React, { useRef, useEffect } from "react";
import { Eye, MapPin, User, Users, Car, Download, XCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import FilterBar from "../components/ui/FilterBar";

import { formatDate, formatDateTime, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetCarpoolRides from "../hooks/rides/useGetCarpoolRides";
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
    case "active":
      return <Badge variant="warning">Active</Badge>;
    case "full":
      return <Badge variant="primary">Full</Badge>;
    default:
      return <Badge variant="default">{status || "—"}</Badge>;
  }
};



const CarpoolRides = () => {
  const { hasPermission } = useAuth();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentState("carpoolrides_activeTab", "completed");
  const [search, setSearch] = usePersistentState("carpoolrides_search", "");
  const [page, setPage] = usePersistentState("carpoolrides_page", 1);
  const [limit, setLimit] = usePersistentState("carpoolrides_limit", 10);
  const [startDate, setStartDate] = usePersistentState("carpoolrides_startDate", "");
  const [endDate, setEndDate] = usePersistentState("carpoolrides_endDate", "");
  
  const [isExporting, React_useState] = React.useState(false);
  const setIsExporting = React_useState;

  const debouncedSearch = useDebounce(search, 500);

  const handleViewRide = (id) => {
    navigate(`/carpool-rides/${id}`);
  };

  const { rides, stats, loading, totalPages, totalData } = useGetCarpoolRides(
    page,
    limit,
    debouncedSearch,
    activeTab, // "cancelled" or "completed"
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
      const response = await api.exportCarpoolRides(activeTab, startDate, endDate);
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}_Carpool_Rides_Export_${new Date().toISOString().slice(0, 10)}.csv`;
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
      key: "startingPoint",
      label: "Pickup Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
            {val || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "destination",
      label: "Dropoff Location",
      render: (val) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
            {val || "—"}
          </span>
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
      key: "seats",
      label: "Passengers",
      render: (_, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.maxPassengers - row.availableSeats} / {row.maxPassengers}
        </span>
      ),
    },
    {
      key: "distance",
      label: "Distance",
      render: (val) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {val != null ? `${val.toFixed(2)} km` : "—"}
        </span>
      ),
    },
    // {
    //   key: "totalFare",
    //   label: "Total Fare",
    //   render: (val, row) => {
    //     const fare = row.totalFareReceived ?? row.totalFareCharged ?? row.totalFare ?? row.fare ?? val;
    //     return (
    //       <span className="text-sm font-medium text-green-600 dark:text-green-400">
    //         ${fare != null ? Number(fare).toFixed(2) : "0.00"}
    //       </span>
    //     );
    //   },
    // },
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
            Carpool Rides
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage all carpool routes and rides
          </p>
        </div>
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
              Total {activeTab === "cancelled" ? "Cancelled" : "Completed"} Rides
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
          title={`${activeTab === "cancelled" ? "Cancelled" : "Completed"} Carpool Rides`}
          loading={loading}
          searchable
          searchTerm={search}
          searchPlaceholder="Search by driver name/email or place..."
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

export default CarpoolRides;
