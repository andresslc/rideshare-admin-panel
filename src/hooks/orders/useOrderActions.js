import { useCallback, useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api, isAbortError } from "../../lib/services";
import useRequestGuard from "../global/useRequestGuard";

const useOrderActions = (
  paymentStatus,
  orderStatus,
  orderType,
  startDate,
  endDate,
  search,
  page,
  limit
) => {
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const beginRequest = useRequestGuard();

  const getOrders = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const response = await api.getOrders(
        paymentStatus,
        orderStatus,
        orderType,
        startDate,
        endDate,
        search,
        page,
        limit,
        { signal }
      );
      if (!isCurrent()) return;
      setOrders(response.data?.orders || []);
      setStats(response.data?.stats);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.totalItems || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [
    paymentStatus,
    orderStatus,
    orderType,
    startDate,
    endDate,
    search,
    page,
    limit,
    beginRequest,
  ]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const getOrdersByContact = async (contactEmail) => {
    setLoadingActions(true);
    try {
      return await api.getOrdersByContact(contactEmail);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingActions(false);
    }
  };

  const getOrderById = async (id) => {
    setLoadingActions(true);
    try {
      return await api.getOrderById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingActions(false);
    }
  };

  const updateOrder = async (id, orderData) => {
    setLoadingActions(true);
    try {
      const response = await api.updateOrder(id, orderData);
      setLoadingActions(false);
      return response.success;
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return false;
    }
  };

  return {
    loading,
    loadingActions,
    orders,
    stats,
    totalPages,
    totalData,
    getOrders,
    getOrdersByContact,
    getOrderById,
    updateOrder,
  };
};

export default useOrderActions;
