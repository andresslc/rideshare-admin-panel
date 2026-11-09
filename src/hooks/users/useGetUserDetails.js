import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetUserDetails = (id, type) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id || !type) return;
    setLoading(true);
    try {
      const response = await api.getUserDetail(id, type);
      setDetails(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    details,
    loading,
    refresh: fetchDetails,
  };
};

export default useGetUserDetails;
