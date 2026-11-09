import { useCallback, useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api, isAbortError } from "../../lib/services";
import { useNavigate } from "react-router-dom";
import useRequestGuard from "../global/useRequestGuard";

const useGetDocuments = (search, status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDone, setBulkDone] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalActiveDocs: 0,
    totalInactiveDocs: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const beginRequest = useRequestGuard();

  const getAllDocuments = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);

    try {
      const response = await api.getAllDocs(search, status, page, limit, {
        signal,
      });
      if (!isCurrent()) return;
      setDocs(response.data?.documents || []);
      setVehicles(response.data?.vehicles || []);
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

  const bulkRespond = async (
    documents = [],
    vehicles = [],
    status,
    reason = null,
  ) => {
    setBulkLoading(true);

    try {
      // ✅ ensure arrays
      const safeDocs = Array.isArray(documents) ? documents : [];
      const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
      const formattedDocs = safeDocs.map((doc) => ({
        id: doc._id,
        status,
        rejectReason: status === "rejected" ? doc.rejectReason || reason : null,
      }));

      const formattedVehicles = safeVehicles.map((vehicle) => ({
        id: vehicle._id,
        status,
        rejectReason:
          status === "rejected" ? vehicle.rejectReason || reason : null,
      }));

      await api.updateDocs(formattedDocs);

      setBulkDone(status);
      getAllDocuments();
      navigate("/driver-requests");
    } catch (err) {
      handleError(err);
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    getAllDocuments();
  }, [getAllDocuments]);

  return {
    loading,
    docs,
    vehicles,
    totalPages,
    totalData,
    stats,
    getAllDocuments,
    bulkDone,
    bulkRespond,
    bulkLoading,
  };
};

export default useGetDocuments;
