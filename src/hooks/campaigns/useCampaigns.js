import { useState, useCallback, useEffect } from "react";
import { api } from "../../lib/services";
import toast from "react-hot-toast";

const useCampaigns = (page = 1, limit = 10, status = "") => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCampaigns(page, limit, status);
      const data = res.data || {};
      setCampaigns(data.campaigns || []);
      const pagination = data.pagination || {};
      setTotalPages(data.totalPages || pagination.totalPages || 1);
      setTotalData(data.totalCount || pagination.total || 0);
    } catch (err) {
      toast.error(err.message || "Failed to fetch campaigns.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (payload) => {
    setActionLoading(true);
    try {
      await api.createCampaign(payload);
      toast.success("Campaign created successfully.");
      fetchCampaigns();
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to create campaign.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateCampaign = async (id, payload) => {
    setActionLoading(true);
    try {
      await api.updateCampaign(id, payload);
      toast.success("Campaign updated successfully.");
      fetchCampaigns();
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to update campaign.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updateCampaignStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await api.updateCampaignStatus(id, newStatus);
      toast.success(`Campaign marked as ${newStatus}.`);
      fetchCampaigns();
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCampaign = async (id) => {
    setActionLoading(true);
    try {
      await api.deleteCampaign(id);
      toast.success("Campaign deleted successfully.");
      fetchCampaigns();
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to delete campaign.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    campaigns,
    loading,
    actionLoading,
    totalPages,
    totalData,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
  };
};

export default useCampaigns;
