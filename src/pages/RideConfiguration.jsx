import React, { useState, useEffect, useMemo } from "react";
import { RefreshCw, Save } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { formatDateTime } from "../utils/helpers";
import useRideConfiguration from "../hooks/ride-configuration/useRideConfiguration";

const RideConfiguration = () => {
  const { config, loading, updating, fetchConfig, updateConfig } =
    useRideConfiguration();

  const [nearbyRadius, setNearbyRadius] = useState("");
  const [error, setError] = useState("");

  const savedRadius = useMemo(() => {
    if (config?.nearbyRadius !== undefined && config?.nearbyRadius !== null) {
      return Number(config.nearbyRadius);
    }
    return "";
  }, [config]);

  // Populate state once API returns config
  useEffect(() => {
    if (config && config.nearbyRadius !== undefined) {
      setNearbyRadius(config.nearbyRadius);
      setError("");
    }
  }, [config]);

  const currentVal = Number(nearbyRadius);
  const isDirty = !loading && currentVal !== savedRadius;
  const isValid = !isNaN(currentVal) && currentVal > 0;

  const handleChange = (e) => {
    const val = e.target.value;
    setNearbyRadius(val);
    if (val === "" || isNaN(Number(val)) || Number(val) <= 0) {
      setError("Please enter a valid radius greater than 0");
    } else {
      setError("");
    }
  };

  const handleReset = () => {
    setNearbyRadius(savedRadius);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !isDirty) return;

    await updateConfig({
      nearbyRadius: currentVal,
    });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ride Configuration
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage nearby driver search radius
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={fetchConfig}
            disabled={loading || updating}
            className="flex items-center gap-1.5 text-sm"
            icon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Configuration Card ──────────────────────────────────────────── */}
      <Card className="p-6 rounded-xl border bg-white dark:bg-gray-800">
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            General Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure default ride parameters for driver discovery.
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <Input
                label="Nearby Radius (miles)"
                type="number"
                min="1"
                step="any"
                value={nearbyRadius}
                onChange={handleChange}
                error={error}
                placeholder="e.g. 5"
                disabled={updating}
                helperText="Sets the radius in miles within which available drivers receive ride requests."
              />
            </div>

            {config?.updatedAt && (
              <p className="text-xs text-gray-400">
                Last updated: {formatDateTime(config.updatedAt)}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || !isValid || updating}
                icon={
                  updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )
                }
              >
                {updating ? "Updating..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={!isDirty || updating}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RideConfiguration;
