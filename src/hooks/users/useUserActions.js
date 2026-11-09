import { useState } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import toast from "react-hot-toast";

const useUserActions = () => {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id, type, status) => {
    setLoading(true);
    try {
      await api.updateUserStatus(id, type, status);
      toast.success(`User ${status === "active" ? "activated" : "deactivated"} successfully`);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateStatus,
  };
};

export default useUserActions;
