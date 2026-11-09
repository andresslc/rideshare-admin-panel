import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Car,
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  Navigation,
  Activity,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  Percent,
  Star,
  FileText,
  Tag,
  ListOrdered,
  Layers,
  Sparkles,
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { api } from "../lib/services";
import { formatDateTime, formatDate, formatPhoneNumber } from "../utils/helpers";
import JourneyTimelineMap from "../components/common/JourneyTimelineMap";
import toast from "react-hot-toast";

const fullName = (obj) =>
  [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const formatTitleCase = (str) => {
  if (!str) return "—";
  return String(str)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const statusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "cancelled":
    case "canceled":
      return <Badge variant="danger">Cancelled</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "active":
    case "started":
    case "ongoing":
      return <Badge variant="warning">Ongoing</Badge>;
    case "accepted":
      return <Badge variant="primary">Accepted</Badge>;
    case "arrived":
    case "driver_arrived":
      return <Badge variant="info">Driver Arrived</Badge>;
    case "pending":
      return <Badge variant="default">Pending</Badge>;
    default:
      return <Badge variant="default">{formatTitleCase(status)}</Badge>;
  }
};

const paymentBadge = (status) => {
  if (!status) return <Badge variant="default">—</Badge>;
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
    case "succeeded":
    case "success":
      return <Badge variant="success">{formatTitleCase(status)}</Badge>;
    case "pending":
    case "processing":
      return <Badge variant="warning">{formatTitleCase(status)}</Badge>;
    case "failed":
    case "declined":
    case "cancelled":
    case "canceled":
      return <Badge variant="danger">{formatTitleCase(status)}</Badge>;
    case "refunded":
    case "reversed":
      return <Badge variant="info">{formatTitleCase(status)}</Badge>;
    default:
      return <Badge variant="default">{formatTitleCase(status)}</Badge>;
  }
};

const transactionStatusBadge = (status) => {
  if (!status) return <Badge variant="default">—</Badge>;
  const s = String(status).toLowerCase();
  switch (s) {
    case "paid":
    case "completed":
    case "succeeded":
    case "success":
      return <Badge variant="success">{formatTitleCase(status)}</Badge>;
    case "pending":
    case "processing":
    case "in_escrow":
    case "hold":
    case "held":
      return <Badge variant="warning">{formatTitleCase(status)}</Badge>;
    case "failed":
    case "declined":
    case "cancelled":
    case "canceled":
      return <Badge variant="danger">{formatTitleCase(status)}</Badge>;
    case "refunded":
    case "refund":
    case "partial_refund":
    case "reversed":
      return <Badge variant="info">{formatTitleCase(status)}</Badge>;
    default:
      return <Badge variant="default">{formatTitleCase(status)}</Badge>;
  }
};

const SectionHeading = ({ title, icon: Icon }) => (
  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
    {Icon && <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
    {title}
  </h3>
);

const InfoItem = ({ label, value, valueClass = "" }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
    <span className={`text-sm font-medium text-gray-900 dark:text-white ${valueClass}`}>
      {value !== null && value !== undefined && value !== "" ? value : "—"}
    </span>
  </div>
);

const RideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev");

  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState(null);
  const [activeTab, setActiveTab] = useState(isDev ? "timeline" : "overview"); // "overview" | "timeline"

  const fetchRideDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getRideById(id);
      const data = res?.data || res;
      setRawData(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch ride details.");
      navigate(isDev ? "/dev" : "/private-rides");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, isDev]);

  useEffect(() => {
    fetchRideDetail();
  }, [fetchRideDetail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Handle both { rideDetails: { ... }, offers: [] } and flat object
  const ride = rawData?.rideDetails || rawData;
  const offers = rawData?.offers || ride?.offers || [];
  const transactions = rawData?.transactions || ride?.transactions || [];
  const reviews = rawData?.reviews || ride?.reviews || [];

  if (!ride) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Ride details not found.</p>
        <Button className="mt-4" onClick={() => navigate(isDev ? "/dev" : "/private-rides")}>
          {isDev ? "Back to Dev Hub" : "Go Back"}
        </Button>
      </div>
    );
  }

  const {
    user: rider,
    driver,
    vehicle,
    pickupPoint,
    dropOffPointRequested,
    dropOffPoint,
    rideFare,
    economyRideFare,
    luxuryRideFare,
    driverFare,
    rideStatus,
    paymentStatus,
    paymentMethod,
    rideDistance,
    averageTime,
    rideType,
    specialRequest,
    cancellationReason,
    cancelledBy,
    cancelledAt,
    requestedAt,
    createdAt,
    updatedAt,
    endTime,
  } = ride;

  const pickup = pickupPoint;
  const dropoff = dropOffPointRequested || dropOffPoint;

  const pickupAddress = pickup?.placeName || (typeof pickup === "string" ? pickup : "—");
  const pickupCoords = pickup?.location?.coordinates || pickup?.coordinates || null;

  const dropoffAddress = dropoff?.placeName || (typeof dropoff === "string" ? dropoff : "—");
  const dropoffCoords = dropoff?.location?.coordinates || dropoff?.coordinates || null;

  const tabs = [
    {
      id: "overview",
      label: "Ride Overview",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "timeline",
      label: "Journey & Activity Timeline",
      icon: <Navigation className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(isDev ? "/dev" : "/private-rides")}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="text-gray-500"
          >
            {isDev ? "Back to Dev Hub" : "Back"}
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Private Ride Details
              </h1>
              {statusBadge(rideStatus)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center flex-wrap gap-2">
              <span>
                Ride ID:{" "}
                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                  {ride._id || ride.id}
                </span>
              </span>
              <span>•</span>
              <span>Requested: {formatDateTime(requestedAt || createdAt)}</span>
              {cancelledAt && (
                <>
                  <span>•</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    Cancelled: {formatDateTime(cancelledAt)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRideDetail}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Tabs Navigation (Dev Mode Only) */}
      {isDev && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-[#4338CA] text-[#4338CA] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* OVERVIEW CONTENT (shown when not in dev mode OR when activeTab === "overview") */}
      {(!isDev || activeTab === "overview") && (
        <div className="space-y-6">
          {/* Cancellation Alert Banner if Cancelled */}
          {(rideStatus === "cancelled" || rideStatus === "canceled") && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <h4 className="font-semibold text-rose-900 dark:text-rose-200">
                  Ride Cancelled
                </h4>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-rose-800 dark:text-rose-300 text-xs">
                  <div>
                    <span className="font-medium">Cancelled By: </span>
                    <span className="font-semibold">{formatTitleCase(cancelledBy)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Reason: </span>
                    <span className="font-semibold">{formatTitleCase(cancellationReason)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Cancelled At: </span>
                    <span>{formatDateTime(cancelledAt || updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1 & 2: Trip & Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Overview Card */}
              <Card className="p-6">
                <SectionHeading title="Trip Overview" icon={Navigation} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <InfoItem
                    label="Ride Type"
                    value={
                      <Badge variant="primary" className="capitalize">
                        {rideType || "Private"}
                      </Badge>
                    }
                  />
                  <InfoItem
                    label="Distance"
                    value={
                      rideDistance != null
                        ? `${Number(rideDistance).toFixed(2)} miles`
                        : "—"
                    }
                  />
                  <InfoItem
                    label="Est. Duration"
                    value={averageTime != null ? `${averageTime} min` : "—"}
                  />
                  <InfoItem label="Status" value={statusBadge(rideStatus)} />
                </div>

                {/* Route Stop Points */}
                <div className="space-y-4">
                  {/* Pickup */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                        Pickup Location
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {pickupAddress}
                      </p>
                      {pickupCoords && (
                        <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                          [{pickupCoords[1]?.toFixed(5)}, {pickupCoords[0]?.toFixed(5)}]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="ml-4 w-0.5 h-6 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Dropoff */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
                        Drop-off Location
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                        {dropoffAddress}
                      </p>
                      {dropoffCoords && (
                        <span className="text-[11px] font-mono text-gray-400 block mt-0.5">
                          [{dropoffCoords[1]?.toFixed(5)}, {dropoffCoords[0]?.toFixed(5)}]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Request */}
                {specialRequest && (
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Special Request
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      {specialRequest}
                    </p>
                  </div>
                )}
              </Card>

              {/* Payment & Financial Card */}
              <Card className="p-6">
                <SectionHeading title="Fare & Payment Breakdown" icon={DollarSign} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                  <InfoItem
                    label="Final Ride Fare"
                    value={`$${Number(rideFare || 0).toFixed(2)}`}
                    valueClass="text-lg font-bold text-primary-600 dark:text-primary-400"
                  />
                  <InfoItem
                    label="Driver Fare"
                    value={
                      driverFare != null ? `$${Number(driverFare).toFixed(2)}` : "—"
                    }
                  />
                  <InfoItem
                    label="Payment Method"
                    value={
                      paymentMethod ? (
                        <span className="capitalize">
                          {formatTitleCase(paymentMethod)}
                        </span>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <InfoItem
                    label="Payment Status"
                    value={paymentBadge(paymentStatus)}
                  />
                </div>

                {/* Tier Fare Estimates */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-850 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">
                      Economy Fare Option
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {economyRideFare != null
                        ? `$${Number(economyRideFare).toFixed(2)}`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">
                      Luxury Fare Option
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {luxuryRideFare != null
                        ? `$${Number(luxuryRideFare).toFixed(2)}`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">
                      Requested At
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatDateTime(requestedAt || createdAt)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Driver Offers Table (if any) */}
              {offers.length > 0 && (
                <Card className="p-6">
                  <SectionHeading title={`Driver Offers (${offers.length})`} icon={ListOrdered} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="py-2.5 px-3">Driver</th>
                          <th className="py-2.5 px-3">Offered Fare</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Offer Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {offers.map((offer, idx) => (
                          <tr key={offer._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">
                              {fullName(offer.driver)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-primary-600">
                              ${Number(offer.fare || offer.offeredFare || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant={offer.status === "accepted" ? "success" : "default"}>
                                {offer.status || "Offered"}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500">
                              {formatDateTime(offer.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Transactions (if any) */}
              {transactions.length > 0 && (
                <Card className="p-6">
                  <SectionHeading title={`Transactions (${transactions.length})`} icon={CreditCard} />
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="py-2.5 px-3">Participant</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((tx, idx) => {
                          const uType = (tx?.userType || "").toLowerCase();
                          let txUserName = "—";
                          let txUserRole = tx?.userType ? formatTitleCase(tx.userType) : "User";
                          let txUserImg = null;

                          if (tx?.user && typeof tx.user === "object") {
                            txUserName = fullName(tx.user);
                            txUserRole = uType === "driver" ? "Driver" : "Rider";
                            txUserImg = tx.user.profilePicture || tx.user.profileImage;
                          } else if (uType === "driver" || (driver?._id && String(tx?.user) === String(driver._id))) {
                            txUserName = fullName(driver) || "Driver";
                            txUserRole = "Driver";
                            txUserImg = driver?.profilePicture || driver?.profileImage;
                          } else if (uType === "user" || uType === "rider" || (rider?._id && String(tx?.user) === String(rider._id))) {
                            txUserName = fullName(rider) || "Rider";
                            txUserRole = "Rider";
                            txUserImg = rider?.profilePicture || rider?.profileImage;
                          } else if (tx?.user) {
                            txUserName = `${String(tx.user).substring(0, 8)}...`;
                          }

                          const isDriver = txUserRole === "Driver";

                          return (
                            <tr key={tx._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                                    {txUserImg ? (
                                      <img
                                        src={txUserImg}
                                        alt={txUserName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : isDriver ? (
                                      <Car className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    ) : (
                                      <User className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                      {txUserName}
                                    </p>
                                    <span
                                      className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded ${
                                        isDriver
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                          : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                                      }`}
                                    >
                                      {txUserRole}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                                ${Number(tx.amount || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 capitalize">
                                {formatTitleCase(tx.type || tx.transactionType || "Payment")}
                              </td>
                              <td className="py-2.5 px-3">{transactionStatusBadge(tx.status)}</td>
                              <td className="py-2.5 px-3 text-gray-500">
                                {formatDateTime(tx.createdAt || tx.date)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>

            {/* Col 3: Rider & Driver Profiles */}
            <div className="space-y-6">
              {/* Rider Card */}
              <Card className="p-5">
                <SectionHeading title="Rider Information" icon={User} />
                {rider ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
                        {rider.profilePicture || rider.profileImage ? (
                          <img
                            src={rider.profilePicture || rider.profileImage}
                            alt={fullName(rider)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {fullName(rider)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {rider.rating != null ? Number(rider.rating).toFixed(1) : "0.0"}
                          </span>
                          <span>({rider.reviewsReceived || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{rider.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{rider.phone ? formatPhoneNumber(rider.phone) : "—"}</span>
                      </div>
                      {rider.address && (
                        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {[rider.address, rider.city, rider.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {(rider._id || rider.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          navigate(`/user-management/rider/${rider._id || rider.id}`)
                        }
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        View Rider Profile
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No rider details recorded.</p>
                )}
              </Card>

              {/* Driver & Vehicle Card */}
              <Card className="p-5">
                <SectionHeading title="Driver & Vehicle" icon={Car} />
                {driver ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
                        {driver.profilePicture || driver.profileImage ? (
                          <img
                            src={driver.profilePicture || driver.profileImage}
                            alt={fullName(driver)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {fullName(driver)}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {driver.rating != null ? Number(driver.rating).toFixed(1) : "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{driver.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{driver.phone ? formatPhoneNumber(driver.phone) : "—"}</span>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    {(vehicle || driver.vehicleDetails) && (
                      <div className="bg-gray-50 dark:bg-gray-850 rounded-lg p-3 text-xs space-y-1.5 border border-gray-100 dark:border-gray-700">
                        <div className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-1">
                          <Car className="w-3.5 h-3.5" /> Vehicle Info
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-gray-600 dark:text-gray-400">
                          <span>Make & Model:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {[
                              vehicle?.make || driver.vehicleDetails?.make,
                              vehicle?.model || driver.vehicleDetails?.model,
                            ]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </span>
                          <span>License Plate:</span>
                          <span className="font-mono font-medium text-gray-900 dark:text-white">
                            {vehicle?.licensePlate ||
                              vehicle?.plateNumber ||
                              driver.vehicleDetails?.licensePlateNumber ||
                              "—"}
                          </span>
                          <span>Color / Year:</span>
                          <span className="capitalize text-gray-900 dark:text-white">
                            {[
                              vehicle?.color || driver.vehicleDetails?.color,
                              vehicle?.yearOfManufacture || driver.vehicleDetails?.yearOfManufacture,
                            ]
                              .filter(Boolean)
                              .join(" / ") || "—"}
                          </span>
                        </div>
                      </div>
                    )}

                    {(driver._id || driver.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          navigate(`/user-management/driver/${driver._id || driver.id}`)
                        }
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        View Driver Profile
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-850 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Car className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      No Driver Assigned
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {rideStatus === "cancelled" || rideStatus === "canceled"
                        ? "Ride was cancelled before a driver accepted the offer."
                        : "Looking for nearby drivers..."}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOURNEY TIMELINE & ACTIVITY MAP (Dev Mode Only) */}
      {isDev && activeTab === "timeline" && (
        <div className="space-y-4">
          <JourneyTimelineMap journeyType="ride" journeyId={id} />
        </div>
      )}
    </div>
  );
};

export default RideDetail;
