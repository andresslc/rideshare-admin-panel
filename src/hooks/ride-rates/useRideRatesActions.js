import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const useRideRatesActions = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ rates: [], cityRates: [], peakWindows: [] });
  const [cityFilter, setCityFilter] = useState("");

  const getRideRates = useCallback(async (city) => {
    setLoading(true);
    try {
      const response = await api.getRideRates(city);
      const payload = response.data?.data || response.data || {};
      const normalizedData = {
        rates: payload.rates || [],
        cityRates: payload.cityRates || [],
        peakWindows: payload.peakWindows || [],
      };
      setData(normalizedData);
      return normalizedData;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRideRate = async (rideType, payload) => {
    setLoading(true);
    try {
      const response = await api.updateRideRate(rideType, payload);
      handleSuccess(`${rideType.charAt(0).toUpperCase() + rideType.slice(1)} global ride rate updated successfully`);
      await getRideRates(cityFilter);
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCityRideRate = async (payload) => {
    setLoading(true);
    try {
      const response = await api.createCityRideRate(payload);
      handleSuccess(response?.data?.message || response?.message || "City pricing created successfully");
      await getRideRates(cityFilter);
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCityRideRate = async (id, payload) => {
    setLoading(true);
    try {
      const response = await api.updateCityRideRate(id, payload);
      handleSuccess(response?.data?.message || response?.message || "City pricing updated successfully");
      await getRideRates(cityFilter);
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCityRideRate = async (id) => {
    setLoading(true);
    try {
      const response = await api.deleteCityRideRate(id);
      handleSuccess(response?.data?.message || response?.message || "City pricing deleted successfully");
      await getRideRates(cityFilter);
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleCityRideRateStatus = async (rate) => {
    const rateId = rate._id || rate.id;
    if (!rateId) return;

    const previousIsActive = rate.isActive;
    const nextIsActive = !previousIsActive;

    // 1. Instant Optimistic State Update
    setData((prev) => ({
      ...prev,
      cityRates: prev.cityRates.map((item) =>
        (item._id || item.id) === rateId ? { ...item, isActive: nextIsActive } : item
      ),
    }));

    try {
      const response = await api.updateCityRideRate(rateId, { isActive: nextIsActive });
      handleSuccess(response?.data?.message || response?.message || "Status updated successfully");
      return response.data?.data || response.data;
    } catch (error) {
      // Revert optimistic update on failure
      setData((prev) => ({
        ...prev,
        cityRates: prev.cityRates.map((item) =>
          (item._id || item.id) === rateId ? { ...item, isActive: previousIsActive } : item
        ),
      }));
      handleError(error);
      return null;
    }
  };

  useEffect(() => {
    getRideRates(cityFilter);
  }, [getRideRates, cityFilter]);

  return {
    loading,
    data,
    cityFilter,
    setCityFilter,
    cityNameFilter: cityFilter,
    setCityNameFilter: setCityFilter,
    getRideRates,
    updateRideRate,
    createCityRideRate,
    updateCityRideRate,
    deleteCityRideRate,
    toggleCityRideRateStatus,
  };
};

export default useRideRatesActions;
