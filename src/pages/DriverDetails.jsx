// pages/DriverDetails.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/services";
import { formatDate, handleError, maskEmail, maskPhone, formatPhoneNumber } from "../utils/helpers";
import toast from "react-hot-toast";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import EditProfileModal from "../components/common/EditProfileModal";
import {
  ArrowLeft,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ChevronUp,
  Loader2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  CreditCard,
  Pencil,
  MapPin,
} from "lucide-react";
import useGetUserDetails from "../hooks/users/useGetUserDetails";
import { useAuth } from "../contexts/AuthContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusStyles = {
  approved: {
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  pending: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  old: {
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

const StatusPill = ({ status }) => {
  const s = statusStyles[status] || statusStyles.old;
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 capitalize ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const Detail = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className="font-semibold text-gray-800 text-right max-w-[55%] truncate">
      {value || "—"}
    </span>
  </div>
);

const LoadingSpinner = ({ color = "gray" }) => {
  const c = {
    gray: "border-gray-300 border-t-gray-600",
    emerald: "border-emerald-300 border-t-emerald-700",
    white: "border-white/30 border-t-white",
    red: "border-red-300 border-t-red-600",
  };
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full animate-spin border-[1.5px] ${c[color]}`}
    />
  );
};

// ── Image Viewer ─────────────────────────────────────────────────────────────

const ImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const [idx, setIdx] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const reset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };
  const goTo = (i) => {
    setIdx(i);
    reset();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo((idx + 1) % images.length);
      if (e.key === "ArrowLeft")
        goTo((idx - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length]);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(5, Math.max(0.3, z * (e.deltaY < 0 ? 1.1 : 0.9))));
  };
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => {
    setDragging(false);
    setDragStart(null);
  };

  const img = images[idx];

  const ToolBtn = ({ onClick, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
    >
      {children}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "rgba(4,6,14,0.97)" }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-white/30 font-mono tracking-widest uppercase">
            {img.label}
          </span>
          {images.length > 1 && (
            <span className="text-[11px] text-white/20 font-mono">
              {idx + 1}/{images.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ToolBtn
            title="Zoom Out"
            onClick={() =>
              setZoom((z) => Math.max(0.3, +(z - 0.25).toFixed(2)))
            }
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </ToolBtn>
          <button
            onClick={reset}
            className="text-[11px] font-mono text-white/40 bg-white/6 border-0 rounded-md px-2 py-0.5 min-w-[42px] text-center hover:text-white/70 transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolBtn
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </ToolBtn>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolBtn
            title="Rotate Left 90°"
            onClick={() => setRotation((r) => r - 90)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn
            title="Rotate Right 90°"
            onClick={() => setRotation((r) => r + 90)}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </ToolBtn>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ToolBtn title="Close (Esc)" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>
      </div>

      {/* Image Area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
      >
        {images.length > 1 && (
          <button
            onClick={() => goTo((idx - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/8 text-white/70 text-2xl flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            ‹
          </button>
        )}
        <img
          src={img.src}
          alt={img.label}
          draggable={false}
          style={{
            maxWidth: "88vw",
            maxHeight: "74vh",
            objectFit: "contain",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: dragging
              ? "none"
              : "transform 0.2s cubic-bezier(0.34,1.4,0.64,1)",
            borderRadius: 8,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {images.length > 1 && (
          <button
            onClick={() => goTo((idx + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/8 text-white/70 text-2xl flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            ›
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 py-2 shrink-0">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-14 h-9 rounded-lg overflow-hidden transition-all ${i === idx ? "ring-2 ring-white/50 opacity-100" : "opacity-35 hover:opacity-60"}`}
            >
              <img
                src={im.src}
                alt={im.label}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <p className="text-center pb-2 text-[10px] text-white/15 tracking-wide">
        Scroll to zoom · Drag to pan{images.length > 1 ? " · ← → navigate" : ""}{" "}
        · Esc to close
      </p>
    </div>
  );
};

// ── Doc Card ──────────────────────────────────────────────────────────────────

const DocCard = ({ doc, onRespond, isOld }) => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(doc.status);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [imgError, setImgError] = useState({});
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(isOld);

  const docImages = [
    doc.frontImage && !imgError.front
      ? { src: doc.frontImage, label: `${doc.type} — Front` }
      : null,
    doc.backImage && !imgError.back
      ? { src: doc.backImage, label: `${doc.type} — Back` }
      : null,
  ].filter(Boolean);

  const respond = async (status) => {
    if (loading) return;
    const isRejected = status === "rejected";
    if (isRejected && !reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    if (isRejected && reason.trim().length > 150) {
      toast.error("Rejection reason cannot exceed 150 characters.");
      return;
    }
    setLoading(true);
    try {
      const payload = { id: doc._id, status };
      if (isRejected) payload.rejectReason = reason;
      if (doc.type === "vehicleVerification") {
        payload.metadata = {
          vehicleIdentificationNumber: doc.metadata?.vehicleIdentificationNumber || "",
          registrationNumber: doc.metadata?.registrationNumber || "",
        };
      }

      await api.updateDocs([payload], []);
      console.log(payload);
      setLocalStatus(status);
      setShowRejectBox(false);
      toast.success(`Document ${status} successfully.`);
      if (onRespond) onRespond();
    } catch (err) {
      toast.error(err.message || "Failed to update document.");
    } finally {
      setLoading(false);
    }
  };

  const docTypeLabel =
    doc.type
      ?.replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase()) || "Document";

  return (
    <>
      {viewerOpen && docImages.length > 0 && (
        <ImageViewer
          images={docImages}
          initialIndex={viewerIdx}
          onClose={() => setViewerOpen(false)}
        />
      )}
      {showApproveConfirm && (
        <Modal
          isOpen={showApproveConfirm}
          onClose={() => setShowApproveConfirm(false)}
          title="Confirm Approval"
          size="sm"
        >
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to approve <strong className="text-gray-900">{docTypeLabel}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="success"
              loading={loading}
              disabled={loading}
              onClick={() => { setShowApproveConfirm(false); respond("approved"); }}
            >
              Yes, Approve
            </Button>
          </div>
        </Modal>
      )}
      <div
        className={`border rounded-2xl bg-white shadow-sm flex flex-col gap-3 transition-all duration-200 overflow-hidden ${isOld ? "opacity-60 hover:opacity-80" : localStatus === "pending" ? "ring-2 ring-amber-200 border-amber-100" : ""}`}
      >
        {/* Card Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 ${isOld ? "cursor-pointer hover:bg-gray-50/50" : ""}`}
          onClick={isOld ? () => setCollapsed((v) => !v) : undefined}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] text-gray-700 capitalize">
                {docTypeLabel}
              </span>
              {isOld && (
                <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                  Old
                </span>
              )}
              {localStatus === "pending" && !isOld && (
                <span className="text-[11px] px-2.5 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium animate-pulse">
                  Needs Review
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={localStatus} />
            {isOld &&
              (collapsed ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ))}
          </div>
        </div>

        {/* Collapsible Body */}
        {!collapsed && (
          <div className="px-4 pb-4 space-y-3">
            {/* License Verification info removed */}

            {/* Images */}
            <div className="space-y-2">
              {doc.frontImage && (
                <div
                  className="relative group cursor-pointer rounded-xl overflow-hidden"
                  onClick={() => {
                    setViewerIdx(0);
                    setViewerOpen(true);
                  }}
                >
                  {!imgError.front ? (
                    <img
                      src={doc.frontImage}
                      alt="Front"
                      className="w-full h-32 object-cover bg-gray-100"
                      onError={() =>
                        setImgError((p) => ({ ...p, front: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      Image unavailable
                    </div>
                  )}
                  {!imgError.front && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <Maximize className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">
                    Front
                  </span>
                </div>
              )}
              {doc.backImage && (
                <div
                  className="relative group cursor-pointer rounded-xl overflow-hidden"
                  onClick={() => {
                    setViewerIdx(doc.frontImage && !imgError.front ? 1 : 0);
                    setViewerOpen(true);
                  }}
                >
                  {!imgError.back ? (
                    <img
                      src={doc.backImage}
                      alt="Back"
                      className="w-full h-32 object-cover bg-gray-100"
                      onError={() => setImgError((p) => ({ ...p, back: true }))}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      Image unavailable
                    </div>
                  )}
                  {!imgError.back && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <Maximize className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/40 text-white px-1.5 py-0.5 rounded">
                    Back
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            {doc.metadata && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {doc.metadata.licenseNumber && (
                  <Detail
                    label="License #"
                    value={doc.metadata.licenseNumber}
                  />
                )}
                {doc.metadata.expiryDate && (
                  <Detail
                    label="Expiry Date"
                    value={formatDate(doc.metadata.expiryDate)}
                  />
                )}
              </div>
            )}
            {doc.rejectReason && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{doc.rejectReason}</p>
              </div>
            )}
            <p className="text-[11px] text-gray-400">
              Submitted: {formatDate(doc.createdAt)}
            </p>

            {/* Actions — pending shows both, rejected shows approve only, approved shows static label */}
            {!isOld && localStatus !== "approved" && hasPermission('approveDriversVehicles') && (
              <div className="space-y-2 pt-1 border-t border-gray-50">
                {!showRejectBox ? (
                  <div className="flex gap-2">
                    <button
                      disabled={loading}
                      onClick={() => setShowApproveConfirm(true)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {loading ? (
                        <LoadingSpinner color="emerald" />
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Approve</>
                      )}
                    </button>
                    {/* Reject button only shown when pending */}
                    {localStatus === "pending" && (
                      <button
                        disabled={loading}
                        onClick={() => setShowRejectBox(true)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Enter reject reason (required)…"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                      rows={3}
                      value={reason}
                      maxLength={150}
                      onChange={(e) => setReason(e.target.value.slice(0, 150))}
                    />
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Max 150 characters</span>
                      <span className={reason.length >= 150 ? "text-amber-600 font-semibold" : ""}>
                        {reason.length}/150
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRejectBox(false)}
                        className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={loading || !reason.trim() || reason.trim().length > 150}
                        onClick={() => respond("rejected")}
                        className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {loading ? <LoadingSpinner color="white" /> : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Static label for approved docs, or rejected docs if user cannot approve */}
            {!isOld && (localStatus === "approved" || (!hasPermission('approveDriversVehicles') && localStatus === "rejected")) && (
              <div
                className={`text-center text-xs py-1.5 rounded-lg font-medium ${
                  localStatus === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}
              >
                {localStatus === "approved" ? "✓ Approved" : "✕ Rejected"}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ── Vehicle Card ──────────────────────────────────────────────────────────────

const VehicleCard = ({
  vehicle,
  onRespond,
  isLatest = false,
}) => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(vehicle.status);
  const [showReject, setShowReject] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setLocalStatus(vehicle.status);
  }, [vehicle.status]);

  const isOld = vehicle.status === "old";
  const [collapsed, setCollapsed] = useState(isOld);

  const respond = async (status) => {
    if (loading) return;
    const isRejected = status === "rejected";
    if (isRejected && !reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    if (isRejected && reason.trim().length > 150) {
      toast.error("Rejection reason cannot exceed 150 characters.");
      return;
    }
    setLoading(true);
    try {
      const payload = { 
        id: vehicle._id, 
        status, 
        metadata: {
          vehicleIdentificationNumber: vehicle?.vehicleIdentificationNumber || "",
          registrationNumber: vehicle?.registrationNumber || "",
        }
      };
      if (isRejected) payload.rejectReason = reason;

      await api.updateDocs([], [payload]);
      setLocalStatus(status);
      setShowReject(false);
      toast.success(`Vehicle ${status} successfully.`);
      if (onRespond) onRespond();
    } catch (err) {
      toast.error(err.message || "Failed to update vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showApproveConfirm && (
        <Modal
          isOpen={showApproveConfirm}
          onClose={() => setShowApproveConfirm(false)}
          title="Confirm Approval"
          size="sm"
        >
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to approve <strong className="text-gray-900">{vehicle.make} {vehicle.model}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="success"
              loading={loading}
              disabled={loading}
              onClick={() => { setShowApproveConfirm(false); respond("approved"); }}
            >
              Yes, Approve
            </Button>
          </div>
        </Modal>
      )}
      <div
        className={`border rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-200 ${isOld ? "opacity-60 hover:opacity-80" : localStatus === "pending" ? "ring-2 ring-amber-200 border-amber-100" : ""}`}
      >
        <div
          className={`flex items-center justify-between px-4 py-3 ${isOld ? "cursor-pointer hover:bg-gray-50/50" : ""}`}
          onClick={isOld ? () => setCollapsed((v) => !v) : undefined}
        >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize text-[15px] text-gray-700">
                {vehicle.make} {vehicle.model}
              </span>
              {isOld && (
                <span className="text-[11px] px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">
                  Old
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400">
              {vehicle.vehicleType} · {vehicle.color}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={localStatus} />
          {isOld &&
            (collapsed ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ))}
        </div>
      </div>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50">
          <div className="grid grid-cols-2 gap-x-6 bg-gray-50 rounded-xl p-3 mt-3">
            <Detail label="Year" value={vehicle?.yearOfManufacture} />
            <Detail label="Plate #" value={vehicle?.licensePlateNumber} />
            <Detail label="VIN" value={vehicle?.vehicleIdentificationNumber} />
            <Detail label="Region" value={vehicle?.regionOfRegistration} />
            <Detail label="Expiry" value={formatDate(vehicle?.expiryDate)} />
          </div>

          {vehicle.rejectReason && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{vehicle.rejectReason}</p>
            </div>
          )}

          {/* Actions — only the latest vehicle can have actions */}
          {!isOld &&
            isLatest &&
            localStatus !== "approved" &&
            hasPermission("approveDriversVehicles") && (
            <div className="space-y-2 pt-3 border-t border-gray-50 mt-3">
              {!showReject ? (
                <div className="flex gap-2">
                  <button
                    disabled={loading}
                    onClick={() => setShowApproveConfirm(true)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {loading ? (
                      <LoadingSpinner color="emerald" />
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5" /> Approve Vehicle</>
                    )}
                  </button>
                  {localStatus === "pending" && (
                    <button
                      disabled={loading}
                      onClick={() => setShowReject(true)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Vehicle
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    placeholder="Enter reject reason (required)…"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                    rows={3}
                    value={reason}
                    maxLength={150}
                    onChange={(e) => setReason(e.target.value.slice(0, 150))}
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Max 150 characters</span>
                    <span className={reason.length >= 150 ? "text-amber-600 font-semibold" : ""}>
                      {reason.length}/150
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReject(false)}
                      className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={loading || !reason.trim() || reason.trim().length > 150}
                      onClick={() => respond("rejected")}
                      className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {loading ? <LoadingSpinner color="white" /> : "Confirm Reject"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {localStatus !== "pending" && localStatus !== "old" && (
            <div
              className={`text-center text-xs py-1.5 rounded-lg font-medium ${
                localStatus === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              }`}
            >
              {localStatus === "approved" ? "✓ Vehicle Approved" : "✕ Vehicle Rejected"}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};



const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [driverInfo, setDriverInfo] = useState(null);
  const [docs, setDocs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [bulkRejectMode, setBulkRejectMode] = useState(false);
  const [bulkReasons, setBulkReasons] = useState({});
  const [bulkLoading, setBulkLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveAllModalOpen, setApproveAllModalOpen] = useState(false);
  const [rejectAllReason, setRejectAllReason] = useState("");

  const { details: userDetails, loading: userLoading, refresh: refreshUser } = useGetUserDetails(
    id,
    "driver",
  );
  const pInfo = userDetails?.personalInfo;

  const editInitialData = useMemo(
    () => ({
      firstName: userDetails?.fullDetails?.firstName || "",
      lastName: userDetails?.fullDetails?.lastName || "",
      email: pInfo?.email || userDetails?.fullDetails?.email || "",
      subscriptionStatus: userDetails?.fullDetails?.subscriptionStatus || "",
      balance: 0,
    }),
    [userDetails, pInfo],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, vehiclesRes] = await Promise.all([
        api.getDriverDocs(id),
        api.getDriverVehicles(id),
      ]);
      const allDocs = docsRes.data || [];
      const allVehicles = vehiclesRes.data || [];
      setDocs(allDocs);
      setVehicles(allVehicles);

      // Get driver info from the first doc's driver field if available, or from drivers API
      if (allDocs.length > 0 && allDocs[0].driver) {
        // driver field is just an ID string, fetch via drivers list or use params
      }
    } catch (err) {
      toast.error("Failed to load driver application data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Partition docs: show only the latest per type (non-old), everything else is "old"
  const latestDocsByType = {};
  [...docs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((doc) => {
      if (!latestDocsByType[doc.type]) latestDocsByType[doc.type] = doc;
    });
  const latestDocs = Object.values(latestDocsByType);
  const oldDocs = docs.filter(
    (d) => !latestDocs.find((ld) => ld._id === d._id),
  );

  console.log(latestDocs)

  const pendingDocs = latestDocs.filter((d) => d.status === "pending");
  const approvablePendingDocs = pendingDocs; // Allow approval of all documents including licenses

  const getVehicleTime = (v) => {
    if (v?.createdAt) {
      const t = new Date(v.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (v?._id && typeof v._id === "string" && v._id.length >= 8) {
      const t = parseInt(v._id.substring(0, 8), 16) * 1000;
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const timeA = getVehicleTime(a);
      const timeB = getVehicleTime(b);
      if (timeB !== timeA) return timeB - timeA;
      if (b._id && a._id && b._id !== a._id) return b._id > a._id ? 1 : -1;
      return 0;
    });
  }, [vehicles]);

  const latestVehicleId = sortedVehicles[0]?._id;
  const pendingVehicles = sortedVehicles.filter(
    (v) => v._id === latestVehicleId && v.status === "pending"
  );
  const approvableVehicles = pendingVehicles;
  const activeVehicles = vehicles.filter((v) => v.status !== "old");

  const handleApproveAll = async () => {
    if (approvablePendingDocs.length === 0 && approvableVehicles.length === 0)
      return;
    setBulkLoading(true);
    try {
      await api.updateDocs(
        approvablePendingDocs.map((d) => {
          const payload = { id: d._id, status: "approved" };
          if (d.type === "vehicleVerification") {
            payload.metadata = {
              vehicleIdentificationNumber:
                d.metadata?.vehicleIdentificationNumber || "",
              registrationNumber: d.metadata?.registrationNumber || "",
            };
          }
          return payload;
        }),
        approvableVehicles.map((v) => ({
          id: v._id,
          status: "approved",
          metadata: {
            vehicleIdentificationNumber: v?.vehicleIdentificationNumber || "",
            registrationNumber: v?.registrationNumber || "",
          },
        })),
      );
      toast.success("All pending items approved.");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to approve all.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRejectAll = async () => {
    if (!rejectAllReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    if (rejectAllReason.trim().length > 150) {
      toast.error("Rejection reason cannot exceed 150 characters.");
      return;
    }
    setBulkLoading(true);
    try {
      await api.updateDocs(
        approvablePendingDocs.map((d) => ({
          id: d._id,
          status: "rejected",
          rejectReason: rejectAllReason,
        })),
        pendingVehicles.map((v) => ({
          id: v._id,
          status: "rejected",
          rejectReason: rejectAllReason,
        })),
      );
      toast.success("All pending items rejected.");
      setRejectModalOpen(false);
      setRejectAllReason("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to reject all.");
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPending = approvablePendingDocs.length + approvableVehicles.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4338CA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Driver Requests
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={userLoading}
              onClick={() => setEditModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
            {totalPending > 0 && hasPermission('approveDriversVehicles') && (
              <>
                <button
                  disabled={bulkLoading}
                  onClick={() => setApproveAllModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {bulkLoading ? (
                    <LoadingSpinner color="emerald" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Approve All ({totalPending})
                </button>
                <button
                  disabled={bulkLoading}
                  onClick={() => setRejectModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Premium Profile Banner Header */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0px_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
          {/* Gradient Top */}
          <div className="h-36 bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 w-full relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 blur-[80px] rounded-full" />
          </div>

          <div className="px-6 pb-6 pt-4 relative">
            {/* Overlapping Avatar */}
            <div className="absolute -top-16 left-6 w-24 h-24 rounded-2xl border-[4px] border-white shadow-xl bg-gray-50 flex items-center justify-center overflow-hidden z-0 shrink-0">
              {pInfo?.profilePicture ? (
                <img
                  src={pInfo.profilePicture}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-300" />
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 ml-[116px]">
              <div>
                <h1 className="text-[26px] font-bold text-gray-900 leading-none mb-2">
                  {[pInfo?.firstName, pInfo?.lastName].filter(Boolean).join(" ") || "Driver Application"}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                    ID: {id}
                  </p>
                  {pInfo?.status && (
                    <Badge
                      variant={
                        pInfo.status.toLowerCase() === "active"
                          ? "success"
                          : "danger"
                      }
                    >
                      {pInfo.status}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Data Summary Badges (Documents & Vehicles Pending) */}
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-[11px] px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 font-semibold border border-slate-200">
                  {docs.length} Docs Total
                </span>
                {pendingDocs.length > 0 && (
                  <span className="text-[11px] px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3 h-3" /> {pendingDocs.length} Pending
                    Docs
                  </span>
                )}
                {pendingVehicles.length > 0 && (
                  <span className="text-[11px] px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 flex items-center gap-1.5 shadow-sm">
                    <Car className="w-3 h-3" /> {pendingVehicles.length} Pending
                    Vehicles
                  </span>
                )}
              </div>
            </div>

            {/* Quick Contact & Info Pills */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium">
                <Mail className="w-3.5 h-3.5 text-gray-400" />{" "}
                {hasPermission('seeSensitiveData') ? (pInfo?.email || "—") : maskEmail(pInfo?.email || "—")}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium">
                <Phone className="w-3.5 h-3.5 text-gray-400" />{" "}
                {hasPermission('seeSensitiveData') ? (formatPhoneNumber(pInfo?.phone || pInfo?.phoneNumber) || "—") : maskPhone(pInfo?.phone || pInfo?.phoneNumber || "—")}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium">
                <CreditCard  className="w-3.5 h-3.5 text-gray-400" />{" "}
                {userDetails?.fullDetails?.ssn
                  ? userDetails.fullDetails.ssn.replace(/^(\d{3})(\d{2})(\d{4})$/, "$1-$2-$3")
                  : "—"}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />{" "}
                {userDetails?.fullDetails.createdAt
                  ? `Joined ${formatDate(userDetails?.fullDetails.createdAt)}`
                  : "Onboarding"}
              </div>
              {(pInfo?.address || userDetails?.fullDetails?.address) && (
                <div className="flex items-start gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />{" "}
                  <span className="line-clamp-2">{pInfo?.address || userDetails?.fullDetails?.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Documents</h2>
              <p className="text-sm text-gray-500">
                {latestDocs.length} latest · {oldDocs.length} historical
                (collapsed)
              </p>
            </div>
          </div>

          {/* Pending / Active Documents */}
          {latestDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {latestDocs.map((doc) => (
                <DocCard
                  key={doc._id}
                  doc={doc}
                  onRespond={fetchData}
                  isOld={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm">No current documents submitted.</p>
            </div>
          )}

          {/* Old / Historical Documents */}
          {oldDocs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Historical Submissions (collapsed)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {oldDocs.map((doc) => (
                  <DocCard
                    key={doc._id}
                    doc={doc}
                    onRespond={fetchData}
                    isOld={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vehicles Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Vehicles</h2>
              <p className="text-sm text-gray-500">
                {activeVehicles.length} vehicles registered
              </p>
            </div>
          </div>

          {sortedVehicles.length > 0 ? (
            <div className="space-y-4">
              {sortedVehicles.map((v) => (
                <VehicleCard
                  key={v._id}
                  vehicle={v}
                  isLatest={v._id === latestVehicleId}
                  onRespond={fetchData}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-2">
                <Car className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm">No vehicles registered.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={id}
        type="driver"
        initialData={editInitialData}
        onSuccess={refreshUser}
      />

      {/* Approve All Confirmation Modal */}
      <Modal
        isOpen={approveAllModalOpen}
        onClose={() => setApproveAllModalOpen(false)}
        title="Confirm Approve All"
        size="sm"
      >
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to approve all <strong className="text-gray-900">{totalPending}</strong> pending document(s) and vehicle(s)? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setApproveAllModalOpen(false)} disabled={bulkLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            loading={bulkLoading}
            disabled={bulkLoading}
            onClick={() => { setApproveAllModalOpen(false); handleApproveAll(); }}
          >
            Yes, Approve All
          </Button>
        </div>
      </Modal>

      {/* Reject All Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject All Pending Items"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This will reject all <strong>{totalPending}</strong> pending
            document(s) and vehicle(s). Please provide a mandatory rejection
            reason.
          </p>
          <textarea
            value={rejectAllReason}
            onChange={(e) => setRejectAllReason(e.target.value.slice(0, 150))}
            maxLength={150}
            className="w-full min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 outline-none transition-all text-sm"
            placeholder="e.g., Documents are expired or unreadable. Please resubmit."
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Max 150 characters</span>
            <span className={rejectAllReason.length >= 150 ? "text-amber-600 font-semibold" : ""}>
              {rejectAllReason.length}/150
            </span>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectAll}
              loading={bulkLoading}
              disabled={!rejectAllReason.trim() || rejectAllReason.trim().length > 150}
            >
              Confirm Reject All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DriverDetails;
