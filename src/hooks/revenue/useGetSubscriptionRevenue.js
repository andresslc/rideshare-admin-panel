import { useState, useEffect, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import useRequestGuard from "../global/useRequestGuard";

const useGetSubscriptionRevenue = (page, limit, search, startDate, endDate, status) => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const fetchData = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const response = await api.getSubscriptionRevenue(
        page,
        limit,
        search,
        startDate,
        endDate,
        status,
        { signal },
      );
      if (!isCurrent()) return;
      setData(response.data?.results || []);
      setStats(response.data?.stats || null);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, search, startDate, endDate, status, beginRequest]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    stats,
    loading,
    totalPages,
    totalData,
    refresh: fetchData,
  };
};

export default useGetSubscriptionRevenue;
