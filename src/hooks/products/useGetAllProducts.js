import { useCallback, useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api, isAbortError } from "../../lib/services";
import useRequestGuard from "../global/useRequestGuard";

const useGetAllProducts = (search, status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalActiveProducts: 0,
    totalInactiveProducts: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const getAllProducts = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);

    try {
      const response = await api.getAllProducts(search, status, page, limit, {
        signal,
      });
      if (!isCurrent()) return;
      setProducts(response.data?.products || []);
      setStats(response.data?.stats);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.totalItems || 0);
    } catch (error) {
      if (!isCurrent() || isAbortError(error)) return;
      handleError(error);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [search, status, page, limit, beginRequest]);

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  return { loading, products, totalPages, totalData, stats, getAllProducts };
};

export default useGetAllProducts;
