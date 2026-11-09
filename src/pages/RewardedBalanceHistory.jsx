import React, { useRef, useEffect, useState } from "react";
import { Clock, Search, History, CheckCircle2, User, Coins, ShieldCheck, Mail, ArrowUpRight, ArrowDownRight } from "lucide-react";

import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FilterBar from "../components/ui/FilterBar";

import { formatDate, formatDateTime, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import useGetRewardedBalanceHistory from "../hooks/users/useGetRewardedBalanceHistory";
import useDebounce from "../hooks/global/useDebounce";
import { usePersistentState } from "../hooks/global/usePersistentState";

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const RewardedBalanceHistory = () => {
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = usePersistentState("rewardedbalance_activeTab", "all");
  const [search, setSearch] = usePersistentState("rewardedbalance_search", "");
  const [page, setPage] = usePersistentState("rewardedbalance_page", 1);
  const [limit, setLimit] = usePersistentState("rewardedbalance_limit", 10);
  const [startDate, setStartDate] = usePersistentState("rewardedbalance_startDate", "");
  const [endDate, setEndDate] = usePersistentState("rewardedbalance_endDate", "");
  const [sortBy, setSortBy] = usePersistentState("rewardedbalance_sortBy", "createdAt");
  const [order, setOrder] = usePersistentState("rewardedbalance_order", "desc");
  console.log(order)

  const debouncedSearch = useDebounce(search, 500);

  const { history, loading, totalPages, totalData } = useGetRewardedBalanceHistory(
    page,
    limit,
    activeTab, // "all", "rider", "driver", "user"
    debouncedSearch,
    startDate,
    endDate,
    sortBy?.target?.value || sortBy,
    order?.target?.value || order
  );

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, startDate, endDate, activeTab, sortBy, order]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (_, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.createdAt || row.date ? formatDateTime(row.createdAt || row.date) : "—"}
        </span>
      ),
    },
    {
      key: "user",
      label: "User / Driver",
      render: (val, row) => {
        // Fallback to row.user if user/driver split is complex or nested differently
        const userData = row.user || row.driver || row.rider || val;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {fullName(userData)}
              </p>
              <p className="text-xs text-gray-400">{userData?.email || (userData?.phone ? formatPhoneNumber(userData.phone) : "")}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "userType",
      label: "User Type",
      render: (val, row) => (
        <Badge variant={val === "driver" ? "primary" : val === "rider" ? "success" : "default"} className="capitalize">
          {val || row.role || "User"}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val) => (
        <div className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
          <ArrowUpRight className="w-4 h-4" />
          <span>${val != null ? Number(val).toFixed(2) : "0.00"}</span>
        </div>
      ),
    },
    {
      key: "admin",
      label: "Rewarded By",
      render: (val, row) => {
        const adminData = row.admin || val;
        return (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {fullName(adminData) !== "—" ? fullName(adminData) : "Admin"}
              </span>
              <span className="text-xs text-gray-400">
                {adminData?.email || ""}
              </span>
            </div>
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            Rewarded Balance History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View history of all promotional and manual balance rewards given to users and drivers.
          </p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => handleTabChange("all")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "all"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <div className="flex items-center gap-2 text-base">
            <History className="w-4 h-4" />
            All Rewards
          </div>
        </button>
        <button
          onClick={() => handleTabChange("driver")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "driver"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <div className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" />
            Drivers Only
          </div>
        </button>
        <button
          onClick={() => handleTabChange("rider")}
          className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "rider"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <div className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" />
            Riders Only
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          searchPlaceholder="Search by name, email, phone..."
          onSearchChange={setSearch}
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
            {
              key: "sortBy",
              label: "Sort By",
              type: "select",
              options: [
                { label: "Date Created", value: "createdAt" },
                { label: "Reward Date", value: "date" },
                { label: "Amount", value: "amount" },
              ],
              value: sortBy?.target?.value || sortBy,
              onChange: (val) => { setSortBy(val?.value || val); setPage(1); },
            },
            {
              key: "order",
              label: "Order",
              type: "select",
              options: [
                { label: "Descending", value: "desc" },
                { label: "Ascending", value: "asc" },
              ],
              value: order?.target?.value || order,
              onChange: (val) => { setOrder(val?.value || val); setPage(1); },
            },
          ]}
          onClear={() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
            setSortBy("createdAt");
            setOrder("desc");
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden">
        <DataTable
          data={history}
          columns={columns}
          title="Reward Transactions"
          loading={loading}
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

export default RewardedBalanceHistory;
