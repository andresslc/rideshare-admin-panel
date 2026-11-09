import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, MapPin, User, Car, Clock, Star, Phone, Mail, 
  Calendar, DollarSign, CheckCircle2, Navigation, Activity, FileText, Sparkles 
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { api } from "../lib/services";
import { formatDateTime, formatPhoneNumber } from "../utils/helpers";
import JourneyTimelineMap from "../components/common/JourneyTimelineMap";
import toast from "react-hot-toast";

const fullName = (obj) => [obj?.firstName, obj?.lastName].filter(Boolean).join(" ") || "—";

const statusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "active":
    case "started":
      return <Badge variant="warning">Active</Badge>;
    case "full":
      return <Badge variant="primary">Full</Badge>;
    case "pending":
      return <Badge variant="default">Pending</Badge>;
    default:
      return <Badge variant="default">{status || "—"}</Badge>;
  }
};

const formatMinutes = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined) return "—";
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const SectionHeading = ({ title, icon: Icon }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
    {Icon && <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
    {title}
  </h3>
);

const InfoItem = ({ label, value, valueClass = "" }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-sm font-medium text-gray-900 dark:text-white ${valueClass}`}>
      {value !== null && value !== undefined ? value : "—"}
    </span>
  </div>
);

const CarpoolRideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDev = location.pathname.startsWith("/dev");

  const [loading, setLoading] = useState(true);
  const [rideData, setRideData] = useState(null);
  const [activeTab, setActiveTab] = useState(isDev ? "timeline" : "overview");

  useEffect(() => {
    fetchRideDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRideDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getCarpoolRideById(id);
      setRideData(res.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch carpool ride details.");
      navigate(isDev ? "/dev" : "/carpool-rides");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4338CA]"></div>
      </div>
    );
  }

  if (!rideData || !rideData.carpoolDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Ride details not found.</p>
        <Button className="mt-4" onClick={() => navigate(isDev ? "/dev" : "/carpool-rides")}>
          {isDev ? "Back to Dev Hub" : "Go Back"}
        </Button>
      </div>
    );
  }

  const { carpoolDetails: ride, carpoolBookingDetails: bookings } = rideData;
  const { driver, startingPoint, destination, routes, vehicleDetails } = ride;

  const totalCompletedFare = (bookings || [])
    .filter((b) => b.status?.toLowerCase() === "completed")
    .reduce((sum, b) => sum + (b.fareCharged || 0), 0);

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
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(isDev ? "/dev" : "/carpool-rides")}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="text-gray-500"
        >
          {isDev ? "Back to Dev Hub" : "Back"}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Carpool Ride Details
            {statusBadge(ride.status)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ride ID: <span className="font-mono">{ride._id}</span>
          </p>
        </div>
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

      {(!isDev || activeTab === "overview") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ride Info & Route */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <SectionHeading title="Trip Overview" icon={Activity} />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <InfoItem label="Distance" value={ride.distance ? `${ride.distance.toFixed(2)} km` : "—"} />
              <InfoItem label="Est. Time" value={formatMinutes(ride.avgTime)} />
              <InfoItem label="Passengers" value={`${ride.maxPassengers - ride.availableSeats} / ${ride.maxPassengers} Booked`} />
              <InfoItem label="Total Fare" value={`$${totalCompletedFare.toFixed(2)}`} />
              <InfoItem label="Created At" value={ride.createdAt ? formatDateTime(ride.createdAt) : "—"} />
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <MapPin className="w-48 h-48" />
            </div>
            <SectionHeading title="Route Details" icon={Navigation} />
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              
              {/* Starting Point */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-[#4338CA] border-4 border-white dark:border-gray-800 z-10" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Pickup Location</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{startingPoint?.placeName || "—"}</p>
              </div>

              {/* Waypoints */}
              {routes && routes.slice(1, -1).map((stop, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 z-10" />
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Stop {idx + 1}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stop.placeName || "—"}</p>
                </div>
              ))}

              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-red-500 border-4 border-white dark:border-gray-800 z-10" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Dropoff Location</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{destination?.placeName || "—"}</p>
              </div>

            </div>
          </Card>

          {/* Bookings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Passenger Bookings ({bookings?.length || 0})</h3>
            
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking._id} className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                          {booking.passenger?.profilePicture ? (
                            <img src={booking.passenger.profilePicture} alt="Passenger" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400 m-2.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {fullName(booking.passenger)}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {booking.passenger?.rating != null ? Number(booking.passenger.rating).toFixed(2) : "New"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(booking.status)}
                        <Badge variant="outline">{booking.requiredSeats} Seat(s)</Badge>
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${booking.fareCharged?.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            ${(booking.fareCharged / (booking.requiredSeats || 1)).toFixed(2)} / seat
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Pickup Stop</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                          {booking.pickupStop?.placeName || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dropoff Stop</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                          {booking.dropOffStop?.placeName || "—"}
                        </p>
                      </div>
                      <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> {booking.paymentMethod?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {booking.paymentStatus?.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Booked: {formatDateTime(booking.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No bookings found for this ride yet.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Driver & Vehicle */}
        <div className="space-y-6">
          <Card className="p-6">
            <SectionHeading title="Driver Information" icon={User} />
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                {driver?.profilePicture ? (
                  <img src={driver.profilePicture} alt="Driver" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{fullName(driver)}</h4>
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{driver?.rating != null ? Number(driver.rating).toFixed(2) : "No rating"}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 break-all">{driver?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{driver?.phone ? formatPhoneNumber(driver.phone) : "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 border-gray-200 dark:border-gray-700">
            <SectionHeading title="Vehicle Details" icon={Car} />
            {ride?.driver?.vehicleDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500">Make & Model</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {ride.driver.vehicleDetails.make} {ride.driver.vehicleDetails.model}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500">License Plate</span>
                  <Badge variant="outline" className="font-mono">{ride.driver.vehicleDetails.licensePlateNumber}</Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500">Color / Year</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {ride.driver.vehicleDetails.color} / {ride.driver.vehicleDetails.yearOfManufacture}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Class</span>
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {ride.driver.vehicleDetails.vehicleType}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">No vehicle details available</p>
            )}
          </Card>
        </div>
      </div>
      )}

      {/* TAB 2: JOURNEY TIMELINE & ACTIVITY MAP (Dev Mode Only) */}
      {isDev && activeTab === "timeline" && (
        <div className="space-y-4">
          <JourneyTimelineMap journeyType="carpool" journeyId={id} />
        </div>
      )}
    </div>
  );
};

export default CarpoolRideDetail;
