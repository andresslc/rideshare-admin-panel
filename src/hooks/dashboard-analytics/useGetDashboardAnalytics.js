import React, { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetDashboardAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const { dashboardAnalytics, setDashboardAnalytics } = useApp();

  const getDashboardAnalytics = async () => {
    setLoading(true);

    try {
      const response = await api.getDashboardAnalytics();
      setDashboardAnalytics(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dashboardAnalytics) {
      getDashboardAnalytics();
    }
  }, []);

  return {
    loading,
    getDashboardAnalytics,
  };
};

export default useGetDashboardAnalytics;
