import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllCategories = (status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalActiveCategories: 0,
    totalInactiveCategories: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllCategories = async () => {
    setLoading(true);

    try {
      const response = await api.getAllCategories(status, page, limit);
      setCategories(response.data.categories);
      setStats(response.data.stats);
      setTotalPages(response.pagination.totalPages);
      setTotalData(response.pagination.totalItems);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategories();
  }, [status, page, limit]);

  return {
    loading,
    categories,
    totalPages,
    totalData,
    stats,
    getAllCategories,
  };
};

export default useGetAllCategories;
