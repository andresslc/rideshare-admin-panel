import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const useRideConfiguration = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getRideConfiguration();
      // Handle both standard { data: { nearbyRadius: ... } } and direct payload
      const configData = res?.data?.data || res?.data || {};
      setConfig(configData);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (payload) => {
    setUpdating(true);
    try {
      const res = await api.updateRideConfiguration(payload);
      const updatedData = res?.data?.data || res?.data || payload;
      setConfig((prev) => ({ ...prev, ...updatedData }));
      handleSuccess(res?.message, "Ride configuration updated successfully");
      return { success: true, data: updatedData };
    } catch (err) {
      handleError(err);
      return { success: false, error: err };
    } finally {
      setUpdating(false);
    }
  };

  return {
    config,
    loading,
    updating,
    fetchConfig,
    updateConfig,
  };
};

export default useRideConfiguration;
