import { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useVehicleTypeActions = () => {
  const [loading, setLoading] = useState(false);

  const updateVehicleType = async (id, payload) => {
    setLoading(true);
    try {
      const response = await api.updateVehicleType(id, payload);
      setLoading(false);
      handleSuccess(response.message, "Vehicle type updated successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const deleteVehicleType = async (id) => {
    setLoading(true);
    try {
      const response = await api.deleteVehicleType(id);
      setLoading(false);
      handleSuccess(response.message, "Vehicle type deleted successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  return { loading, updateVehicleType, deleteVehicleType };
};

export default useVehicleTypeActions;
