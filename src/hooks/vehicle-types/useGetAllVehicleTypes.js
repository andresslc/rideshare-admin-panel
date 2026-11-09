import { useCallback, useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api, isAbortError } from "../../lib/services";
import useRequestGuard from "../global/useRequestGuard";

const useGetAllVehicleTypes = (page, limit, search, rideType) => {
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const getAllVehicleTypes = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const response = await api.getAllVehicleTypes(page, limit, search, rideType, {
        signal,
      });
      if (!isCurrent()) return;
      setVehicleTypes(response.data?.result || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, search, rideType, beginRequest]);

  useEffect(() => {
    getAllVehicleTypes();
  }, [getAllVehicleTypes]);

  return {
    loading,
    vehicleTypes,
    totalPages,
    totalData,
    getAllVehicleTypes,
  };
};

export default useGetAllVehicleTypes;
