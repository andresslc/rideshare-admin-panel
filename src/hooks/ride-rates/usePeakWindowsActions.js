import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const usePeakWindowsActions = () => {
  const [loading, setLoading] = useState(false);
  const [peakWindows, setPeakWindows] = useState([]);

  const getPeakWindows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getPeakWindows();
      const windows =
        response.data?.data?.peakWindows ||
        response.data?.peakWindows ||
        response.data?.data ||
        response.data ||
        [];
      setPeakWindows(windows);
      return windows;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPeakWindow = async (payload) => {
    setLoading(true);
    try {
      const response = await api.createPeakWindow(payload);
      handleSuccess(response.message || "Peak window created successfully");
      await getPeakWindows();
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePeakWindow = async (id, payload) => {
    setLoading(true);
    try {
      const response = await api.updatePeakWindow(id, payload);
      handleSuccess(response.message || "Peak window updated successfully");
      await getPeakWindows();
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePeakWindow = async (id) => {
    setLoading(true);
    try {
      const response = await api.deletePeakWindow(id);
      handleSuccess(response.message || "Peak window deleted successfully");
      await getPeakWindows();
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPeakWindows();
  }, [getPeakWindows]);

  return {
    loading,
    peakWindows,
    getPeakWindows,
    createPeakWindow,
    updatePeakWindow,
    deletePeakWindow,
  };
};

export default usePeakWindowsActions;
