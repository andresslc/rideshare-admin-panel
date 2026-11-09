import { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCreateVehicleType = () => {
  const [loading, setLoading] = useState(false);

  const createVehicleType = async (payload) => {
    setLoading(true);
    try {
      const response = await api.createVehicleType(payload);
      setLoading(false);
      handleSuccess(response.message, "Vehicle type created successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  return { loading, createVehicleType };
};

export default useCreateVehicleType;
