import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  MapPin,
  Hash,
  Wallet,
  TrendingUp,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { formatDate, handleError, handleSuccess, maskEmail, maskPhone, formatPhoneNumber, formatCurrency } from "../utils/helpers";
import Table from "../components/ui/Table";
import StatsCard from "../components/common/StatsCard";
import EditProfileModal from "../components/common/EditProfileModal";
import { api } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";

const RiderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { details, loading, refresh } = useGetUserDetails(id, "rider");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const editInitialData = useMemo(
    () => ({
      firstName: details?.fullDetails?.firstName || "",
      lastName: details?.fullDetails?.lastName || "",
      email: details?.personalInfo?.email || details?.fullDetails?.email || "",
      subscriptionStatus: details?.fullDetails?.subscriptionStatus || "",
      balance: 0,
    }),
    [details],
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await api.deleteUser(id, "rider");
      handleSuccess(response?.message, "Rider deleted successfully");
      setDeleteModalOpen(false);
      navigate("/user-management");
    } catch (error) {
      handleError(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Rider not found</h2>
        <Button
          variant="ghost"
          onClick={() => navigate("/user-management")}
          className="mt-4"
        >
          Back to Users
        </Button>
      </div>
    );
  }

  const {
    personalInfo,
    rideStats,
    rideHistory,
    activityLogs,
    ratingAndFeedback,
    transactionHistory,
    walletBalance,
    carpoolHistory,
  } = details;

  const historyColumns = [
    {
      key: "createdAt",
      label: "Date",
      render: (val) => formatDate(val),
    },
    {
      key: "driver",
      label: "Driver",
      render: (driver) => [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "N/A",
    },
    {
      key: "pickupPoint",
      label: "Pickup",
      render: (point) => (
        <span
          className="text-xs max-w-[150px] block truncate"
          title={point?.placeName}
        >
          {point?.placeName || "N/A"}
        </span>
      ),
    },
    {
      key: "dropOffPointRequested",
      label: "Drop-off",
      render: (point) => (
        <span
          className="text-xs max-w-[150px] block truncate"
          title={point?.placeName}
        >
          {point?.placeName || "N/A"}
        </span>
      ),
    },
    {
      key: "rideFare",
      label: "Fare",
      render: (val) => formatCurrency(val || 0),
    },
    {
      key: "rideStatus",
      label: "Status",
      render: (val) => (
        <Badge
        className="capitalize"
          variant={val?.toLowerCase() === "completed" ? "success" : "danger"}
        >
          {val}
        </Badge>
      ),
    },
  ];

  const carpoolHistoryColumns = [
    {
      key: "createdAt",
      label: "Date",
      render: (val) => formatDate(val),
    },
    {
      key: "driver",
      label: "Driver",
      render: (driver) => [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "N/A",
    },
    {
      key: "startingPoint",
      label: "Pickup",
      render: (point) => (
        <span
          className="text-xs max-w-[150px] block truncate"
          title={point?.placeName}
        >
          {point?.placeName || "N/A"}
        </span>
      ),
    },
    {
      key: "destination",
      label: "Drop-off",
      render: (point) => (
        <span
          className="text-xs max-w-[150px] block truncate"
          title={point?.placeName}
        >
          {point?.placeName || "N/A"}
        </span>
      ),
    },
    {
      key: "fareCharged",
      label: "Fare",
      render: (val) => formatCurrency(val || 0),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge
          className="capitalize"
          variant={val?.toLowerCase() === "completed" ? "success" : "danger"}
        >
          {val}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/user-management")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Rider Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <Card className="lg:col-span-1">
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                {personalInfo?.profilePicture ? (
                  <img
                    src={personalInfo.profilePicture}
                   alt={[personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "";
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
               {[personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ") || "N/A"}
              </h2>
              <Badge
                variant={
                  personalInfo.status === "Active" ? "success" : "danger"
                }
                className="mt-2"
              >
                {personalInfo.status}
              </Badge>
              {hasPermission('manageUsers') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setEditModalOpen(true)}
                    icon={<Pencil className="w-3.5 h-3.5" />}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-2"
                    onClick={() => setDeleteModalOpen(true)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete Rider
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{hasPermission('seeSensitiveData') ? personalInfo.email : maskEmail(personalInfo.email)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{hasPermission('seeSensitiveData') ? (formatPhoneNumber(personalInfo.phone || personalInfo.phoneNumber) || "—") : maskPhone(personalInfo.phone || personalInfo.phoneNumber)}</span>
              </div>
              {(personalInfo?.address || details?.fullDetails?.address) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                  <span>{personalInfo?.address || details?.fullDetails?.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  Account Created: {formatDate(details.fullDetails.createdAt)}
                </span>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Activity Logs
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Last Login</span>
                  <span className="text-gray-900 font-medium">
                    {activityLogs?.lastLogin
                      ? formatDate(activityLogs.lastLogin)
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Last Ride</span>
                  <span className="text-gray-900 font-medium">
                    {activityLogs?.lastRideTaken
                      ? formatDate(activityLogs.lastRideTaken)
                      : "No rides yet"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className={`mb-4 grid gap-4 ${details?.rewardedBalance != null ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <StatsCard
              title="Wallet Balance"
              value={formatCurrency(walletBalance || 0)}
              icon={<Wallet />}
              colored
              index={3}
            />
            {details?.rewardedBalance != null && (
              <StatsCard
                title="Rewarded Balance"
                value={formatCurrency(details?.rewardedBalance || 0)}
                icon={<Wallet />}
                colored
                index={4}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Total Rides"
              value={rideStats?.totalCompleted || 0}
              icon={<TrendingUp />}
              colored
              index={3}
            />
            <StatsCard
              title="Cancelled Rides"
              value={rideStats?.totalCancelled || 0}
              icon={<XCircle />}
              colored
              index={5}
            />
            <StatsCard
              title="Average Rating"
              value={
                details?.averageRating != null && !isNaN(parseFloat(details.averageRating))
                  ? parseFloat(details.averageRating).toFixed(2)
                  : "0.00"
              }
              icon={<Star />}
              colored
              index={4}
            />
          </div>

          {/* Ride History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ride History
              </h3>
              {rideHistory && rideHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table data={rideHistory} columns={historyColumns} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No ride history available
                </p>
              )}
            </div>
          </Card>

          {/* Carpool History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Carpool History
              </h3>
              {carpoolHistory && carpoolHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table data={carpoolHistory} columns={carpoolHistoryColumns} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No carpool history available
                </p>
              )}
            </div>
          </Card>

          {/* Transaction History */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Transaction History
              </h3>
              {transactionHistory && transactionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table
                    data={transactionHistory}
                    columns={[
                      {
                        key: "createdAt",
                        label: "Date",
                        render: (val, row) => formatDate(val || row.date),
                      },
                      { key: "description", label: "Description" },
                      {
                        key: "status",
                        label: "Status",
                        render: (val) => (
                          <Badge
                            className="capitalize"
                            variant={val?.toLowerCase() === "success" ? "success" : val?.toLowerCase() === "failed" ? "danger" : "warning"}
                          >
                            {val || "N/A"}
                          </Badge>
                        ),
                      },
                      {
                        key: "amount",
                        label: "Amount",
                        render: (val, row) => (
                          <span
                            className={
                              row.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {row.type === "credit" ? "+" : "-"}${Number(Math.abs(val || 0)).toFixed(2)}
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No transactions found
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={id}
        type="rider"
        initialData={editInitialData}
        onSuccess={refresh}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Rider"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this rider?</p>
              <p className="text-sm text-gray-500 mt-1">
                This action is permanent and cannot be undone. All data associated with this rider will be removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RiderDetail;
