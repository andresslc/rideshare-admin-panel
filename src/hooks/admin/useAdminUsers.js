import { useState, useEffect, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import useRequestGuard from "../global/useRequestGuard";

const useAdminUsers = (page = 1, limit = 10, search = "", role = "", sort = "desc") => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalData: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const beginRequest = useRequestGuard();

  const fetchAdmins = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAdminUsers(page, limit, role, search, sort, {
        signal,
      });
      if (!isCurrent()) return;

      // The API wraps the list as { data: { admins, pagination } }. Accept a bare
      // array too, and never hand the table anything that isn't an array.
      const payload = response?.data;
      const list = Array.isArray(payload)
        ? payload
        : payload?.admins || payload?.results || payload?.data || [];
      const meta = response?.pagination || payload?.pagination || {};

      setAdmins(Array.isArray(list) ? list : []);
      setPagination({
        totalData: meta.total ?? meta.totalData ?? 0,
        totalPages: meta.totalPages || 0,
        currentPage: meta.currentPage || page,
        limit: meta.limit || limit,
      });
    } catch (err) {
      if (!isCurrent() || isAbortError(err)) return;
      setError(err.message || "Failed to fetch admin users");
      handleError(err);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, role, search, sort, beginRequest]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return { admins, loading, error, pagination, refresh: fetchAdmins };
};

export default useAdminUsers;
