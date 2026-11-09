import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Navigation,
  MapPin,
  Car,
  Users,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DataTable from "../components/common/DataTable";
import useGetRides from "../hooks/rides/useGetRides";
import useGetCarpoolRides from "../hooks/rides/useGetCarpoolRides";
import useDebounce from "../hooks/global/useDebounce";
import { formatDate } from "../utils/helpers";
import toast from "react-hot-toast";

const fullName = (obj) =>
  [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const DevHub = () => {
  const navigate = useNavigate();

  // Jump Bar State
  const [jumpType, setJumpType] = useState("private"); // "private" | "carpool"
  const [jumpId, setJumpId] = useState("");

  // Tabs for browsing live records
  const [activeBrowseTab, setActiveBrowseTab] = useState("private"); // "private" | "carpool"
  const [privatePage, setPrivatePage] = useState(1);
  const [carpoolPage, setCarpoolPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Private Rides Query
  const {
    rides: privateRides,
    loading: loadingPrivate,
    totalPages: totalPrivatePages,
    totalData: totalPrivateData,
  } = useGetRides(privatePage, 10, debouncedSearch, "completed", "", "");

  // Carpool Rides Query
  const {
    rides: carpoolRides,
    loading: loadingCarpool,
    totalPages: totalCarpoolPages,
    totalData: totalCarpoolData,
  } = useGetCarpoolRides(carpoolPage, 10, debouncedSearch, "completed", "", "");

  const handleJump = (e) => {
    e?.preventDefault();
    const cleanId = jumpId.trim();
    if (!cleanId) {
      toast.error("Please enter a valid Ride or Carpool ID.");
      return;
    }
    if (jumpType === "private") {
      navigate(`/dev/private-rides/${cleanId}`);
    } else {
      navigate(`/dev/carpool-rides/${cleanId}`);
    }
  };

  const privateColumns = [
    {
      key: "_id",
      label: "Ride ID",
      render: (val) => (
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300 font-medium">
          {val}
        </span>
      ),
    },
    {
      key: "pickupPoint",
      label: "Pickup",
      render: (val) => (
        <div className="flex items-center gap-1.5 max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <span className="truncate text-xs text-gray-700 dark:text-gray-300">
            {typeof val === "string" ? val : val?.placeName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "dropOffPoint",
      label: "Dropoff",
      render: (val) => (
        <div className="flex items-center gap-1.5 max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate text-xs text-gray-700 dark:text-gray-300">
            {typeof val === "string" ? val : val?.placeName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      label: "Rider",
      render: (val) => (
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          {fullName(val)}
        </span>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (val) => (
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {fullName(val)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => (
        <span className="text-xs text-gray-500">{val ? formatDate(val) : "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <Button
          size="sm"
          variant="primary"
          icon={<Navigation className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/dev/private-rides/${row._id}`)}
          className="text-xs"
        >
          Inspect Timeline Map
        </Button>
      ),
    },
  ];

  const carpoolColumns = [
    {
      key: "_id",
      label: "Carpool ID",
      render: (val) => (
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300 font-medium">
          {val}
        </span>
      ),
    },
    {
      key: "startingPoint",
      label: "Start",
      render: (val) => (
        <div className="flex items-center gap-1.5 max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <span className="truncate text-xs text-gray-700 dark:text-gray-300">
            {val || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "destination",
      label: "Destination",
      render: (val) => (
        <div className="flex items-center gap-1.5 max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate text-xs text-gray-700 dark:text-gray-300">
            {val || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (val) => (
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          {fullName(val)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (val) => (
        <span className="text-xs text-gray-500">{val ? formatDate(val) : "—"}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <Button
          size="sm"
          variant="primary"
          icon={<Navigation className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/dev/carpool-rides/${row._id}`)}
          className="text-xs"
        >
          Inspect Timeline Map
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Developer Sandbox
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Inspect private rides and carpool timelines
        </p>
      </div>

      {/* Jump Bar Card */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-primary-600" />
          Search Timeline by ID
        </h2>

        <form onSubmit={handleJump} className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-900 shrink-0">
            <button
              type="button"
              onClick={() => setJumpType("private")}
              className={`px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                jumpType === "private"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Private Ride
            </button>
            <button
              type="button"
              onClick={() => setJumpType("carpool")}
              className={`px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                jumpType === "carpool"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Carpool Ride
            </button>
          </div>

          <div className="flex-1 min-w-[280px]">
            <input
              type="text"
              value={jumpId}
              onChange={(e) => setJumpId(e.target.value)}
              placeholder={`Enter ${jumpType === "private" ? "Private Ride" : "Carpool"} ID...`}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={<Navigation className="w-4 h-4" />}
            className="shrink-0"
          >
            Inspect Timeline
          </Button>
        </form>
      </Card>

      {/* Live Data Browser Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveBrowseTab("private");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeBrowseTab === "private"
                  ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Car className="w-4 h-4" />
              Private Rides
            </button>
            <button
              onClick={() => {
                setActiveBrowseTab("carpool");
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeBrowseTab === "carpool"
                  ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Carpool Rides
            </button>
          </div>

          <div className="w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {activeBrowseTab === "private" ? (
          <Card className="overflow-hidden">
            <DataTable
              data={privateRides}
              columns={privateColumns}
              title="Private Rides"
              loading={loadingPrivate}
              searchable={false}
              addButton={false}
              exportable={false}
              totalPages={totalPrivatePages}
              totalData={totalPrivateData}
              currentPage={privatePage}
              pageSize={10}
              onPageChange={setPrivatePage}
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <DataTable
              data={carpoolRides}
              columns={carpoolColumns}
              title="Carpool Rides"
              loading={loadingCarpool}
              searchable={false}
              addButton={false}
              exportable={false}
              totalPages={totalCarpoolPages}
              totalData={totalCarpoolData}
              currentPage={carpoolPage}
              pageSize={10}
              onPageChange={setCarpoolPage}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default DevHub;
