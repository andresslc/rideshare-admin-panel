import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Download,
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowDownCircle,
  TrendingUp,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import DataTable from "../components/common/DataTable";
import FilterBar from "../components/ui/FilterBar";
import StatsCard from "../components/common/StatsCard";

import { formatDate, downloadCSV, formatCurrency } from "../utils/helpers";
import useGetSubscriptionRevenue from "../hooks/revenue/useGetSubscriptionRevenue";
import useGetWithdrawalRevenue from "../hooks/revenue/useGetWithdrawalRevenue";
import useDebounce from "../hooks/global/useDebounce";
import { useAuth } from "../contexts/AuthContext";
import { linkedRevenueTab } from "../utils/dashboardLinks";
import { formatMoney } from "../utils/dashboardMetrics";

/* =========================
   DATE HELPERS
========================= */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

const isValidRange = (start, end) => start && end;

/* =========================
   COMPONENT
========================= */
const Revenue = ({ linkedTab }) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(linkedTab || "subscription");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* =========================
     SEPARATE FILTER STATES
  ========================= */

  const [subFilters, setSubFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const [withFilters, setWithFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });

  const subSearch = useDebounce(subFilters.search, 500);
  const withSearch = useDebounce(withFilters.search, 500);

  /* =========================
     TAB CHANGE
  ========================= */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  /* =========================
     DATE VALIDATION (CRITICAL FIX)
  ========================= */

  const subDateFrom = isValidRange(subFilters.startDate, subFilters.endDate)
    ? startOfDay(subFilters.startDate)
    : null;

  const subDateTo = isValidRange(subFilters.startDate, subFilters.endDate)
    ? endOfDay(subFilters.endDate)
    : null;

  const withDateFrom = isValidRange(withFilters.startDate, withFilters.endDate)
    ? startOfDay(withFilters.startDate)
    : null;

  const withDateTo = isValidRange(withFilters.startDate, withFilters.endDate)
    ? endOfDay(withFilters.endDate)
    : null;

  /* =========================
     API CALLS
  ========================= */

  const {
    data: subData,
    stats: subStats,
    loading: subLoading,
    totalPages: subTotalPages,
    totalData: subTotalData,
  } = useGetSubscriptionRevenue(
    currentPage,
    pageSize,
    subSearch,
    subDateFrom,
    subDateTo,
    subFilters.status?.target?.value
  );

  const {
    data: withData,
    stats: withStats,
    loading: withLoading,
    totalPages: withTotalPages,
    totalData: withTotalData,
  } = useGetWithdrawalRevenue(
    currentPage,
    pageSize,
    withSearch,
    withDateFrom,
    withDateTo
  );

  /* =========================
     UPDATE FILTERS
  ========================= */

  const updateSub = (key, value) => {
    setSubFilters((p) => ({ ...p, [key]: value }));
    setCurrentPage(1);
  };

  const updateWith = (key, value) => {
    setWithFilters((p) => ({ ...p, [key]: value }));
    setCurrentPage(1);
  };

  /* =========================
     EXPORT
  ========================= */

  const handleExport = () => {
    if (activeTab === "subscription") {
      if (!subData?.length) return;

      const formatted = subData.map((i) => ({
        "Driver Name": i.driverName,
        Email: i.email,
        Status: i.subscriptionStatus,
        "Purchase Date": formatDate(i.purchaseDate),
        "Expiry Date": formatDate(i.expiryDate),
        Amount: `$${Number(i.amount || 0).toFixed(2)}`,
      }));

      downloadCSV(formatted, "subscription_revenue");
    } else {
      if (!withData?.length) return;

      const formatted = withData.map((i) => ({
        "Driver Name": i.driverName,
        "Withdrawal Amount": `$${Number(i.withdrawalAmount || 0).toFixed(2)}`,
        Date: formatDate(i.date),
        "Admin Commission": `$${Number(i.adminCommission || 0).toFixed(2)}`,
      }));

      downloadCSV(formatted, "withdrawal_commission");
    }
  };

  /* =========================
     UI DATA SWITCH
  ========================= */

  const tableData = activeTab === "subscription" ? subData : withData;
  const loading = activeTab === "subscription" ? subLoading : withLoading;
  const totalPages =
    activeTab === "subscription" ? subTotalPages : withTotalPages;
  const totalData =
    activeTab === "subscription" ? subTotalData : withTotalData;

  /* =========================
     COLUMNS
  ========================= */

  const subColumns = [
    {
      key: "driverFirstName",
      label: "Driver Name",
      render: (_, row) => {
        const name = [row.driverFirstName, row.driverLastName].filter(Boolean).join(" ") || "—";
        return (
          <button
            onClick={() => navigate(`/user-management/driver/${row.driverId}`)}
            className="text-primary-600 hover:underline font-medium text-left"
          >
            {name}
          </button>
        );
      },
    },
    { key: "email", label: "Email" },
    {
      key: "subscriptionStatus",
      label: "Subscription Status",
      render: (v) => (
        <Badge className="ml-10 capitalize" variant={v === "active" ? "success" : "danger"}>
          {v}
        </Badge>
      ),
    },
    {
      key: "purchaseDate",
      label: "Purchase Date",
      render: formatDate,
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: formatDate,
    },
    {
      key: "amount",
      label: "Amount",
      render: (v) => formatCurrency(v || 0),
    },
  ];

  const withColumns = [
    {
      key: "driverFirstName",
      label: "Driver Name",
      render: (_, row) => {
        const name = [row.driverFirstName, row.driverLastName].filter(Boolean).join(" ") || "—";
        return (
          <button
            onClick={() => navigate(`/user-management/driver/${row.driverId}`)}
            className="text-primary-600 hover:underline font-medium text-left"
          >
            {name}
          </button>
        );
      },
    },
    {
      key: "withdrawalAmount",
      label: "Withdrawal Amount",
      render: (v) => formatCurrency(v || 0),
    },
    {
      key: "adminCommission",
      label: "Admin Commission",
      render: (v) => formatCurrency(v || 0),
    },
    {
      key: "date",
      label: "Date",
      render: formatDate,
    },
  ];

  /* =========================
     UI
  ========================= */

  /* =========================
     DATE RANGE DESCRIPTION
  ========================= */
  const getDayRangeDesc = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (days < 0) return null;
    return `Last ${days} day${days !== 1 ? "s" : ""} (${startDate} – ${endDate})`;
  };

  const subDateDesc = getDayRangeDesc(subFilters.startDate, subFilters.endDate);
  const withDateDesc = getDayRangeDesc(withFilters.startDate, withFilters.endDate);

  return (
    <div className="space-y-6 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Management</h1>
        {hasPermission('downloadExcel') && (
          <Button onClick={handleExport}>
            Export CSV
          </Button>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabChange("subscription")}
          className={`px-4 py-2 ${
            activeTab === "subscription"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Subscription Revenue
        </button>
        <button
          onClick={() => handleTabChange("withdrawal")}
          className={`px-4 py-2 ${
            activeTab === "withdrawal"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Withdrawal
        </button>
      </div>

      {/* STATS CARDS */}
      {activeTab === "subscription" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Subscriptions"
            value={subStats?.totalSubscriptionsPurchased ?? "—"}
            description={subDateDesc}
            icon={<CreditCard />}
            colored
            index={0}
          />
          <StatsCard
            title="Active Subscriptions"
            value={subStats?.totalActiveSubscriptions ?? "—"}
            description={subDateDesc}
            icon={<CheckCircle />}
            colored
            index={3}
          />
          <StatsCard
            title="Expired Subscriptions"
            value={subStats?.totalExpiredSubscriptions ?? "—"}
            description={subDateDesc}
            icon={<XCircle />}
            colored
            index={4}
          />
          <StatsCard
            title="Total Revenue"
            value={formatMoney(subStats?.totalRevenue)}
            description={subDateDesc}
            icon={<DollarSign />}
            colored
            index={1}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatsCard
            title="Total Withdrawals Processed"
            value={withStats?.totalWithdrawalsProcessed ?? "—"}
            description={withDateDesc}
            icon={<ArrowDownCircle />}
            colored
            index={0}
          />
          <StatsCard
            title="Withdrawal Commission"
            value={formatMoney(withStats?.totalCommissionRevenue)}
            description={withDateDesc}
            icon={<TrendingUp />}
            colored
            index={3}
          />
        </div>
      )}

      {/* FILTERS */}
      <Card>
        {activeTab === "subscription" ? (
          <FilterBar
            searchable
            searchValue={subFilters.search}
            onSearchChange={(v) => updateSub("search", v)}
            filters={[
              {
                key: "startDate",
                type: "date",
                value: subFilters.startDate,
                onChange: (v) => updateSub("startDate", v),
              },
              {
                key: "endDate",
                type: "date",
                value: subFilters.endDate,
                onChange: (v) => updateSub("endDate", v),
              },
              {
                key: "status",
                type: "select",
                value: subFilters.status?.target?.value,
                onChange: (v) => updateSub("status", v),
                options: [
                  { value: "active", label: "Active" },
                  { value: "expired", label: "Expired" },
                ],
              },
            ]}
            onClear={() =>
              setSubFilters({
                search: "",
                startDate: "",
                endDate: "",
                status: "",
              })
            }
          />
        ) : (
          <FilterBar
            searchable
            searchValue={withFilters.search}
            onSearchChange={(v) => updateWith("search", v)}
            filters={[
              {
                key: "startDate",
                type: "date",
                value: withFilters.startDate,
                onChange: (v) => updateWith("startDate", v),
              },
              {
                key: "endDate",
                type: "date",
                value: withFilters.endDate,
                onChange: (v) => updateWith("endDate", v),
              },
            ]}
            onClear={() =>
              setWithFilters({
                search: "",
                startDate: "",
                endDate: "",
              })
            }
          />
        )}
      </Card>

      {/* TABLE */}
      <Card>
        <DataTable
          data={tableData}
          columns={activeTab === "subscription" ? subColumns : withColumns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(1);
          }}
        />
      </Card>
    </div>
  );
};

export default function RevenuePage() {
  const location = useLocation();
  return <Revenue key={location.key} linkedTab={linkedRevenueTab(location.search)} />;
}
