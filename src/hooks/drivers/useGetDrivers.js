import { useState, useEffect, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import useRequestGuard from "../global/useRequestGuard";

const useGetDrivers = (page, limit, search, status) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const fetchDrivers = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const response = await api.getDrivers(page, limit, search, status, {
        signal,
      });
      if (!isCurrent()) return;
      setDrivers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, search, status, beginRequest]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    totalPages,
    totalData,
    refresh: fetchDrivers,
  };
};

export default useGetDrivers;
