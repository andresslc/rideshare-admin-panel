import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import {
  Navigation,
  User,
  Phone,
  Car,
  RefreshCw,
  MapPin,
  Users,
  Eye,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { api } from "../lib/services";
import { formatPhoneNumber } from "../utils/helpers";

// ── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL = 10_000; // ms
const ANIMATION_DURATION = 2500; // ms — smooth marker travel time
// Default map center — Orlando, Florida
const DEFAULT_CENTER = { lat: 28.5383, lng: -81.3792 };

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  styles: [
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  ],
};

// ── SVG icons ─────────────────────────────────────────────────────────────
const ECONOMY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="60" height="30">
  <defs>
    <linearGradient id="econBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78909c"/>
      <stop offset="30%" stop-color="#b0bec5"/>
      <stop offset="50%" stop-color="#eceff1"/>
      <stop offset="70%" stop-color="#b0bec5"/>
      <stop offset="100%" stop-color="#78909c"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#374151"/>
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <g transform="translate(200, 0) rotate(90)">
    <g filter="url(#shadow)">
      <!-- Tires -->
      <rect x="12" y="30" width="8" height="24" rx="3" fill="#111"/>
      <rect x="80" y="30" width="8" height="24" rx="3" fill="#111"/>
      <rect x="12" y="140" width="8" height="24" rx="3" fill="#111"/>
      <rect x="80" y="140" width="8" height="24" rx="3" fill="#111"/>
      
      <!-- Main Body -->
      <path d="M 25 20 C 35 5, 65 5, 75 20 L 85 70 L 85 160 C 85 185, 65 195, 50 195 C 35 195, 15 185, 15 160 L 15 70 Z" fill="url(#econBody)"/>
      
      <!-- Windshield -->
      <path d="M 22 75 C 35 60, 65 60, 78 75 L 72 90 C 60 85, 40 85, 28 90 Z" fill="url(#glass)"/>
      
      <!-- Rear Window -->
      <path d="M 28 135 C 40 140, 60 140, 72 135 L 78 145 C 65 155, 35 155, 22 145 Z" fill="url(#glass)"/>
      
      <!-- Roof -->
      <path d="M 28 90 C 40 85, 60 85, 72 90 L 72 135 C 60 140, 40 140, 28 135 Z" fill="#cfd8dc"/>

      <!-- Side Windows -->
      <path d="M 20 80 L 26 95 L 26 130 L 20 140 Z" fill="url(#glass)"/>
      <path d="M 80 80 L 74 95 L 74 130 L 80 140 Z" fill="url(#glass)"/>
      
      <!-- Mirrors -->
      <path d="M 15 78 C 10 78, 10 85, 18 85 Z" fill="#78909c"/>
      <path d="M 85 78 C 90 78, 90 85, 82 85 Z" fill="#78909c"/>
      
      <!-- Headlights -->
      <path d="M 25 22 C 30 18, 35 18, 38 20 L 35 28 C 30 28, 25 26, 22 25 Z" fill="#fef08a"/>
      <path d="M 75 22 C 70 18, 65 18, 62 20 L 65 28 C 70 28, 75 26, 78 25 Z" fill="#fef08a"/>
      
      <!-- Taillights -->
      <path d="M 22 180 C 28 185, 35 185, 38 182 L 35 175 L 20 175 Z" fill="#ef4444"/>
      <path d="M 78 180 C 72 185, 65 185, 62 182 L 65 175 L 80 175 Z" fill="#ef4444"/>
    </g>
  </g>
</svg>`;

const LUXURY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 100" width="68" height="32">
  <defs>
    <linearGradient id="luxBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="20%" stop-color="#1f2937"/>
      <stop offset="50%" stop-color="#374151"/>
      <stop offset="80%" stop-color="#1f2937"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="luxGlass" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <filter id="luxShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <g transform="translate(210, 0) rotate(90)">
    <g filter="url(#luxShadow)">
      <!-- Tires -->
      <rect x="10" y="30" width="10" height="28" rx="3" fill="#000"/>
      <rect x="80" y="30" width="10" height="28" rx="3" fill="#000"/>
      <rect x="10" y="145" width="10" height="28" rx="3" fill="#000"/>
      <rect x="80" y="145" width="10" height="28" rx="3" fill="#000"/>
      
      <!-- Main Body -->
      <path d="M 22 15 C 35 0, 65 0, 78 15 L 88 60 L 88 175 C 88 200, 65 205, 50 205 C 35 205, 12 200, 12 175 L 12 60 Z" fill="url(#luxBody)"/>
      
      <!-- Windshield -->
      <path d="M 20 70 C 35 55, 65 55, 80 70 L 75 85 C 60 80, 40 80, 25 85 Z" fill="url(#luxGlass)"/>
      
      <!-- Panoramic Roof & Rear Window -->
      <path d="M 25 85 C 40 80, 60 80, 75 85 L 75 155 C 60 160, 40 160, 25 155 Z" fill="url(#luxGlass)"/>
      
      <!-- Side Windows -->
      <path d="M 18 75 L 23 88 L 23 150 L 18 160 Z" fill="url(#luxGlass)"/>
      <path d="M 82 75 L 77 88 L 77 150 L 82 160 Z" fill="url(#luxGlass)"/>
      
      <!-- Mirrors -->
      <path d="M 12 73 C 6 73, 6 82, 16 82 Z" fill="#1f2937"/>
      <path d="M 88 73 C 94 73, 94 82, 84 82 Z" fill="#1f2937"/>
      
      <!-- Headlights -->
      <path d="M 22 18 C 28 14, 38 15, 40 18 L 35 25 C 30 25, 24 22, 20 22 Z" fill="#ffffff"/>
      <path d="M 78 18 C 72 14, 62 15, 60 18 L 65 25 C 70 25, 76 22, 80 22 Z" fill="#ffffff"/>
      
      <!-- Taillights -->
      <path d="M 18 190 C 25 195, 38 195, 45 190 L 45 185 L 15 185 Z" fill="#ef4444"/>
      <path d="M 82 190 C 75 195, 62 195, 55 190 L 55 185 L 85 185 Z" fill="#ef4444"/>
      
      <!-- Chrome Trim -->
      <path d="M 40 15 L 60 15" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
      <path d="M 45 195 L 55 195" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

const RIDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs>
    <filter id="rs" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  <g filter="url(#rs)">
    <circle cx="20" cy="20" r="16" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
    <circle cx="20" cy="14" r="5" fill="#ffffff"/>
    <path d="M11 26 Q20 18 29 26 Q29 29 20 29 Q11 29 11 26 Z" fill="#ffffff"/>
  </g>
</svg>`;

const svgToDataUrl = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

// ── Smooth marker animation hook ──────────────────────────────────────────────
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function useSmoothPositions(items, keyExtractor) {
  const [positions, setPositions] = useState({});
  const rafRef = useRef({}); // per-item rAF id
  const currentPos = useRef({}); // per-item latest interpolated position

  // Only cancel all animations on unmount
  useEffect(() => {
    return () => {
      Object.values(rafRef.current).forEach(cancelAnimationFrame);
    };
  }, []);

  useEffect(() => {
    if (!items || !items.length) return;

    items.forEach((item) => {
      const uid = keyExtractor(item);
      const newLat = item.location?.coordinates?.[1];
      const newLng = item.location?.coordinates?.[0];
      if (newLat == null || newLng == null) return;

      const prev = currentPos.current[uid];

      // First time seeing this item — snap immediately
      if (!prev) {
        const pos = { lat: newLat, lng: newLng };
        currentPos.current[uid] = pos;
        setPositions((p) => ({ ...p, [uid]: pos }));
        return;
      }

      // No movement — skip
      if (
        Math.abs(prev.lat - newLat) < 1e-7 &&
        Math.abs(prev.lng - newLng) < 1e-7
      )
        return;

      // Cancel any in-progress animation for this item
      if (rafRef.current[uid]) {
        cancelAnimationFrame(rafRef.current[uid]);
      }

      const startLat = prev.lat;
      const startLng = prev.lng;
      const startTime = performance.now();

      const step = (now) => {
        const t = Math.min((now - startTime) / ANIMATION_DURATION, 1);
        const e = easeInOutCubic(t);
        const lat = startLat + (newLat - startLat) * e;
        const lng = startLng + (newLng - startLng) * e;
        const pos = { lat, lng };

        currentPos.current[uid] = pos;
        setPositions((p) => ({ ...p, [uid]: pos }));

        if (t < 1) {
          rafRef.current[uid] = requestAnimationFrame(step);
        }
      };

      rafRef.current[uid] = requestAnimationFrame(step);
    });
  }, [items, keyExtractor]);

  return positions;
}

// ── Custom FlyTo Animation ──────────────────────────────────────────────────
const flyToMap = (map, targetPos, targetZoom = 16, duration = 1500) => {
  if (!map || !targetPos) return;
  const startCenter = map.getCenter();
  if (!startCenter) {
    map.panTo(targetPos);
    map.setZoom(targetZoom);
    return;
  }

  const startZoom = map.getZoom();
  const startLat = startCenter.lat();
  const startLng = startCenter.lng();
  const targetLat = targetPos.lat;
  const targetLng = targetPos.lng;

  const startTime = performance.now();

  const animate = (now) => {
    const t = Math.min((now - startTime) / duration, 1);
    const e = easeInOutCubic(t);

    map.setCenter({
      lat: startLat + (targetLat - startLat) * e,
      lng: startLng + (targetLng - startLng) * e,
    });
    map.setZoom(startZoom + (targetZoom - startZoom) * e);

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
};

// ── Status Mapping Helper ───────────────────────────────────────────────────
const getStatusInfo = (rawStatus) => {
  if (!rawStatus) {
    return {
      category: "idle",
      label: "Idle",
      dotBg: "bg-gray-400",
      textColor: "text-gray-500",
      badgeVariant: "default",
    };
  }
  const s = String(rawStatus).toLowerCase().trim().replace(/_/g, "-");
  if (s === "requested") {
    return {
      category: "requested",
      label: "Requested",
      dotBg: "bg-amber-500",
      textColor: "text-amber-600",
      badgeVariant: "warning",
    };
  }
  if (s === "accepted") {
    return {
      category: "accepted",
      label: "Accepted",
      dotBg: "bg-green-500",
      textColor: "text-green-600",
      badgeVariant: "success",
    };
  }
  if (s === "arrived" || s === "in-progress" || s === "inprogress" || s === "coming") {
    return {
      category: "on-trip",
      label: "On Trip",
      dotBg: "bg-blue-500",
      textColor: "text-blue-600",
      badgeVariant: "info",
    };
  }
  // completed, cancelled, canceled, expired, null / empty
  return {
    category: "idle",
    label: "Idle",
    dotBg: "bg-gray-400",
    textColor: "text-gray-500",
    badgeVariant: "default",
  };
};

// ── Driver sidebar card ───────────────────────────────────────────────────────
const DriverCard = React.memo(({ driver, isSelected, onLocate, onView }) => {
  const name =
    [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "Unknown";
  const isLuxury = driver?.vehicleType?.toLowerCase() === "luxury";
  const isOnTrip = !!driver?.activeRideId;

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${isSelected
          ? "border-primary-400 bg-primary-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {driver?.profilePicture ? (
              <img
                src={driver.profilePicture}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {/* Status dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnTrip ? "bg-blue-500" : "bg-green-500"
              }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" />
            {driver?.phone ? formatPhoneNumber(driver.phone) : "—"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge
              variant={isLuxury ? "warning" : "success"}
              className="text-[10px] px-1.5 py-0.5"
            >
              {isLuxury ? "✦ Luxury" : "Economy"}
            </Badge>
            <Badge
              variant={isOnTrip ? "info" : "success"}
              className="text-[10px] px-1.5 py-0.5"
            >
              {isOnTrip ? "On Trip" : "Available"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          icon={<Navigation className="w-3.5 h-3.5" />}
          onClick={() => onLocate(driver)}
        >
          Locate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => onView(driver)}
        >
          Details
        </Button>
      </div>
    </div>
  );
});
DriverCard.displayName = "DriverCard";

// ── Rider sidebar card ────────────────────────────────────────────────────────
const RiderCard = React.memo(({ rider, isSelected, onLocate, onView }) => {
  const name =
    [rider?.firstName, rider?.lastName].filter(Boolean).join(" ") || "Unknown";
  const rawStatus = rider?.rideStatus || rider?.status;
  const statusInfo = getStatusInfo(rawStatus);

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${isSelected
          ? "border-primary-400 bg-primary-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {rider?.profilePicture ? (
              <img
                src={rider.profilePicture}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {/* Status dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusInfo.dotBg}`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" />
            {rider?.phone ? formatPhoneNumber(rider.phone) : "—"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge
              variant={statusInfo.badgeVariant}
              className="text-[10px] px-1.5 py-0.5"
            >
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          icon={<Navigation className="w-3.5 h-3.5" />}
          onClick={() => onLocate(rider)}
        >
          Locate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => onView(rider)}
        >
          Details
        </Button>
      </div>
    </div>
  );
});
RiderCard.displayName = "RiderCard";

// ── Driver detail modal ───────────────────────────────────────────────────────
const DriverDetailModal = ({ driver, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!driver) return null;

  const name =
    [driver?.firstName, driver?.lastName].filter(Boolean).join(" ") || "—";
  const vd = driver?.vehicleDetails;
  const isLuxury = driver?.vehicleType?.toLowerCase() === "luxury";
  const isOnTrip = !!driver?.activeRideId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Driver Details" size="sm">
      <div className="space-y-4">
        {/* Profile row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
            {driver?.profilePicture ? (
              <img
                src={driver.profilePicture}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              {driver?.phone ? formatPhoneNumber(driver.phone) : "—"}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={isLuxury ? "warning" : "success"}>
                {isLuxury ? "✦ Luxury" : "Economy"}
              </Badge>
              <Badge variant={isOnTrip ? "info" : "success"}>
                {isOnTrip ? "On Trip" : "Available"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Vehicle details */}
        {vd && (
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-sm border border-gray-100">
            <p className="font-semibold text-gray-700 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Car className="w-4 h-4" /> Vehicle Details
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-gray-600 text-sm">
              <span className="font-medium text-gray-500">Make</span>
              <span>{vd?.make || "—"}</span>
              <span className="font-medium text-gray-500">Model</span>
              <span>{vd?.model || "—"}</span>
              <span className="font-medium text-gray-500">Year</span>
              <span>{vd?.yearOfManufacture || "—"}</span>
              <span className="font-medium text-gray-500">Color</span>
              <span className="capitalize">{vd?.color || "—"}</span>
              <span className="font-medium text-gray-500">Plate</span>
              <span>{vd?.licensePlateNumber || "—"}</span>
              <span className="font-medium text-gray-500">Doc Status</span>
              <span>
                <Badge
                  variant={vd?.status === "approved" ? "success" : "warning"}
                  className="text-xs"
                >
                  {vd?.status || "—"}
                </Badge>
              </span>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-gray-50 rounded-xl p-3 text-sm border border-gray-100">
          <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Current Location
          </p>
          <p className="text-gray-700 font-mono text-xs">
            {driver?.location?.coordinates?.[1]?.toFixed(6) ?? "—"},{" "}
            {driver?.location?.coordinates?.[0]?.toFixed(6) ?? "—"}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              if (driver?.id) navigate(`/user-management/driver/${driver.id}`);
            }}
          >
            Full Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ── Rider detail modal ────────────────────────────────────────────────────────
const RiderDetailModal = ({ rider, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!rider) return null;

  const name =
    [rider?.firstName, rider?.lastName].filter(Boolean).join(" ") || "—";
  const rawStatus = rider?.rideStatus || rider?.status;
  const statusInfo = getStatusInfo(rawStatus);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rider Details" size="sm">
      <div className="space-y-4">
        {/* Profile row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
            {rider?.profilePicture ? (
              <img
                src={rider.profilePicture}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              {rider?.phone ? formatPhoneNumber(rider.phone) : "—"}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={statusInfo.badgeVariant}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Pickup Info */}
        <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-sm border border-gray-100">
          <p className="font-semibold text-gray-700 flex items-center gap-1.5 text-xs uppercase tracking-wide">
            <MapPin className="w-4 h-4" /> Pickup Details
          </p>
          <div className="text-gray-600 text-sm">
            <p>
              <span className="font-medium text-gray-500 mr-2">Place: </span>
              {rider?.pickupPlaceName || "—"}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-50 rounded-xl p-3 text-sm border border-gray-100">
          <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Current Location
          </p>
          <p className="text-gray-700 font-mono text-xs">
            {rider?.location?.coordinates?.[1]?.toFixed(6) ?? "—"},{" "}
            {rider?.location?.coordinates?.[0]?.toFixed(6) ?? "—"}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              if (rider?.id) navigate(`/user-management/rider/${rider.id}`);
            }}
          >
            Full Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const BirdsEyeView = () => {
  const [data, setData] = useState({ drivers: [], riders: [], totalDrivers: 0, totalRiders: 0 });
  const [activeTab, setActiveTab] = useState("drivers");
  const [loading, setLoading] = useState(true);
  const [liveTime, setLiveTime] = useState(new Date());
  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [search, setSearch] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const mapRef = useRef(null);
  const pollRef = useRef(null);

  // Load Google Maps SDK
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Build icon objects once after SDK is ready
  const icons = useMemo(() => {
    if (!isLoaded || !window.google) return null;
    return {
      economy: {
        url: svgToDataUrl(ECONOMY_SVG),
        scaledSize: new window.google.maps.Size(60, 30),
        anchor: new window.google.maps.Point(30, 15),
      },
      luxury: {
        url: svgToDataUrl(LUXURY_SVG),
        scaledSize: new window.google.maps.Size(68, 32),
        anchor: new window.google.maps.Point(34, 16),
      },
      rider: {
        url: svgToDataUrl(RIDER_SVG),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      },
    };
  }, [isLoaded]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const res = await api.getBirdsEyeView();
      if (res?.data) {
        if (res.data.drivers !== undefined || res.data.riders !== undefined) {
          setData({
            drivers: res.data.drivers || [],
            riders: res.data.riders || [],
            totalDrivers: res.data.totalDrivers || 0,
            totalRiders: res.data.totalRiders || 0
          });
        } else {
          setData({ drivers: Array.isArray(res.data) ? res.data : [], riders: [], totalDrivers: 0, totalRiders: 0 });
        }
      }
    } catch (_e) {
      // Keep existing data on poll failure; silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchData]);

  // Live clock — ticks every second independently of polling
  useEffect(() => {
    const clockRef = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(clockRef);
  }, []);

  const { drivers, riders } = useMemo(() => {
    const d = (data.drivers || []).map((item, i) => ({
      ...item,
      _type: "drivers",
      _uid: `drivers-${item.id}-${item.activeRideId || i}`,
    }));
    const r = (data.riders || []).map((item, i) => ({
      ...item,
      _type: "riders",
      _uid: `riders-${item.id}-${item.activeRideId || i}`,
    }));
    return { drivers: d, riders: r };
  }, [data]);

  const activeItems = activeTab === "drivers" ? drivers : riders;
  const allItems = useMemo(() => [...drivers, ...riders], [drivers, riders]);

  const keyExtractor = useCallback((item) => item._uid, []);
  const smoothPositions = useSmoothPositions(allItems, keyExtractor);

  const handleLocate = useCallback(
    (item) => {
      const pos = smoothPositions[item._uid];
      if (!pos || !mapRef.current) return;

      flyToMap(mapRef.current, pos, 16, 1500);

      setSelectedId(item.id);
    },
    [smoothPositions]
  );

  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    flyToMap(mapRef.current, DEFAULT_CENTER, 13, 1500);
  }, []);

  const filteredItems = useMemo(
    () =>
      (Array.isArray(activeItems) ? activeItems : []).filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const name = [item?.firstName, item?.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const phone = (item?.phone || "").toLowerCase();
        if (item?._type === "drivers") {
          const vType = (item?.vehicleType || "").toLowerCase();
          const dStatus = item?.activeRideId ? "on trip" : "available";
          return (
            name.includes(q) ||
            phone.includes(q) ||
            vType.includes(q) ||
            dStatus.includes(q)
          );
        }
        const rawStatus = item?.rideStatus || item?.status;
        const statusInfo = getStatusInfo(rawStatus);
        return (
          name.includes(q) ||
          phone.includes(q) ||
          statusInfo?.label?.toLowerCase().includes(q)
        );
      }),
    [activeItems, search]
  );

  // Driver vehicle statistics breakdown
  const driverStats = useMemo(() => {
    const rawDrivers = Array.isArray(data?.drivers) ? data.drivers : [];
    const economy = rawDrivers.filter(
      (d) => d?.vehicleType?.toLowerCase() !== "luxury"
    ).length;
    const luxury = rawDrivers.length - economy;
    const onTrip = rawDrivers.filter((d) => !!d?.activeRideId).length;
    return { economy, luxury, onTrip, total: rawDrivers.length };
  }, [data]);

  // Rider status statistics breakdown
  const riderStats = useMemo(() => {
    const counts = { idle: 0, requested: 0, accepted: 0, onTrip: 0 };
    const rawRiders = Array.isArray(data?.riders) ? data.riders : [];
    rawRiders.forEach((r) => {
      const rawStatus = r?.rideStatus || r?.status;
      const info = getStatusInfo(rawStatus);
      if (info?.category === "requested") counts.requested++;
      else if (info?.category === "accepted") counts.accepted++;
      else if (info?.category === "on-trip") counts.onTrip++;
      else counts.idle++;
    });
    return counts;
  }, [data]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500 space-y-2">
          <MapPin className="w-10 h-10 mx-auto opacity-50" />
          <p className="font-semibold">Failed to load Google Maps</p>
          <p className="text-sm text-gray-500">
            Please check your <code>VITE_GOOGLE_MAPS_API_KEY</code> environment
            variable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="-m-6 flex overflow-hidden"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* ── Map ─────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        {!isLoaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-3">
            <div className="w-9 h-9 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">Loading map…</p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={13}
            options={MAP_OPTIONS}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {icons &&
              allItems.map((item) => {
                const pos = smoothPositions[item._uid];
                if (!pos) return null;

                const isVisible = activeTab === item._type;

                let iconToUse;
                if (item._type === "drivers") {
                  iconToUse = item.vehicleType?.toLowerCase() === "luxury" ? icons.luxury : icons.economy;
                } else {
                  iconToUse = icons.rider;
                }

                return (
                  <Marker
                    key={item._uid}
                    position={pos}
                    visible={isVisible}
                    icon={iconToUse}
                    title={
                      [item.firstName, item.lastName]
                        .filter(Boolean)
                        .join(" ") || (item._type === "drivers" ? "Driver" : "Rider")
                    }
                    zIndex={selectedId === item.id ? 100 : 1}
                    onClick={() => {
                      if (!isVisible) return;
                      setSelectedId(item.id);
                      setDetailItem(item);
                    }}
                  />
                );
              })}
          </GoogleMap>
        )}

        {/* Top-left overlay pills */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none select-none">
          {/* Live + clock */}
          <div className="bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-medium text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            Live
            <span className="text-gray-400">
              · {liveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          {/* Online count */}
          <div className="bg-white rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 text-xs font-medium text-gray-700">
            <Users className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            {activeItems.length} online
          </div>
        </div>

        {/* Recenter button */}
        <button
          className="absolute left-3 bottom-28 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          onClick={handleRecenter}
          title="Center on default location"
        >
          <MapPin className="w-4.5 h-4.5 text-primary-600" />
        </button>

        {/* Manual refresh */}
        <button
          className="absolute left-3 bottom-16 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          onClick={fetchData}
          title="Refresh now"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Birds Eye View</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              Auto-refresh 10s
            </span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "drivers"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => {
                setActiveTab("drivers");
                setSelectedId(null);
                setDetailItem(null);
                handleRecenter();
              }}
            >
              Drivers ({data.totalDrivers || data.drivers.length})
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "riders"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => {
                setActiveTab("riders");
                setSelectedId(null);
                setDetailItem(null);
                handleRecenter();
              }}
            >
              Riders ({data.totalRiders || data.riders.length})
            </button>
          </div>

          {/* Quick stats */}
          {activeTab === "drivers" ? (
            <div className="flex gap-2 mt-2.5">
              <div className="flex-1 bg-green-50 rounded-lg px-2.5 py-1.5 text-center border border-green-100">
                <p className="text-xs text-green-600 font-medium">Economy</p>
                <p className="text-lg font-bold text-green-700">{driverStats.economy}</p>
              </div>
              <div className="flex-1 bg-amber-50 rounded-lg px-2.5 py-1.5 text-center border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Luxury</p>
                <p className="text-lg font-bold text-amber-700">{driverStats.luxury}</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg px-2.5 py-1.5 text-center border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="text-lg font-bold text-blue-700">{driverStats.total}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 mt-2.5">
              <div className="bg-gray-50 rounded-lg p-1.5 text-center border border-gray-200">
                <p className="text-[10px] text-gray-500 font-medium truncate">Idle</p>
                <p className="text-sm font-bold text-gray-700">{riderStats.idle}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-1.5 text-center border border-amber-100">
                <p className="text-[10px] text-amber-600 font-medium truncate">Req.</p>
                <p className="text-sm font-bold text-amber-700">{riderStats.requested}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-1.5 text-center border border-green-100">
                <p className="text-[10px] text-green-600 font-medium truncate">Acc.</p>
                <p className="text-sm font-bold text-green-700">{riderStats.accepted}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-1.5 text-center border border-blue-100">
                <p className="text-[10px] text-blue-600 font-medium truncate">Trip</p>
                <p className="text-sm font-bold text-blue-700">{riderStats.onTrip}</p>
              </div>
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or status…"
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Legend */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          {activeTab === "drivers" ? (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-green-50 border border-green-100 rounded-full px-2.5 py-1 text-[11px] font-medium text-green-700">
                <span className="w-2 h-2 rounded-sm bg-green-500 flex-shrink-0" />
                Economy
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[11px] font-medium text-amber-700">
                <span className="w-2 h-2 rounded-sm bg-amber-500 flex-shrink-0" />
                Luxury
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 text-[11px] font-medium text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                On Trip
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                Available
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 whitespace-nowrap bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                Idle
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 text-[10px] font-medium text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                Requested
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap bg-green-50 border border-green-100 rounded-full px-2 py-0.5 text-[10px] font-medium text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                Accepted
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 text-[10px] font-medium text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                On Trip
              </span>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {loading ? (
            // Skeleton
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-gray-100 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="h-7 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-7 bg-gray-100 rounded-lg flex-1" />
                </div>
              </div>
            ))
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
              <Car className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-500">
                {search ? "No matches found" : `No active ${activeTab}`}
              </p>
              {search && (
                <button
                  className="mt-2 text-xs text-primary-500 hover:underline"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              return activeTab === "drivers" ? (
                <DriverCard
                  key={item._uid}
                  driver={item}
                  isSelected={selectedId === item.id}
                  onLocate={handleLocate}
                  onView={(d) => {
                    setDetailItem(d);
                    setSelectedId(d.id);
                  }}
                />
              ) : (
                <RiderCard
                  key={item._uid}
                  rider={item}
                  isSelected={selectedId === item.id}
                  onLocate={handleLocate}
                  onView={(r) => {
                    setDetailItem(r);
                    setSelectedId(r.id);
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modals */}
      {activeTab === "drivers" ? (
        <DriverDetailModal
          driver={detailItem}
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
        />
      ) : (
        <RiderDetailModal
          rider={detailItem}
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  );
};

export default BirdsEyeView;
