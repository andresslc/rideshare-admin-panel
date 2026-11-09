import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  CheckCircle2,
  Edit2,
  Globe,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X as XIcon,
  XCircle,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/global/ConfirmModal";
import { FLORIDA_CITIES } from "../config/constants";
import { formatPercent } from "../utils/helpers";
import useRideRatesActions from "../hooks/ride-rates/useRideRatesActions";
import useDebounce from "../hooks/global/useDebounce";

// Standard 5 mileage brackets required for city-based pricing
const DEFAULT_CITY_BRACKETS = [
  { minMiles: 0, maxMiles: 4, price: 10 },
  { minMiles: 5, maxMiles: 9, price: 15 },
  { minMiles: 10, maxMiles: 15, price: 20 },
  { minMiles: 16, maxMiles: 20, price: 25 },
  { minMiles: 21, maxMiles: null, price: 30 },
];

const RIDE_TYPE_ORDER = {
  economy: 1,
  luxury: 2,
  carpool: 3,
};

const RIDE_TYPE_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "luxury", label: "Luxury" },
  { value: "carpool", label: "Carpool" },
];

const getRideTypePriority = (type) => {
  const normalized = String(type || "").toLowerCase().trim();
  return RIDE_TYPE_ORDER[normalized] ?? 99;
};

const cityBracketSchema = z.object({
  minMiles: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({
        required_error: "Min miles is required",
        invalid_type_error: "Min miles must be a number",
      })
      .min(0, "Min miles must be 0 or more")
  ),
  maxMiles: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z
      .union([
        z.coerce.number().positive("Max miles must be greater than 0"),
        z.null(),
      ])
      .optional()
  ),
  price: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a valid number",
      })
      .min(0, "Price must be 0 or greater")
      .max(99999, "Price cannot exceed $99,999")
  ),
});

const cityRateSchema = z.object({
  city: z
    .string({ required_error: "City name is required" })
    .trim()
    .min(1, "City name is required")
    .max(50, "City name cannot exceed 50 characters"),
  rideType: z.enum(["economy", "luxury", "carpool"], {
    errorMap: () => ({ message: "Ride type is required" }),
  }),
  peakSurchargePerMile: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({
        required_error: "Peak surcharge is required",
        invalid_type_error: "Peak surcharge must be a valid number",
      })
      .min(0, "Peak surcharge must be 0 or greater")
      .max(9999, "Peak surcharge cannot exceed $9,999")
  ),
  isActive: z.boolean(),
  brackets: z.array(cityBracketSchema).length(5, "Exactly 5 mileage brackets are required"),
});

// Global rate schema
const globalBracketSchema = z.object({
  minMiles: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({
        required_error: "Min miles is required",
        invalid_type_error: "Min miles must be a number",
      })
      .min(0, "Min miles must be 0 or more")
  ),
  maxMiles: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : val),
    z
      .union([
        z.coerce.number().positive("Max miles must be greater than 0"),
        z.null(),
      ])
      .optional()
  ),
  ratePerMile: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce
      .number({
        required_error: "Rate per mile is required",
        invalid_type_error: "Rate per mile must be a valid number",
      })
      .positive("Rate per mile must be greater than 0")
      .max(9999, "Rate per mile cannot exceed $9,999")
  ),
});

const globalRateSchema = z
  .object({
    rideType: z.string().min(1, "Ride type is required"),
    brackets: z.array(globalBracketSchema).min(1, "At least one bracket is required"),
    peakSurchargePerMile: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.coerce
        .number({
          required_error: "Peak surcharge is required",
          invalid_type_error: "Peak surcharge must be a valid number",
        })
        .min(0, "Peak surcharge must be 0 or greater")
        .max(9999, "Peak surcharge cannot exceed $9,999")
    ),
    discountPercentage: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.coerce
        .number({
          required_error: "Discount percentage is required",
          invalid_type_error: "Discount percentage must be a valid number",
        })
        .min(0, "Discount percentage must be 0 or greater")
        .max(100, "Discount percentage cannot exceed 100")
    ),
  })
  .superRefine((value, ctx) => {
    value.brackets.forEach((bracket, index) => {
      const normalizedMax =
        bracket.maxMiles === null || bracket.maxMiles === "" ? null : Number(bracket.maxMiles);

      if (normalizedMax !== null && normalizedMax <= bracket.minMiles) {
        ctx.addIssue({
          code: "custom",
          message: "Max miles must be greater than min miles",
          path: ["brackets", index, "maxMiles"],
        });
      }

      if (index > 0) {
        const prev = value.brackets[index - 1];
        const prevMax = prev.maxMiles === null || prev.maxMiles === "" ? null : Number(prev.maxMiles);
        const expectedMin = prevMax === null ? prev.minMiles + 1 : prevMax + 1;

        if (bracket.minMiles !== expectedMin) {
          ctx.addIssue({
            code: "custom",
            message: `Min miles must start at ${expectedMin} to avoid overlapping ranges`,
            path: ["brackets", index, "minMiles"],
          });
        }
      }
    });
  });

const emptyGlobalRate = {
  rideType: "",
  brackets: [{ minMiles: 0, maxMiles: 5, ratePerMile: 0 }],
  peakSurchargePerMile: 0,
  discountPercentage: 0,
};

const emptyCityRate = {
  city: "",
  rideType: "economy",
  peakSurchargePerMile: 0,
  isActive: true,
  brackets: DEFAULT_CITY_BRACKETS,
};

const buildNextGlobalBracket = (brackets) => {
  const lastBracket = brackets[brackets.length - 1];
  const lastMax = lastBracket?.maxMiles === "" || lastBracket?.maxMiles == null ? null : Number(lastBracket.maxMiles);
  const minMiles = brackets.length === 0 ? 0 : lastMax == null ? Number(lastBracket.minMiles) + 1 : lastMax + 1;
  const maxMiles = minMiles + 4;

  return {
    minMiles,
    maxMiles,
    ratePerMile: 0,
  };
};

const normalizeGlobalBrackets = (brackets) =>
  brackets.map((bracket, index) => {
    const normalized = {
      ...bracket,
      minMiles: Number(bracket.minMiles),
      ratePerMile: Number(bracket.ratePerMile),
      maxMiles:
        bracket.maxMiles === "" || bracket.maxMiles === null || bracket.maxMiles === undefined
          ? null
          : Number(bracket.maxMiles),
    };

    if (index > 0) {
      const prev = brackets[index - 1];
      const prevMax =
        prev.maxMiles === "" || prev.maxMiles === null || prev.maxMiles === undefined
          ? Number(prev.minMiles)
          : Number(prev.maxMiles);
      normalized.minMiles = prevMax + 1;
    }

    return normalized;
  });

const RideRates = () => {
  const [searchCity, setSearchCity] = useState("");
  const debouncedSearchCity = useDebounce(searchCity, 400);

  const {
    loading,
    data,
    updateRideRate,
    createCityRideRate,
    updateCityRideRate,
    deleteCityRideRate,
    toggleCityRideRateStatus,
    setCityFilter,
  } = useRideRatesActions();

  useEffect(() => {
    setCityFilter(debouncedSearchCity);
  }, [debouncedSearchCity, setCityFilter]);

  const [activeTab, setActiveTab] = useState("city"); // "city" | "global"
  const [editingCityRate, setEditingCityRate] = useState(null); // null | object
  const [isCreatingCity, setIsCreatingCity] = useState(false);
  const [editingGlobalRate, setEditingGlobalRate] = useState(null);
  const [deleteCityTarget, setDeleteCityTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingCityIds, setTogglingCityIds] = useState(new Set());

  const globalRates = data?.rates || [];
  const cityRates = data?.cityRates || [];
  const peakWindows = data?.peakWindows || [];

  const sortedCityRates = useMemo(() => {
    return [...cityRates].sort((a, b) => {
      const cityComparison = (a.city || "").localeCompare(b.city || "", undefined, {
        sensitivity: "base",
      });
      if (cityComparison !== 0) return cityComparison;
      return getRideTypePriority(a.rideType) - getRideTypePriority(b.rideType);
    });
  }, [cityRates]);

  const sortedGlobalRates = useMemo(() => {
    return [...globalRates].sort(
      (a, b) => getRideTypePriority(a.rideType) - getRideTypePriority(b.rideType)
    );
  }, [globalRates]);

  // Form for City Rate (Create / Edit)
  const cityFormDefaults = useMemo(() => {
    if (editingCityRate) {
      return {
        city: editingCityRate.city || "",
        rideType: editingCityRate.rideType || "economy",
        peakSurchargePerMile: editingCityRate.peakSurchargePerMile ?? 0,
        isActive: editingCityRate.isActive ?? true,
        brackets: editingCityRate.brackets?.length === 5
          ? editingCityRate.brackets.map((b) => ({
              minMiles: b.minMiles,
              maxMiles: b.maxMiles ?? "",
              price: b.price ?? 0,
            }))
          : DEFAULT_CITY_BRACKETS,
      };
    }
    return emptyCityRate;
  }, [editingCityRate]);

  const {
    register: registerCity,
    handleSubmit: handleSubmitCity,
    reset: resetCity,
    setValue: setCityValue,
    watch: watchCity,
    formState: { errors: cityErrors },
  } = useForm({
    resolver: zodResolver(cityRateSchema),
    defaultValues: cityFormDefaults,
  });

  const watchCityIsActive = watchCity("isActive");
  const watchCityName = watchCity("city");
  const watchRideType = watchCity("rideType");

  const cityOptions = useMemo(() => {
    const currentCity = watchCityName || editingCityRate?.city;
    if (currentCity && !FLORIDA_CITIES.some((c) => c.value.toLowerCase() === currentCity.toLowerCase())) {
      return [{ value: currentCity, label: currentCity }, ...FLORIDA_CITIES];
    }
    return FLORIDA_CITIES;
  }, [watchCityName, editingCityRate]);

  useEffect(() => {
    if (editingCityRate) {
      resetCity({
        city: editingCityRate.city || "",
        rideType: editingCityRate.rideType || "economy",
        peakSurchargePerMile: editingCityRate.peakSurchargePerMile ?? 0,
        isActive: editingCityRate.isActive ?? true,
        brackets: editingCityRate.brackets?.length === 5
          ? editingCityRate.brackets.map((b) => ({
              minMiles: b.minMiles,
              maxMiles: b.maxMiles ?? "",
              price: b.price ?? 0,
            }))
          : DEFAULT_CITY_BRACKETS,
      });
    } else if (isCreatingCity) {
      resetCity({
        city: "",
        rideType: "economy",
        peakSurchargePerMile: 0,
        isActive: true,
        brackets: DEFAULT_CITY_BRACKETS,
      });
    }
  }, [editingCityRate, isCreatingCity, resetCity]);

  // Form for Global Rate (Edit)
  const globalFormDefaults = useMemo(() => {
    if (!editingGlobalRate) return emptyGlobalRate;
    return {
      rideType: editingGlobalRate.rideType || "",
      brackets: editingGlobalRate.brackets?.length
        ? editingGlobalRate.brackets.map((bracket) => ({
            ...bracket,
            maxMiles: bracket.maxMiles ?? "",
          }))
        : emptyGlobalRate.brackets,
      peakSurchargePerMile: editingGlobalRate.peakSurchargePerMile ?? 0,
      discountPercentage: editingGlobalRate.discountPercentage ?? 0,
    };
  }, [editingGlobalRate]);

  const {
    register: registerGlobal,
    handleSubmit: handleSubmitGlobal,
    reset: resetGlobal,
    control: controlGlobal,
    setValue: setGlobalValue,
    formState: { errors: globalErrors },
  } = useForm({
    resolver: zodResolver(globalRateSchema),
    defaultValues: globalFormDefaults,
  });

  const { fields: globalFields, append: appendGlobal, remove: removeGlobal } = useFieldArray({
    control: controlGlobal,
    name: "brackets",
  });

  useEffect(() => {
    resetGlobal(globalFormDefaults);
  }, [globalFormDefaults, resetGlobal]);

  const watchedGlobalBrackets = useWatch({ control: controlGlobal, name: "brackets" });

  useEffect(() => {
    if (!watchedGlobalBrackets?.length) return;

    watchedGlobalBrackets.forEach((bracket, index) => {
      if (index === 0) return;

      const prev = watchedGlobalBrackets[index - 1];
      const prevMax =
        prev?.maxMiles === "" || prev?.maxMiles === null || prev?.maxMiles === undefined
          ? Number(prev?.minMiles)
          : Number(prev.maxMiles);
      const nextMin = prevMax + 1;

      if (Number(bracket?.minMiles) !== nextMin) {
        setGlobalValue(`brackets.${index}.minMiles`, nextMin, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    });
  }, [watchedGlobalBrackets, setGlobalValue]);

  // City Handlers
  const handleOpenCreateCity = () => {
    setEditingCityRate(null);
    setIsCreatingCity(true);
    resetCity({
      city: "",
      rideType: "economy",
      peakSurchargePerMile: 0,
      isActive: true,
      brackets: DEFAULT_CITY_BRACKETS,
    });
  };

  const handleOpenEditCity = (rate) => {
    setIsCreatingCity(false);
    setEditingCityRate(rate);
    resetCity({
      city: rate.city || "",
      rideType: rate.rideType || "economy",
      peakSurchargePerMile: rate.peakSurchargePerMile ?? 0,
      isActive: rate.isActive ?? true,
      brackets: rate.brackets?.length === 5
        ? rate.brackets.map((b) => ({
            minMiles: b.minMiles,
            maxMiles: b.maxMiles ?? "",
            price: b.price ?? 0,
          }))
        : DEFAULT_CITY_BRACKETS,
    });
  };

  const handleCloseCityModal = () => {
    setIsCreatingCity(false);
    setEditingCityRate(null);
    resetCity({
      city: "",
      rideType: "economy",
      peakSurchargePerMile: 0,
      isActive: true,
      brackets: DEFAULT_CITY_BRACKETS,
    });
  };

  const onSubmitCity = async (values) => {
    const payload = {
      city: values.city.trim(),
      rideType: values.rideType,
      peakSurchargePerMile: Number(values.peakSurchargePerMile),
      isActive: Boolean(values.isActive),
      brackets: values.brackets.map((b, idx) => ({
        minMiles: Number(b.minMiles),
        maxMiles: idx === 4 ? null : Number(b.maxMiles),
        price: Number(b.price),
      })),
    };

    let res;
    if (editingCityRate?._id || editingCityRate?.id) {
      res = await updateCityRideRate(editingCityRate._id || editingCityRate.id, payload);
    } else {
      res = await createCityRideRate(payload);
    }
    if (res) {
      handleCloseCityModal();
    }
  };

  const handleToggleCityActive = async (rate) => {
    const rateId = rate._id || rate.id;
    if (!rateId || togglingCityIds.has(rateId)) return;

    setTogglingCityIds((prev) => new Set(prev).add(rateId));
    try {
      await toggleCityRideRateStatus(rate);
    } finally {
      setTogglingCityIds((prev) => {
        const next = new Set(prev);
        next.delete(rateId);
        return next;
      });
    }
  };

  const handleConfirmDeleteCity = async () => {
    if (!deleteCityTarget) return;
    const rateId = deleteCityTarget._id || deleteCityTarget.id;
    if (!rateId) return;
    setDeleteLoading(true);
    try {
      await deleteCityRideRate(rateId);
      setDeleteCityTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Global Handlers
  const handleOpenEditGlobal = (rate) => setEditingGlobalRate(rate);
  const handleCloseGlobalModal = () => setEditingGlobalRate(null);

  const onSubmitGlobal = async (values) => {
    const res = await updateRideRate(editingGlobalRate.rideType, {
      ...values,
      brackets: normalizeGlobalBrackets(values.brackets),
    });
    if (res) {
      handleCloseGlobalModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-gray-950 via-gray-900 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400">
          <Building2 className="h-4 w-4" />
          <span>Fare & Pricing Engine</span>
        </div>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ride Rates & City Pricing</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">
              Configure city-based fixed mileage bracket pricing or fall back to global per-mile rates. Peak surcharge windows use <span className="font-mono text-indigo-300">America/New_York</span> timezone.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm">
              ⚡ {peakWindows.length} Active Peak Window{peakWindows.length === 1 ? "" : "s"}
            </div>
            <Button
              onClick={handleOpenCreateCity}
              icon={<Plus className="h-4 w-4" />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
            >
              Add City Rate
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-6 flex border-b border-gray-800/80">
          <button
            onClick={() => setActiveTab("city")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "city"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Building2 className="h-4 w-4" />
            City-Based Pricing ({cityRates.length})
          </button>
          <button
            onClick={() => setActiveTab("global")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "global"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Globe className="h-4 w-4" />
            Global Fallback Rates ({globalRates.length})
          </button>
        </div>
      </div>

      {/* Tab Content: City-Based Pricing */}
      {activeTab === "city" && (
        <div className="space-y-6">
          {/* Search Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                placeholder="Search by city name (e.g. Orlando, Miami)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                rightIcon={
                  searchCity ? (
                    <button
                      type="button"
                      onClick={() => setSearchCity("")}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  ) : null
                }
                className="bg-white dark:bg-gray-800"
              />
            </div>
            {searchCity && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Found {cityRates.length} rate{cityRates.length === 1 ? "" : "s"} for "{searchCity}"
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && !cityRates.length ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-12 text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <RefreshCcw className="h-5 w-5 animate-spin text-indigo-500" />
              <span>Loading city rates...</span>
            </div>
          ) : cityRates.length === 0 ? (
            <Card className="border border-dashed border-gray-300 p-12 text-center dark:border-gray-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {searchCity ? `No City Rates matching "${searchCity}"` : "No City Rates Found"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchCity
                  ? "Try searching for another city name or clear the search filter."
                  : "No city pricing rates have been configured yet. Create a city pricing record to replace fallback per-mile rates."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {searchCity && (
                  <Button variant="outline" onClick={() => setSearchCity("")}>
                    Clear Search
                  </Button>
                )}
                <Button onClick={handleOpenCreateCity} icon={<Plus className="h-4 w-4" />}>
                  Create City Pricing
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {sortedCityRates.map((rate) => {
                const rateId = rate._id || rate.id;
                return (
                  <Card
                    key={rateId || `${rate.city}-${rate.rideType}`}
                    className={`border shadow-sm transition-all ${
                      rate.isActive
                        ? "border-gray-200 dark:border-gray-800"
                        : "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                    }`}
                  >
                    <Card.Content>
                      {/* Top info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{rate.city}</h2>
                              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                {rate.rideType}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              {rate.isActive ? (
                                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Active Pricing
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                                  <XCircle className="h-3.5 w-3.5" /> Inactive (Falls back to Global)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={rate.isActive}
                            disabled={togglingCityIds.has(rateId)}
                            onClick={() => handleToggleCityActive(rate)}
                            title={rate.isActive ? "Deactivate city rate" : "Activate city rate"}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
                              rate.isActive ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                rate.isActive ? "translate-x-5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditCity(rate)}
                            icon={<Edit2 className="h-4 w-4" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteCityTarget(rate)}
                            icon={<Trash2 className="h-4 w-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Mileage Brackets Display */}
                      <div className="mt-5 space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Fixed Bracket Prices
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {rate.brackets?.map((b, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 dark:border-gray-800 dark:bg-gray-800/60"
                            >
                              <div>
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  {b.minMiles} – {b.maxMiles != null ? `${b.maxMiles} miles` : "21+ miles"}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                ${Number(b.price ?? 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Peak Surcharge Info */}
                      <div className="mt-4 rounded-xl bg-indigo-50/70 px-4 py-3 dark:bg-indigo-950/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                            Peak Surcharge Per Mile
                          </span>
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            ${Number(rate.peakSurchargePerMile || 0).toFixed(2)} / mile
                          </span>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Global Fallback Rates */}
      {activeTab === "global" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
            💡 Global rates serve as fallback pricing whenever a city has no active city rate record configured for a ride type or when the pickup city is omitted.
          </div>

          {loading && !globalRates.length ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-12 text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <RefreshCcw className="h-5 w-5 animate-spin text-indigo-500" />
              <span>Loading global fallback rates...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {sortedGlobalRates.map((rate) => (
                <Card key={rate.rideType} className="border border-gray-200 shadow-sm dark:border-gray-800">
                  <Card.Content>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                          {rate.rideType} (Global Fallback)
                        </h2>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditGlobal(rate)}
                        icon={<Edit2 className="h-4 w-4" />}
                      >
                        Edit Rate
                      </Button>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Per-Mile Rate Brackets
                      </div>
                      {rate.brackets?.map((bracket, index) => (
                        <div
                          key={`${rate.rideType}-${index}`}
                          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {bracket.minMiles} to {bracket.maxMiles ?? "unlimited"} miles
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Bracket {index + 1}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              ${Number(bracket.ratePerMile).toFixed(2)} / mile
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/40">
                        <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Peak surcharge</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          ${Number(rate.peakSurchargePerMile || 0).toFixed(2)} / mile
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800/60">
                        <div className="text-xs uppercase text-gray-500 dark:text-gray-400">Global Discount</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {formatPercent(rate.discountPercentage)}
                        </div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create or Edit City Rate */}
      <Modal
        isOpen={isCreatingCity || !!editingCityRate}
        onClose={handleCloseCityModal}
        title={editingCityRate ? `Edit Pricing for ${editingCityRate.city} (${editingCityRate.rideType})` : "Create City Pricing"}
        size="xl"
      >
        <form onSubmit={handleSubmitCity(onSubmitCity)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="City Name"
              placeholder="Select a city..."
              searchable={true}
              options={cityOptions}
              value={watchCityName}
              onChange={(e) =>
                setCityValue("city", e.target.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={cityErrors.city?.message}
            />

            <Select
              label="Ride Type"
              placeholder="Select a ride type..."
              searchable={false}
              disabled={!!editingCityRate}
              options={RIDE_TYPE_OPTIONS}
              value={watchRideType}
              onChange={(e) =>
                setCityValue("rideType", e.target.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={cityErrors.rideType?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Peak Surcharge Per Mile ($)"
              type="number"
              step="0.01"
              min="0"
              max="9999"
              maxLength={6}
              onInput={(e) => {
                if (e.target.value.length > 6) e.target.value = e.target.value.slice(0, 6);
              }}
              placeholder="0.25"
              {...registerCity("peakSurchargePerMile")}
              error={cityErrors.peakSurchargePerMile?.message}
            />

            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-gray-700 dark:bg-gray-800/40 mt-1">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Active Status</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Enable or disable city rate</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={watchCityIsActive}
                onClick={() => setCityValue("isActive", !watchCityIsActive, { shouldDirty: true })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  watchCityIsActive ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    watchCityIsActive ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Fixed Mileage Brackets (Required 5 Brackets) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Required Mileage Brackets (Fixed Price)
              </h3>
              <span className="text-xs text-gray-500">5 standard proposal brackets</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "0 to 4 Miles", min: 0, max: 4, index: 0 },
                { label: "5 to 9 Miles", min: 5, max: 9, index: 1 },
                { label: "10 to 15 Miles", min: 10, max: 15, index: 2 },
                { label: "16 to 20 Miles", min: 16, max: 20, index: 3 },
                { label: "21+ Miles", min: 21, max: null, index: 4 },
              ].map((bracket) => (
                <div
                  key={bracket.index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <div className="min-w-[150px]">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{bracket.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Range: {bracket.min} to {bracket.max != null ? bracket.max : "Unlimited"} miles
                    </div>
                  </div>

                  <input
                    type="hidden"
                    value={bracket.min}
                    {...registerCity(`brackets.${bracket.index}.minMiles`)}
                  />
                  <input
                    type="hidden"
                    value={bracket.max ?? ""}
                    {...registerCity(`brackets.${bracket.index}.maxMiles`)}
                  />

                  <div className="w-full sm:w-48">
                    <Input
                      label="Fixed Price ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      max="99999"
                      maxLength={6}
                      onInput={(e) => {
                        if (e.target.value.length > 6) e.target.value = e.target.value.slice(0, 6);
                      }}
                      placeholder="e.g. 15.00"
                      {...registerCity(`brackets.${bracket.index}.price`)}
                      error={cityErrors.brackets?.[bracket.index]?.price?.message}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={handleCloseCityModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {editingCityRate ? "Save City Pricing" : "Create City Pricing"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Global Fallback Rate */}
      <Modal
        isOpen={!!editingGlobalRate}
        onClose={handleCloseGlobalModal}
        title={`Edit Global Fallback Rate (${editingGlobalRate?.rideType || ""})`}
        size="xl"
      >
        <form onSubmit={handleSubmitGlobal(onSubmitGlobal)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Peak surcharge per mile ($)"
              type="number"
              step="0.01"
              min="0"
              max="9999"
              maxLength={6}
              onInput={(e) => {
                if (e.target.value.length > 6) e.target.value = e.target.value.slice(0, 6);
              }}
              {...registerGlobal("peakSurchargePerMile")}
              error={globalErrors.peakSurchargePerMile?.message}
            />
            <Input
              label="Discount percentage (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              maxLength={5}
              onInput={(e) => {
                if (e.target.value.length > 5) e.target.value = e.target.value.slice(0, 5);
              }}
              {...registerGlobal("discountPercentage")}
              error={globalErrors.discountPercentage?.message}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Global Mileage Brackets</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendGlobal(buildNextGlobalBracket(globalFields))}
                icon={<Plus className="h-4 w-4" />}
              >
                Add Bracket
              </Button>
            </div>

            <div className="space-y-4">
              {globalFields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      label="Min miles"
                      type="number"
                      step="1"
                      min="0"
                      max="9999"
                      maxLength={5}
                      onInput={(e) => {
                        if (e.target.value.length > 5) e.target.value = e.target.value.slice(0, 5);
                      }}
                      {...registerGlobal(`brackets.${index}.minMiles`)}
                      error={globalErrors.brackets?.[index]?.minMiles?.message}
                      readOnly={index > 0}
                    />
                    <Input
                      label="Max miles"
                      type="number"
                      step="1"
                      min="1"
                      max="9999"
                      maxLength={5}
                      onInput={(e) => {
                        if (e.target.value.length > 5) e.target.value = e.target.value.slice(0, 5);
                      }}
                      placeholder="Leave blank for infinity"
                      {...registerGlobal(`brackets.${index}.maxMiles`)}
                      error={globalErrors.brackets?.[index]?.maxMiles?.message}
                    />
                    <Input
                      label="Rate per mile ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      max="9999"
                      maxLength={6}
                      onInput={(e) => {
                        if (e.target.value.length > 6) e.target.value = e.target.value.slice(0, 6);
                      }}
                      {...registerGlobal(`brackets.${index}.ratePerMile`)}
                      error={globalErrors.brackets?.[index]?.ratePerMile?.message}
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGlobal(index)}
                      disabled={globalFields.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCloseGlobalModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Global Rate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete City Rate Modal */}
      <ConfirmModal
        isOpen={!!deleteCityTarget}
        onClose={() => setDeleteCityTarget(null)}
        title="Delete City Pricing"
        message={`Are you sure you want to delete ${deleteCityTarget?.city} (${deleteCityTarget?.rideType}) pricing? This action cannot be undone and rides in this city will fall back to global rates.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        onConfirm={handleConfirmDeleteCity}
      />
    </div>
  );
};

export default RideRates;
