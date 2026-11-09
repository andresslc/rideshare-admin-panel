import { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const useAppConfigsActions = () => {
  const { appConfigs, setAppConfigs } = useApp();
  const [loading, setLoading] = useState(false);

  const getAppConfigs = async () => {
    setLoading(true);
    try {
      const response = await api.getAppConfigs();
      const payload = {
        shippingCost: response.data.shippingCost,
        pickupAddress: response.data.pickupAddress,
      };
      setAppConfigs(payload);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appConfigs) {
      getAppConfigs();
    }
  }, []);

  const updateAppConfigs = async (configData) => {
    setLoading(true);
    try {
      const response = await api.updateAppConfigs(configData);
      if (response.success) {
        setAppConfigs(configData);
        handleSuccess("App configurations updated successfully");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getAppConfigs,
    updateAppConfigs,
  };
};

export default useAppConfigsActions;
