import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import {
  MapPin,
  Navigation,
  Clock,
  User,
  ShieldCheck,
  CreditCard,
  XCircle,
  CheckCircle2,
  Car,
  Activity,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Minimize2,
  Search,
  Crosshair,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  ExternalLink,
  ListOrdered,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { api } from "../../lib/services";
import { formatPhoneNumber } from "../../utils/helpers";
import toast from "react-hot-toast";

// ── Default Constants ────────────────────────────────────────────────────────
const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 }; // Fallback Karachi Center

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

const svgToDataUrl = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

// ── Journey Location Kind Enums & Config ─────────────────────────────────────
export const JourneyLocationKind = {
  JOURNEY_LOCATION: "journey_location",
  EVENT_LOCATION: "event_location",
  PICKUP: "pickup",
  DROP_OFF: "drop_off",
  ROUTE_STOP: "route_stop",
  ROUTE_START: "route_start",
  ROUTE_DESTINATION: "route_destination",
};

export const getLocationKindConfig = (kindStr) => {
  const kind = (kindStr || "").toLowerCase().trim();

  switch (kind) {
    case "pickup":
      return {
        key: JourneyLocationKind.PICKUP,
        label: "Pickup",
        color: "#16a34a", // Green
        badgeBg: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800",
        badgeVariant: "success",
        isRoutePoint: true,
      };
    case "route_start":
      return {
        key: JourneyLocationKind.ROUTE_START,
        label: "Route Start",
        color: "#059669", // Emerald Green
        badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        badgeVariant: "success",
        isRoutePoint: true,
      };
    case "drop_off":
    case "dropoff":
      return {
        key: JourneyLocationKind.DROP_OFF,
        label: "Drop-off",
        color: "#dc2626", // Red
        badgeBg: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800",
        badgeVariant: "danger",
        isRoutePoint: true,
      };
    case "route_destination":
      return {
        key: JourneyLocationKind.ROUTE_DESTINATION,
        label: "Route Destination",
        color: "#e11d48", // Rose Red
        badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        badgeVariant: "danger",
        isRoutePoint: true,
      };
    case "route_stop":
      return {
        key: JourneyLocationKind.ROUTE_STOP,
        label: "Route Stop",
        color: "#8b5cf6", // Purple / Violet
        badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        badgeVariant: "primary",
        isRoutePoint: true,
      };
    case "event_location":
      return {
        key: JourneyLocationKind.EVENT_LOCATION,
        label: "Event Location",
        color: "#f59e0b", // Amber
        badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        badgeVariant: "warning",
        isRoutePoint: false,
      };
    case "journey_location":
    default:
      return {
        key: kind || JourneyLocationKind.JOURNEY_LOCATION,
        label: kind ? formatTitleCase(kind) : "Checkpoint",
        color: "#3b82f6", // Blue
        badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        badgeVariant: "info",
        isRoutePoint: false,
      };
  }
};

// ── SVG Pin Generator Helpers ────────────────────────────────────────────────
const getPinSvg = (bgColor, kind) => {
  const normKind = (kind || "").toLowerCase().trim();
  let innerIcon = "";

  if (normKind === "pickup" || normKind === "route_start") {
    // Car / Origin icon
    innerIcon = `<path d="M4 11a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4zm0-5h8M2 13h12M4 13v2M12 13v2" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
  } else if (normKind === "drop_off" || normKind === "dropoff" || normKind === "route_destination") {
    // Finish / Destination Flag
    innerIcon = `<path d="M3 2v12M3 3h9l-2 4 2 4H3" stroke="#b91c1c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (normKind === "route_stop") {
    // Carpool intermediate stop / Waypoint icon
    innerIcon = `<circle cx="8" cy="8" r="5" stroke="#7c3aed" stroke-width="2" fill="none"/><circle cx="8" cy="8" r="2" fill="#7c3aed"/>`;
  } else if (normKind === "event_location") {
    // Event sparkle / star
    innerIcon = `<path d="M8 1.5l1.6 3.5 3.9.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.9-.6z" stroke="#d97706" stroke-width="1.3" fill="#fef3c7"/>`;
  } else {
    // Standard checkpoint / journey location dot
    innerIcon = `<circle cx="8" cy="8" r="4" fill="${bgColor}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
    <defs>
      <filter id="shadow" x="-40%" y="-30%" width="180%" height="170%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="M20 1 C10 1 2 9 2 19 C2 31 20 49 20 49 C20 49 38 31 38 19 C38 9 30 1 20 1 Z" fill="${bgColor}" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="20" cy="19" r="12" fill="#ffffff"/>
      <g transform="translate(12, 11)">
        ${innerIcon}
      </g>
    </g>
  </svg>`;
};

// Helper: Normalize coordinates [lng, lat] or { lat, lng }
const normalizeCoords = (loc) => {
  if (!loc) return null;
  if (loc.location) {
    return normalizeCoords(loc.location);
  }
  if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const lng = Number(loc.coordinates[0]);
    const lat = Number(loc.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  if (Array.isArray(loc) && loc.length >= 2) {
    const lng = Number(loc[0]);
    const lat = Number(loc[1]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  const lat = Number(loc.lat ?? loc.latitude);
  const lng = Number(loc.lng ?? loc.longitude);
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)) {
    return { lat, lng };
  }
  return null;
};

const formatTitleCase = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ── Journey Timeline Enums & Helpers ─────────────────────────────────────────
const getEventIcon = (iconType) => {
  const key = (iconType || "").toLowerCase();
  switch (key) {
    case "vehicle":
    case "car":
    case "ride":
    case "journey":
      return Car;
    case "payment":
    case "card":
    case "money":
    case "dollar":
    case "wallet":
      return CreditCard;
    case "verification":
    case "shield":
    case "otp":
    case "security":
      return ShieldCheck;
    case "cancelled":
    case "cancel":
    case "canceled":
      return XCircle;
    case "completed":
    case "finish":
    case "success":
      return CheckCircle2;
    case "location":
    case "navigation":
    case "pin":
    case "gps":
      return Navigation;
    case "user":
    case "passenger":
    case "driver":
    case "customer":
      return User;
    case "alert":
    case "warning":
    case "error":
      return AlertTriangle;
    case "clock":
    case "time":
      return Clock;
    case "activity":
    default:
      return Activity;
  }
};

const getEventVisuals = (event) => {
  const iconKey = (event?.icon || "").toLowerCase();
  const toneKey = (event?.tone || "").toLowerCase();

  const IconComponent = getEventIcon(iconKey);

  switch (toneKey) {
    case "success":
      return {
        icon: IconComponent,
        color: "#16a34a",
        bgBadge:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
        badgeVariant: "success",
      };
    case "warning":
      return {
        icon: IconComponent,
        color: "#d97706",
        bgBadge:
          "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        badgeVariant: "warning",
      };
    case "danger":
      return {
        icon: IconComponent,
        color: "#dc2626",
        bgBadge:
          "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
        badgeVariant: "danger",
      };
    case "info":
      return {
        icon: IconComponent,
        color: "#0284c7",
        bgBadge:
          "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
        badgeVariant: "info",
      };
    default:
      return {
        icon: IconComponent,
        color: "#64748b",
        bgBadge:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
        badgeVariant: "default",
      };
  }
};

const JourneyTimelineMap = ({ journeyType = "ride", journeyId, className = "" }) => {
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [dialogActivity, setDialogActivity] = useState(null); // Activity opened in Events Dialog
  const [activeMarker, setActiveMarker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapRef = useRef(null);
  const containerRef = useRef(null);

  // Load Google Maps SDK
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Fetch Journey Data
  const fetchJourney = useCallback(async () => {
    if (!journeyId) return;
    try {
      setLoading(true);
      const res = await api.getJourneyTimeline(journeyType, journeyId);
      const data = res?.data || res;
      setJourneyData(data);
    } catch (err) {
      toast.error(err.message || "Failed to load journey timeline.");
    } finally {
      setLoading(false);
    }
  }, [journeyType, journeyId]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  // Extract Timeline Activity Groups & Events
  const { activityGroups, markers, totalEventsCount } = useMemo(() => {
    if (!journeyData) return { activityGroups: [], markers: [], totalEventsCount: 0 };

    const rawTimeline = journeyData.timeline || [];
    let processedGroups = [];
    let count = 0;

    rawTimeline.forEach((group, groupIdx) => {
      const coords = normalizeCoords(group.location);
      const kindConfig = getLocationKindConfig(group.location?.kind);
      const kind = kindConfig.key;
      const color = kindConfig.color;

      const eventsList = (group.events || []).map((ev, evIdx) => {
        count++;
        const visuals = getEventVisuals(ev);
        return {
          ...ev,
          uniqueId: ev.id || `event-${groupIdx}-${evIdx}`,
          activityId: group.id || `act-${groupIdx}`,
          visuals,
          coords,
          locationName: group.location?.name,
          locationKind: group.location?.kind,
        };
      });

      processedGroups.push({
        ...group,
        uniqueId: group.id || `act-${groupIdx}`,
        coords,
        kind,
        kindConfig,
        color,
        events: eventsList,
      });
    });

    // Map Markers from unique coordinates
    const markerMap = new Map();
    processedGroups.forEach((group, idx) => {
      if (group.coords) {
        const key = `${group.coords.lat.toFixed(6)},${group.coords.lng.toFixed(6)}`;
        if (markerMap.has(key)) {
          const existing = markerMap.get(key);
          existing.activities.push(group);
          existing.events.push(...group.events);
        } else {
          markerMap.set(key, {
            id: `marker-${group.uniqueId}`,
            position: group.coords,
            title: group.location?.name || `${group.kindConfig?.label || "Stop"} ${idx + 1}`,
            kind: group.kind,
            kindConfig: group.kindConfig,
            color: group.color,
            recordedAtLabel: group.recordedAtLabel,
            activities: [group],
            events: [...group.events],
          });
        }
      }
    });

    return {
      activityGroups: processedGroups,
      markers: Array.from(markerMap.values()),
      totalEventsCount: journeyData.totalEvents || count,
    };
  }, [journeyData]);

  // Filtered Groups
  const filteredActivityGroups = useMemo(() => {
    return activityGroups
      .map((group) => {
        let matchingEvents = group.events;

        if (categoryFilter !== "all") {
          matchingEvents = matchingEvents.filter((ev) => {
            const cat = (ev.category || "").toLowerCase();
            const icon = (ev.icon || "").toLowerCase();
            const type = (ev.eventType || "").toLowerCase();
            if (categoryFilter === "payment") return cat === "payment" || icon === "payment" || type.includes("payment");
            if (categoryFilter === "verification") return cat === "verification" || icon === "verification" || type.includes("otp");
            if (categoryFilter === "location") return cat === "location" || icon === "location" || type.includes("arrived") || type.includes("coming");
            if (categoryFilter === "journey") return cat === "journey" || icon === "vehicle" || type.includes("started");
            if (categoryFilter === "status") return cat === "status" || type.includes("completed") || type.includes("cancel");
            return true;
          });
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          matchingEvents = matchingEvents.filter((ev) => {
            return (
              (ev.title && ev.title.toLowerCase().includes(q)) ||
              (ev.eventType && ev.eventType.toLowerCase().includes(q)) ||
              (ev.actor?.name && ev.actor.name.toLowerCase().includes(q)) ||
              (group.location?.name && group.location.name.toLowerCase().includes(q))
            );
          });
        }

        return {
          ...group,
          events: matchingEvents,
        };
      })
      .filter((group) => group.events.length > 0 || (searchTerm.trim() === "" && categoryFilter === "all"));
  }, [activityGroups, categoryFilter, searchTerm]);

  // Focus map on coordinates
  const focusOnCoordinates = useCallback((coords, zoom = 16) => {
    if (!coords || !mapRef.current) return;
    mapRef.current.panTo(coords);
    mapRef.current.setZoom(zoom);
  }, []);

  // Fit all markers in view
  const fitAllMarkers = useCallback(() => {
    if (!mapRef.current || !window.google || markers.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend(m.position));
    mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [markers]);

  // Initial Map Load
  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      if (markers.length > 0) {
        if (markers.length === 1) {
          map.setCenter(markers[0].position);
          map.setZoom(15);
        } else {
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach((m) => bounds.extend(m.position));
          map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
        }

        // Default select the first/latest activity checkpoint
        if (activityGroups.length > 0) {
          setSelectedActivityId(activityGroups[0].uniqueId);
        }
      }
    },
    [markers, activityGroups]
  );

  // Focus on an activity checkpoint
  const handleActivityFocus = (group) => {
    setSelectedActivityId(group.uniqueId);
    if (group.coords) {
      focusOnCoordinates(group.coords, 16);
      const matchMarker = markers.find(
        (m) =>
          Math.abs(m.position.lat - group.coords.lat) < 1e-6 &&
          Math.abs(m.position.lng - group.coords.lng) < 1e-6
      );
      if (matchMarker) {
        setActiveMarker(matchMarker);
      }
    } else {
      toast("No GPS coordinates recorded for this activity.", {
        icon: "📍",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary-500"></div>
          <span className="text-sm font-medium">Loading Journey Activities & Map...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        ref={containerRef}
        className={`overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col ${
          isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : ""
        } ${className}`}
        style={
          isFullscreen
            ? { height: "100vh" }
            : { height: "calc(100vh - 210px)", minHeight: "560px" }
        }
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-950/40 text-primary-600 rounded-lg shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {journeyData?.title || "Recent Activity & Timeline"}
                </h2>
                <Badge variant="primary" className="text-xs font-mono">
                  {activityGroups.length} Checkpoints
                </Badge>
                <Badge variant="default" className="text-xs font-mono">
                  {totalEventsCount} Events
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJourney}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh
            </Button>
            {markers.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={fitAllMarkers}
                icon={<Crosshair className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Fit All Stops
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              icon={
                isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )
              }
              className="text-gray-500"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            />
          </div>
        </div>

        {/* Main Body: Full Height Map (Left) + Fixed Scrollable Sidebar (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-gray-50 dark:bg-gray-900">
          {/* Map Pane (Flex-1) */}
          <div className="flex-1 h-full relative border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
            {!isLoaded ? (
              <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {loadError ? "Error loading Google Maps" : "Loading Map..."}
                  </p>
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={markers[0]?.position || DEFAULT_CENTER}
                zoom={14}
                options={MAP_OPTIONS}
                onLoad={onMapLoad}
              >
                {/* Location Checkpoint Markers */}
                {markers.map((marker) => {
                  const pinSvg = getPinSvg(marker.color, marker.kind);
                  const isSelected =
                    activeMarker?.id === marker.id ||
                    marker.activities.some((a) => a.uniqueId === selectedActivityId);

                  return (
                    <Marker
                      key={marker.id}
                      position={marker.position}
                      title={marker.title}
                      icon={{
                        url: svgToDataUrl(pinSvg),
                        scaledSize: new window.google.maps.Size(
                          isSelected ? 46 : 38,
                          isSelected ? 60 : 50
                        ),
                        anchor: new window.google.maps.Point(
                          isSelected ? 23 : 19,
                          isSelected ? 58 : 48
                        ),
                      }}
                      zIndex={isSelected ? 100 : 10}
                      onClick={() => {
                        setActiveMarker(marker);
                        if (marker.activities.length > 0) {
                          setSelectedActivityId(marker.activities[0].uniqueId);
                        }
                      }}
                    />
                  );
                })}

                {/* InfoWindow on Marker Click */}
                {activeMarker && (
                  <InfoWindow
                    position={activeMarker.position}
                    onCloseClick={() => setActiveMarker(null)}
                  >
                    <div className="p-1 max-w-sm text-gray-900">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: activeMarker.color }}
                        />
                        <h4 className="font-bold text-sm leading-tight text-gray-900">
                          {activeMarker.kindConfig?.label || formatTitleCase(activeMarker.kind || "Checkpoint")}
                        </h4>
                        {activeMarker.recordedAtLabel && (
                          <span className="text-[11px] text-gray-500 font-mono ml-auto">
                            {activeMarker.recordedAtLabel}
                          </span>
                        )}
                      </div>
                      {activeMarker.title && (
                        <p className="text-xs text-gray-600 mb-2 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
                          <span>{activeMarker.title}</span>
                        </p>
                      )}

                      {activeMarker.activities.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full text-xs py-1.5"
                            onClick={() => setDialogActivity(activeMarker.activities[0])}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View {activeMarker.events.length} Events at this Stop
                          </Button>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}

            {/* Quick Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 shadow-sm text-xs flex items-center gap-3.5 pointer-events-auto flex-wrap max-w-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-600"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Pickup / Start</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Drop-off / Destination</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Route Stop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Checkpoint</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Event</span>
              </div>
            </div>
          </div>

          {/* Activity Sidebar Pane (Fixed Width, Scrollable inside) */}
          <div className="w-full lg:w-96 xl:w-[420px] h-full flex flex-col bg-white dark:bg-gray-800 shrink-0">
            {/* Sidebar Filter Header */}
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-700 space-y-2.5 bg-gray-50/70 dark:bg-gray-850 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary-600" />
                  Activity Checkpoints ({filteredActivityGroups.length})
                </span>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search checkpoint or place..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                {[
                  { id: "all", label: "All" },
                  { id: "journey", label: "Journey" },
                  { id: "payment", label: "Payments" },
                  { id: "verification", label: "OTP" },
                  { id: "location", label: "Location" },
                  { id: "status", label: "Status" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                      categoryFilter === tab.id
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-200/70 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Activity Checkpoints List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              {filteredActivityGroups.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 space-y-1.5">
                  <Activity className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-medium">No activity checkpoints found</p>
                  <p className="text-xs text-gray-500">Try changing your search or filters.</p>
                </div>
              ) : (
                filteredActivityGroups.map((group) => {
                  const isGroupSelected = selectedActivityId === group.uniqueId;
                  const isPickup = group.kind === "pickup";
                  const isDropoff = group.kind === "drop_off" || group.kind === "dropoff";

                  return (
                    <div
                      key={group.uniqueId}
                      id={`activity-card-${group.uniqueId}`}
                      onClick={() => handleActivityFocus(group)}
                      className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        isGroupSelected
                          ? "bg-primary-50/30 dark:bg-primary-950/20 border-primary-400 dark:border-primary-500 shadow-sm ring-1 ring-primary-400"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      {/* Checkpoint Badge & Recorded Time */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            group.kindConfig?.badgeBg || "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {group.kindConfig?.label || formatTitleCase(group.location?.kind || "Checkpoint")}
                        </span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {group.recordedAtLabel}
                        </span>
                      </div>

                      {/* Location Name */}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mt-2 leading-relaxed">
                        {group.location?.name || "Location checkpoint"}
                      </p>

                      {/* Events Summary Preview (Latest Event Pill) */}
                      {group.events.length > 0 && (
                        <div className="mt-2.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-700/60 text-xs">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1.5 truncate">
                              {(() => {
                                const IconComp = group.events[0]?.visuals?.icon || Activity;
                                return (
                                  <IconComp
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      group.events[0]?.visuals?.badgeVariant === "success"
                                        ? "text-green-600 dark:text-green-400"
                                        : group.events[0]?.visuals?.badgeVariant === "danger"
                                        ? "text-red-600 dark:text-red-400"
                                        : group.events[0]?.visuals?.badgeVariant === "warning"
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-sky-600 dark:text-sky-400"
                                    }`}
                                  />
                                );
                              })()}
                              <span className="truncate">
                                {group.events[0]?.title}
                              </span>
                            </div>
                            {group.events[0]?.status && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 uppercase ${
                                  group.events[0]?.status === "completed"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                    : group.events[0]?.status === "failed"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {formatTitleCase(group.events[0]?.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/70 flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityFocus(group);
                          }}
                          icon={<Crosshair className="w-3.5 h-3.5" />}
                          className="text-xs px-2.5 py-1 h-auto text-gray-600 dark:text-gray-300"
                        >
                          Focus on Map
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDialogActivity(group);
                          }}
                          icon={<Eye className="w-3.5 h-3.5" />}
                          className="text-xs px-3 py-1 h-auto"
                        >
                          View Events ({group.events.length})
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Events Detailed Dialog Modal */}
      {dialogActivity && (
        <Modal
          isOpen={!!dialogActivity}
          onClose={() => setDialogActivity(null)}
          title={
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  dialogActivity.kindConfig?.badgeBg || "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                }`}
              >
                {dialogActivity.kindConfig?.label || formatTitleCase(dialogActivity.location?.kind || "Checkpoint")}
              </span>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                Activity Events ({dialogActivity.events.length})
              </span>
            </div>
          }
          size="lg"
        >
          <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1 pl-1">
            {/* Location Banner */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-gray-900 dark:text-white leading-snug">
                  {dialogActivity.location?.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-gray-500 font-mono text-[11px]">
                  <span>Recorded: {dialogActivity.recordedAtLabel}</span>
                </div>
              </div>
            </div>

            {/* Events Vertical Timeline */}
            <div className="relative pl-9 space-y-4 before:absolute before:inset-y-2 before:left-[15px] before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {dialogActivity.events.map((ev, idx) => {
                const IconComp = ev.visuals.icon;

                return (
                  <div key={ev.uniqueId || idx} className="relative">
                    {/* Timeline Node Icon */}
                    <div
                      className={`absolute -left-[36px] top-3.5 w-7 h-7 rounded-full flex items-center justify-center border shadow-xs ${ev.visuals.bgBadge}`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    {/* Event Card */}
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3 shadow-xs">
                      {/* Event Header with Icon, Title, and Occurred Time */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 border ${ev.visuals.bgBadge}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                              {ev.title}
                            </h4>
                            <span className="text-xs text-gray-400 font-mono shrink-0">
                              {ev.occurredAtLabel}
                            </span>
                          </div>

                          {/* Status Badge */}
                          {ev.status && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  ev.status === "completed"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                    : ev.status === "failed"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {formatTitleCase(ev.status)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actor Information */}
                      {ev.actor && (ev.actor.name || ev.actor.type) && (
                        <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-850 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                          {ev.actor.profilePicture ? (
                            <img
                              src={ev.actor.profilePicture}
                              alt={ev.actor.name}
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                              {ev.actor.type === "driver" ? (
                                <Car className="w-3.5 h-3.5 text-sky-600" />
                              ) : ev.actor.type === "stripe" ? (
                                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                            <span className="text-gray-400 text-[11px] font-medium">Actor:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {ev.actor.name || formatTitleCase(ev.actor.type)}
                            </span>
                            <span className="text-gray-400 text-[11px] capitalize">
                              ({ev.actor.type})
                            </span>
                            {ev.actor.phone && (
                              <span className="text-[11px] text-gray-500 font-mono">
                                {formatPhoneNumber(ev.actor.phone)}
                              </span>
                            )}
                            {ev.actor.vehicleType && (
                              <Badge variant="warning" className="text-[9px] py-0 px-1">
                                {formatTitleCase(ev.actor.vehicleType)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* State Transition Flow */}
                      {ev.transition && (ev.transition.from || ev.transition.to) && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="text-[11px] text-gray-400 font-medium">
                            State Transition:
                          </span>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[11px] text-gray-800 dark:text-gray-200">
                            <span className="capitalize">{ev.transition.from || "—"}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="capitalize font-bold text-primary-600">
                              {ev.transition.to}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Failure Reason */}
                      {ev.reason && (
                        <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span className="font-semibold">
                            {ev.reason.label || formatTitleCase(ev.reason.code)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialogActivity(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleActivityFocus(dialogActivity);
                  setDialogActivity(null);
                }}
                icon={<Crosshair className="w-4 h-4" />}
              >
                Focus this Stop on Map
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default JourneyTimelineMap;
