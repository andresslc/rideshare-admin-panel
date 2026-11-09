import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  User, 
  Shield, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle, 
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Navigation,
  DollarSign,
  Clock,
  Info
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { api } from "../lib/services";
import toast from "react-hot-toast";
import { formatDate, formatDateTime, formatPhoneNumber } from "../utils/helpers";

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const response = await api.getReportById(id);
      if (response.success) {
        setReport(response.data);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch report details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  const handleResolveTrigger = () => {
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    try {
      setResolving(true);
      const response = await api.resolveReport(id, adminNote);
      if (response.success) {
        toast.success("Report marked as resolved");
        setIsResolveModalOpen(false);
        setAdminNote("");
        fetchReportDetail();
      }
    } catch (error) {
      toast.error(error.message || "Failed to resolve report");
    } finally {
      setResolving(false);
    }
  };

  const handleUserStatusToggle = async (userId, type, currentStatus) => {
    const userType = type.toLowerCase() === "user" ? "rider" : "driver";
    try {
      const isDeactivated =
        typeof currentStatus === "boolean"
          ? currentStatus
          : currentStatus?.toString().toLowerCase() !== "active";
      const newStatus = isDeactivated ? "active" : "deactivated";
      const response = await api.updateUserStatus(userId, userType, newStatus);
      if (response.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} account ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
        fetchReportDetail();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update account status");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (!report) return (
    <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
      <p className="text-gray-500">Report not found</p>
      <Button onClick={() => navigate("/reports")} className="mt-4">Back to Reports</Button>
    </div>
  );

  const getProfilePath = (type, id) => {
    const routeType = type.toLowerCase() === "user" ? "rider" : "driver";
    return `/user-management/${routeType}/${id}`;
  };

  const InfoSection = ({ title, icon, children, className = "" }) => (
    <Card className={`overflow-hidden border-none shadow-sm h-[50%] ${className}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{title}</h3>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </Card>
  );

  const UserInfoCard = ({ label, info, iconColor }) => {
  if (!info) return null;

  const displayName = info.firstName || info.lastName 
    ? `${info.firstName || ''} ${info.lastName || ''}`.trim() 
    : info.name || "Unknown";

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {info.profilePicture ? (
            <img 
              src={info.profilePicture} 
              alt={displayName} 
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
            />
          ) : (
            <div className={`p-2 rounded-full ${iconColor} bg-opacity-10 shrink-0`}>
              <User className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {label}
            </p>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {displayName}
            </h4>
          </div>
        </div>

        <Badge variant={info.isDeactivatedByAdmin ? "danger" : "success"}>
          {info.isDeactivatedByAdmin ? "Deactivated" : "Active"}
        </Badge>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-5">
        
        {/* Email */}
        <div className="flex items-center text-gray-600 dark:text-gray-400 min-w-0">
          <Mail className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">{info.email}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center text-gray-600 dark:text-gray-400 min-w-0">
          <Phone className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate">{formatPhoneNumber(info.phone) || "—"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={() => navigate(getProfilePath(info.type, info.id))}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Profile
        </Button>

        <Button
          size="sm"
          variant={info.isDeactivatedByAdmin ? "success" : "danger"}
          className="flex-1 text-xs"
          onClick={() =>
            handleUserStatusToggle(
              info.id,
              info.type,
              info.isDeactivatedByAdmin
            )
          }
        >
          {info.isDeactivatedByAdmin ? "Activate" : "Deactivate"}
        </Button>
      </div>
    </div>
  );
};

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate("/reports")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Report Summary</h1>
              <Badge variant={report.status === "resolved" ? "success" : "warning"} className="text-[10px] py-0.5">
                {report.status?.toUpperCase() || "PENDING"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 font-medium tracking-tight">ID: {report.reportId}</p>
          </div>
        </div>
        
          {report.status !== "resolved" && (
            <Button 
              variant="success" 
              onClick={handleResolveTrigger} 
              loading={resolving}
              className="shadow-lg shadow-green-500/20 px-6 py-2.5 font-bold"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark Resolved
            </Button>
          )}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Reason & Content */}
          <InfoSection title="Violation Details / Report Reason" icon={<FileText className="w-5 h-5 text-amber-500" />}>
             <div className="p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                <p className="text-gray-800 dark:text-gray-200 text-lg font-medium leading-relaxed italic">
                  "{report.reportReason || "No specific reason provided."}"
                </p>
             </div>
             <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center text-sm text-gray-500 font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Created: {formatDateTime(report.createdAt)}
                </div>
                {report.resolvedAt && (
                   <div className="flex items-center text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolved: {formatDateTime(report.resolvedAt)}
                   </div>
                )}
             </div>
          </InfoSection>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <UserInfoCard 
                label="Reporter" 
                info={report.reporterInfo} 
                iconColor="text-blue-500" 
             />
             <UserInfoCard 
                label="Reported Individual" 
                info={report.reportedPersonInfo} 
                iconColor="text-rose-500" 
             />
          </div>

          {/* Admin Notes */}

          {report.status == "resolved" && (
          <InfoSection title="Admin Notes" icon={<Info className="w-5 h-5 text-indigo-500" />}>
             <div className="relative group">
                <textarea 
                  disabled={report.status === "resolved"}
                  className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-75"
                  placeholder={report.status === "resolved" ? "No notes added." : "Enter internal notes for this report..."}
                  defaultValue={report.adminNotes || ""}
                />
             </div>
          </InfoSection>
          )}
        </div>
        {/* Right Column - Ride Details */}
        <div className="lg:col-span-4">
          <InfoSection title="Incident Context (Ride)" icon={<Navigation className="w-5 h-5 text-emerald-500" />}>
            {report.relatedDetails ? (
              <div className="space-y-6">
                {/* Status & ID */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ride Status</p>
                      <Badge  variant={report.relatedDetails.rideStatus === "completed" ? "success" : "danger"} className="mt-1 capitalize">
                        {report.relatedDetails.rideStatus}
                      </Badge>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white capitalize mt-1">{report.relatedDetails.rideType}</p>
                   </div>
                </div>

                {/* Locations */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500" />
                      <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-800 my-1" />
                    </div>
                    <div className="pb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-2">
                        {report.relatedDetails.pickupPoint?.placeName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Drop-off Requested</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-2">
                        {report.relatedDetails.dropOffPointRequested?.placeName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Fare</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">${report.relatedDetails.rideFare != null ? Number(report.relatedDetails.rideFare).toFixed(2) : "0.00"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Distance</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {report.relatedDetails.rideDistance ? `${parseFloat(report.relatedDetails.rideDistance).toFixed(2)} km` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Payment Info</p>
                   <div className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                        {report.relatedDetails.paymentMethod?.replace('_', ' ') || "N/A"}
                      </span>
                      <Badge variant={report.relatedDetails.paymentStatus === "completed" ? "success" : "warning"} className="text-[9px]">
                        {report.relatedDetails.paymentStatus?.toUpperCase()}
                      </Badge>
                   </div>
                </div>

                <div className="flex justify-center pt-4">
                  <span className="text-[10px] font-medium text-gray-400 italic">Created on {formatDate(report.relatedDetails.createdAt)}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center px-4">
                <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No ride details associated with this report.</p>
              </div>
            )}
          </InfoSection>
        </div>
      </div>

      {/* Resolve Modal */}
      <Modal 
        isOpen={isResolveModalOpen} 
        onClose={() => setIsResolveModalOpen(false)} 
        title="Resolve Report"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            Please enter any internal notes or findings regarding this report resolution.
          </p>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            maxLength={200}
            className="w-full min-h-[150px] p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="e.g., Violation confirmed. Driver has been issued a formal warning."
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleConfirmResolve} 
              loading={resolving}
              disabled={!adminNote.trim()}
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportDetail;
