import { useState, useEffect, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import useRequestGuard from "../global/useRequestGuard";

const useGetCarpoolRides = (page, limit, search, status = "", startDate = "", endDate = "") => {
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const fetchRides = useCallback(async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;

    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const response = await api.getCarpoolRides(
        page,
        limit,
        search,
        status,
        startDate,
        endDate,
        "desc",
        { signal },
      );
      if (!isCurrent()) return;
      setRides(response.data?.results || []);
      setStats(response.data?.stats || null);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, search, status, startDate, endDate, beginRequest]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return { rides, stats, loading, totalPages, totalData, refresh: fetchRides };
};

export default useGetCarpoolRides;
