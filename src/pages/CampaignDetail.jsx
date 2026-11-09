import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Users, QrCode } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DataTable from "../components/common/DataTable";
import { formatDate, formatPercent } from "../utils/helpers";
import useCampaignDetail from "../hooks/campaigns/useCampaignDetail";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");

  const {
    loadingDetails,
    details,
    fetchDetails,
    loadingStats,
    stats,
    fetchStats,
    loadingRedemptions,
    redemptions,
    redemptionsTotal,
    fetchRedemptions,
    loadingCodes,
    codes,
    codesTotal,
    fetchCodes,
  } = useCampaignDetail(id);

  // Pagination states
  const [redemptionsPage, setRedemptionsPage] = useState(1);
  const [redemptionsLimit, setRedemptionsLimit] = useState(10);

  const [codesPage, setCodesPage] = useState(1);
  const [codesLimit, setCodesLimit] = useState(10);

  useEffect(() => {
    if (activeTab === "stats") {
      fetchStats();
      fetchDetails();
    }
  }, [activeTab, fetchStats, fetchDetails]);

  useEffect(() => {
    if (activeTab === "redemptions") fetchRedemptions(redemptionsPage, redemptionsLimit, "");
  }, [activeTab, redemptionsPage, redemptionsLimit, fetchRedemptions]);

  useEffect(() => {
    if (activeTab === "codes") fetchCodes(codesPage, codesLimit);
  }, [activeTab, codesPage, codesLimit, fetchCodes]);

  const tabs = [
    { id: "stats", label: "Stats & Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "redemptions", label: "Redemptions", icon: <Users className="w-4 h-4" /> },
    { id: "codes", label: "Generated Codes", icon: <QrCode className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/campaigns")} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Details</h1>
          <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "stats" && (
          <div className="space-y-6">
            {loadingStats ? (
              <p>Loading stats...</p>
            ) : stats ? (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Info</h2>
                  {loadingDetails ? (
                    <p className="text-sm text-gray-500">Loading details...</p>
                  ) : details ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{details.name || stats.campaignName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{details.status || stats.status || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {details.discountType === "percentage" ? formatPercent(details.discountValue) : `$${Number(details.discountValue || 0).toFixed(2)}`}
                          {details.maxDiscountCap ? ` (Up to $${Number(details.maxDiscountCap).toFixed(2)})` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {details.startDate ? formatDate(details.startDate) : (stats.startDate ? formatDate(stats.startDate) : "")} - {details.expiresAt ? formatDate(details.expiresAt) : (stats.expiresAt ? formatDate(stats.expiresAt) : "")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Code Mode</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{details.codeMode || "—"}</p>
                      </div>
                      {/* <div>
                        <p className="text-sm text-gray-500">Code / Prefix</p>
                        <p className="font-medium text-gray-900 dark:text-white">{details.codeMode === "public" ? details.code : details.prefix || "—"}</p>
                      </div> */}
                      <div>
                        <p className="text-sm text-gray-500">Max Uses Per User</p>
                        <p className="font-medium text-gray-900 dark:text-white">{details.maxUsesPerUser || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Min Ride Amount</p>
                        <p className="font-medium text-gray-900 dark:text-white">{details.minRideAmount ? `$${Number(details.minRideAmount).toFixed(2)}` : "—"}</p>
                      </div>
                      <div className="col-span-2 md:col-span-4">
                        <p className="text-sm text-gray-500 mb-1">Eligibility</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize dark:bg-blue-900/50 dark:text-blue-300">User Type: {details.eligibility?.userType || "All"}</span>
                          {details.eligibility?.minAge && <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded dark:bg-purple-900/50 dark:text-purple-300">Min Age: {details.eligibility.minAge}</span>}
                          {details.eligibility?.rideTypes?.map(rt => <span key={rt} className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded capitalize dark:bg-green-900/50 dark:text-green-300">{rt} Ride</span>)}
                          {details.eligibility?.cities?.map(city => <span key={city} className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded dark:bg-yellow-900/50 dark:text-yellow-300">{city}</span>)}
                        </div>
                      </div>
                      {details.description && (
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-sm text-gray-500 mb-1">Description</p>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{details.description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{stats.campaignName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{stats.status || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {stats.discountType === "percentage" ? formatPercent(stats.discountValue) : `$${Number(stats.discountValue || 0).toFixed(2)}`}
                          {stats.maxDiscountCap ? ` (Up to $${Number(stats.maxDiscountCap).toFixed(2)})` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {stats.startDate ? formatDate(stats.startDate) : ""} - {stats.expiresAt ? formatDate(stats.expiresAt) : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Redemptions</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRedemptions || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Limit: {stats.totalRedemptionLimit || "Unlimited"}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Unique Users Redeemed</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.uniqueUsersCount || 0}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Discount Given</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${Number(stats.totalDiscountGiven || 0).toFixed(2)}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Average Discount / Ride</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${stats.averageDiscountPerRide != null ? Number(stats.averageDiscountPerRide).toFixed(2) : "0.00"}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Redemption Rate</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatPercent(stats.redemptionRate)}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">Budget Remaining</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.budgetRemaining !== null ? `$${Number(stats.budgetRemaining).toFixed(2)}` : "Unlimited"}</p>
                  </Card>
                </div>
              </>
            ) : (
              <p>No stats available.</p>
            )}
          </div>
        )}

        {activeTab === "redemptions" && (
          <Card className="overflow-hidden">
            <DataTable
              title="Redemptions"
              data={redemptions}
              columns={[
                { key: "user", label: "User", render: (_, r) => r.user?.email || r.user?.name || r.userId?.email || r.userId || "—" },
                { key: "rider", label: "Rider Name", render: (_, r) => r.riderName || r.user?.name || "—" },
                { key: "driver", label: "Driver Name", render: (_, r) => r.driverName || r.driver?.name || "—" },
                { key: "code", label: "Code Used", render: (_, r) => <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{r.promoCode?.code || r.code || "—"}</span> },
                { key: "date", label: "Redeemed At", render: (_, r) => formatDate(r.redeemedAt || r.createdAt) },
              ]}
              loading={loadingRedemptions}
              totalData={redemptionsTotal}
              totalPages={Math.ceil(redemptionsTotal / redemptionsLimit)}
              currentPage={redemptionsPage}
              pageSize={redemptionsLimit}
              onPageChange={setRedemptionsPage}
              onPageSizeChange={(s) => { setRedemptionsLimit(s); setRedemptionsPage(1); }}
              addButton={false}
            />
          </Card>
        )}

        {activeTab === "codes" && (
          <Card className="overflow-hidden">
            <DataTable
              title="Generated Codes"
              data={codes}
              columns={[
                { key: "code", label: "Code", render: (val) => <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{val}</span> },
                { key: "created", label: "Generated At", render: (_, r) => formatDate(r.createdAt) },
              ]}
              loading={loadingCodes}
              totalData={codesTotal}
              totalPages={Math.ceil(codesTotal / codesLimit)}
              currentPage={codesPage}
              pageSize={codesLimit}
              onPageChange={setCodesPage}
              onPageSizeChange={(s) => { setCodesLimit(s); setCodesPage(1); }}
              addButton={false}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;
