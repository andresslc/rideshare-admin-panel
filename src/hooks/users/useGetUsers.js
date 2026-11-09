import { useState, useEffect, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import useRequestGuard from "../global/useRequestGuard";

const useGetUsers = (type, page, limit, search, startDate, endDate) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const fetchUsers = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const response = await api.getUsers(
        type,
        page,
        limit,
        search,
        startDate,
        endDate,
        { signal },
      );
      if (!isCurrent()) return;
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [type, page, limit, search, startDate, endDate, beginRequest]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    totalPages,
    totalData,
    refresh: fetchUsers,
  };
};

export default useGetUsers;
