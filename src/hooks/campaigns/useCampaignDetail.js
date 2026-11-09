import { useState, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import toast from "react-hot-toast";
import useRequestGuard from "../global/useRequestGuard";

const useCampaignDetail = (campaignId) => {
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [details, setDetails] = useState(null);

  const [loadingStats, setLoadingStats] = useState(false);
  const [stats, setStats] = useState(null);

  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [redemptions, setRedemptions] = useState([]);
  const [redemptionsTotal, setRedemptionsTotal] = useState(0);

  const [loadingCodes, setLoadingCodes] = useState(false);
  const [codes, setCodes] = useState([]);
  const [codesTotal, setCodesTotal] = useState(0);

  const fetchDetails = useCallback(async () => {
    if (!campaignId) return;
    setLoadingDetails(true);
    try {
      const res = await api.getCampaignById(campaignId);
      setDetails(res.data?.campaign || res.data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch campaign details.");
    } finally {
      setLoadingDetails(false);
    }
  }, [campaignId]);

  const fetchStats = useCallback(async () => {
    if (!campaignId) return;
    setLoadingStats(true);
    try {
      const res = await api.getCampaignStats(campaignId);
      setStats(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch campaign stats.");
    } finally {
      setLoadingStats(false);
    }
  }, [campaignId]);

  const beginRedemptionsRequest = useRequestGuard();

  const fetchRedemptions = useCallback(async (page = 1, limit = 10, search = "") => {
    if (!campaignId) return;
    const { signal, isCurrent } = beginRedemptionsRequest();
    setLoadingRedemptions(true);
    try {
      const res = await api.getCampaignRedemptions(campaignId, page, limit, search, { signal });
      // Drop a response that a newer search has already superseded.
      if (!isCurrent()) return;
      setRedemptions(res.data?.redemptions || []);
      setRedemptionsTotal(res.data?.totalCount || res.data?.pagination?.total || 0);
    } catch (err) {
      if (!isCurrent() || isAbortError(err)) return;
      toast.error(err.message || "Failed to fetch redemptions.");
    } finally {
      if (isCurrent()) setLoadingRedemptions(false);
    }
  }, [campaignId, beginRedemptionsRequest]);

  const fetchCodes = useCallback(async (page = 1, limit = 10) => {
    if (!campaignId) return;
    setLoadingCodes(true);
    try {
      const res = await api.getGeneratedCodes(campaignId, page, limit);
      setCodes(res.data?.codes || []);
      setCodesTotal(res.data?.totalCount || 0);
    } catch (err) {
      toast.error(err.message || "Failed to fetch generated codes.");
    } finally {
      setLoadingCodes(false);
    }
  }, [campaignId]);

  return {
    loadingDetails,
    details,
    fetchDetails,
    loadingStats,
    stats,
    fetchStats,
    loadingRedemptions,
    redemptions,
    redemptionsTotal,
    fetchRedemptions,
    loadingCodes,
    codes,
    codesTotal,
    fetchCodes,
  };
};

export default useCampaignDetail;
