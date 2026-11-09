import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetRequestsCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRequestsCount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getRequestsCount();
      setCount(response.data?.pendingDriverRequests || 0);
    } catch (error) {
      handleError(error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequestsCount();
    
    // Optionally, set up an interval to refresh the count periodically
    const interval = setInterval(fetchRequestsCount, 60000); // Refresh every 60 seconds
    
    return () => clearInterval(interval);
  }, [fetchRequestsCount]);

  return {
    count,
    loading,
    refresh: fetchRequestsCount,
  };
};

export default useGetRequestsCount;
