import { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  Bell,
  Users,
  UserCheck,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  Search,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import { useForm } from "react-hook-form";
import { formatDateTime, downloadCSV } from "../utils/helpers";
import { api, isAbortError } from "../lib/services";
import toast from "react-hot-toast";
import { usePersistentState } from "../hooks/global/usePersistentState";
import useRequestGuard from "../hooks/global/useRequestGuard";
import { useAuth } from "../contexts/AuthContext";
import { USER_ROLES } from "../config/constants";

// ── Status Badge Helper ───────────────────────────────────────────────────────

const statusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "sent": return "success";
    case "scheduled": return "info";
    case "failed": return "danger";
    default: return "warning";
  }
};

const recipientIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "driver":
    case "drivers": return <UserCheck className="w-3 h-3" />;
    case "rider":
    case "riders":
    case "user": return <Users className="w-3 h-3" />;
    default: return <Bell className="w-3 h-3" />;
  }
};

// ── User Picker ───────────────────────────────────────────────────────────────

const UserPicker = ({ type, selectedId, onChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [pickerPage, setPickerPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef(null);
  const PAGE_SIZE = 20;

  const beginUserRequest = useRequestGuard();

  const fetchUsers = useCallback(async (pageNum, reset = false, searchTerm = "") => {
    const { signal, isCurrent } = beginUserRequest();
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await api.getUsers(type, pageNum, PAGE_SIZE, searchTerm, "", "", { signal });
      // Drop a response that a newer search has already superseded.
      if (!isCurrent()) return;
      const fetched = res.data || [];
      setUsers((prev) => reset ? fetched : [...prev, ...fetched]);
      const totalPages = res.pagination?.totalPages || 1;
      setHasMore(pageNum < totalPages);
    } catch { }
    finally {
      if (isCurrent()) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [type, beginUserRequest]);

  useEffect(() => {
    setSearch("");
  }, [type]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPickerPage(1);
      fetchUsers(1, true, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, type, fetchUsers]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      const next = pickerPage + 1;
      setPickerPage(next);
      fetchUsers(next, false, search);
    }
  };

  const filtered = users;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${type}s...`}
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")}>
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* List */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="max-h-52 overflow-y-auto"
      >
        {loading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No {type}s found.</p>
        ) : (
          <>
            {filtered.map((u) => {
              const id = u.id || u._id;
              const isSelected = selectedId === id;
              return (
                <div
                  key={id}
                  onClick={() => onChange(isSelected ? null : id)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors ${isSelected
                      ? "bg-primary-50 dark:bg-primary-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  {/* Radio indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-primary-600 bg-primary-600" : "border-gray-300"
                    }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ").charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email || "—"}</p>
                  </div>
                </div>
              );
            })}
            {loadingMore && (
              <div className="flex items-center justify-center py-3 gap-2 text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs">Loading more...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {selectedId && (
        <div className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
            1 recipient selected
          </p>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const Notifications = () => {
  const { hasRole, hasPermission } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = usePersistentState("notifications_page", 1);
  const [limit, setLimit] = usePersistentState("notifications_limit", 10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [search, setSearch] = usePersistentState("notifications_search", "");
  const [sort, setSort] = usePersistentState("notifications_sort", "desc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [sending, setSending] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      audienceType: "both",
      title: "",
      message: "",
      deliveryType: "immediate",
      scheduledFor: "",
    },
  });

  const watchTitle = watch("title") || "";
  const watchMessage = watch("message") || "";
  const watchAudienceType = watch("audienceType");
  const watchDeliveryType = watch("deliveryType");

  const isSpecific = watchAudienceType === "rider_only" || watchAudienceType === "driver_only";

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    watch: watchEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    defaultValues: {
      title: "",
      message: "",
      recipientType: "both",
      scheduledFor: "",
    },
  });

  const watchEditTitle = watchEdit("title") || "";
  const watchEditMessage = watchEdit("message") || "";

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const beginRequest = useRequestGuard();

  const fetchNotifications = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    setLoading(true);
    try {
      const res = await api.getNotifications(page, limit, search, sort, "", "", { signal });
      // Drop a response that a newer search has already superseded.
      if (!isCurrent()) return;
      const data = res.data || {};
      setNotifications(data.notifications || []);
      const pagination = data.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setTotalData(pagination.total || 0);
    } catch (err) {
      if (!isCurrent() || isAbortError(err)) return;
      toast.error(err.message || "Failed to fetch notifications.");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, search, sort, beginRequest]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!notifications.length) return;
    const rows = notifications.map((n) => ({
      ID: n.id,
      Title: n.title,
      "Message Preview": n.messagePreview,
      "Recipient Type": n.recipientType,
      "Date & Time": formatDateTime(n.dateAndTime),
      Status: n.status,
    }));
    downloadCSV(rows, "notifications_export");
  };

  const handleView = async (n) => {
    setSelectedNotification(n);
    setShowDetailModal(true);
    try {
      setFetchingDetail(true);
      const res = await api.getNotificationById(n.id || n._id);
      if (res.data) {
        setSelectedNotification(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDetail(false);
    }
  };

  const handleEdit = async (n) => {
    try {
      const res = await api.getNotificationById(n.id || n._id);
      const fullData = res.data || n;
      setEditingNotification(fullData);
      const dateStr = fullData.scheduledFor || fullData.dateAndTime;
      let localDatetime = "";
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          localDatetime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        }
      }

      resetEdit({
        title: fullData.title,
        message: fullData.message || fullData.messagePreview || "",
        recipientType: fullData.recipientType?.toLowerCase() || "both",
        scheduledFor: localDatetime,
      });
      setShowEditModal(true);
    } catch (err) {
      toast.error("Failed to fetch notification details.");
    }
  };

  const onEditSubmit = async (data) => {
    if (!editingNotification) return;
    setUpdating(true);
    try {
      const payload = {
        title: data.title,
        message: data.message,
        recipientType: data.recipientType,
        scheduledFor: new Date(data.scheduledFor).toISOString(),
      };
      await api.updateNotification(editingNotification.id || editingNotification._id, payload);
      toast.success("Notification updated successfully!");
      setShowEditModal(false);
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to update notification");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scheduled notification?")) return;
    try {
      await api.deleteNotification(id);
      toast.success("Notification deleted successfully");
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to delete notification");
    }
  };

  const handlePreview = (formValues) => {
    if (isSpecific && !selectedUserId) {
      toast.error("Please select a recipient.");
      return;
    }
    setPreviewData({ ...formValues, recipientId: isSpecific ? selectedUserId : null });
    setShowPreviewModal(true);
  };

  const handleConfirmSend = async () => {
    if (!previewData) return;
    setSending(true);
    try {
      const specific = previewData.audienceType === "rider_only" || previewData.audienceType === "driver_only";
      let recipientType = "both";
      if (previewData.audienceType === "rider_only") {
        recipientType = "rider";
      } else if (previewData.audienceType === "driver_only") {
        recipientType = "driver";
      } else if (previewData.audienceType === "riders") {
        recipientType = "riders";
      } else if (previewData.audienceType === "drivers") {
        recipientType = "drivers";
      } else {
        recipientType = "both";
      }

      const payload = {
        title: previewData.title,
        message: previewData.message,
        recipientType,
      };
      if (specific && previewData.recipientId) {
        payload.recipientId = previewData.recipientId;
      }
      if (!specific && previewData.deliveryType === "scheduled" && previewData.scheduledFor) {
        payload.scheduledFor = new Date(previewData.scheduledFor).toISOString();
      }
      await api.sendNotification(payload);
      toast.success("Notification sent successfully!");
      setShowPreviewModal(false);
      setShowCreateModal(false);
      setPreviewData(null);
      setSelectedUserId(null);
      reset();
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const toggleSort = () => {
    setSort((s) => (s === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  // ── Table Columns ─────────────────────────────────────────────────────────────

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{val}</p>
          <p className="text-xs text-gray-500 truncate max-w-[260px] mt-0.5">{row.messagePreview}</p>
        </div>
      ),
    },
    {
      key: "recipientType",
      label: "Recipient Type",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {recipientIcon(val)}
          {val || "—"}
        </div>
      ),
    },
    {
      key: "dateAndTime",
      label: (
        <button
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          onClick={toggleSort}
        >
          Date &amp; Time
          {sort === "desc" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
        </button>
      ),
      render: (val) => (
        <div className="text-sm text-gray-600">{val ? formatDateTime(val) : "—"}</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge variant={statusVariant(val)}>{val || "Unknown"}</Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => handleView(row)}>
            View
          </Button>
          {row.status?.toLowerCase() === "scheduled" && (
            <>
              <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4 text-blue-600" />} onClick={() => handleEdit(row)} />
              <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-red-600" />} onClick={() => handleDelete(row.id || row._id)} />
            </>
          )}
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send and manage push notifications to riders and drivers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('downloadExcel') && (
            <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
              Export CSV
            </Button>
          )}
          {hasPermission('sendNotifications') && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => { reset(); setSelectedUserId(null); setShowCreateModal(true); }}
            >
              Send Notification
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <FilterBar
          searchable
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          searchPlaceholder="Search by title..."
          onClear={() => { setSearch(""); setPage(1); }}
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <DataTable
          title="Notification History"
          data={notifications}
          columns={columns}
          loading={loading}
          totalPages={totalPages}
          totalData={totalData}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
          pageSize={limit}
          addButton={false}
        />
      </Card>

      {/* ── Create / Send Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Send Push Notification"
        size="md"
      >
        <form onSubmit={handleSubmit(handlePreview)} className="space-y-5">
          {/* Recipient Type */}
          <Select
            label="Recipient Type"
            value={watchAudienceType}
            options={[
              { value: "both", label: "Both (Riders & Drivers)" },
              { value: "drivers", label: "Drivers Only" },
              { value: "riders", label: "Riders Only" },
              { value: "rider_only", label: "Rider Only (Single)" },
              { value: "driver_only", label: "Driver Only (Single)" },
            ]}
            {...register("audienceType", {
              required: "Recipient type is required",
              onChange: () => setSelectedUserId(null),
            })}
            error={errors.audienceType?.message}
            placeholder="Select recipient type"
          />

          {/* User Picker — single selection */}
          {isSpecific && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Select {watchAudienceType === "rider_only" ? "Rider" : "Driver"}
                {selectedUserId && (
                  <span className="ml-2 text-xs font-normal text-primary-600">(1 selected)</span>
                )}
              </label>
              <UserPicker
                type={watchAudienceType === "rider_only" ? "rider" : "driver"}
                selectedId={selectedUserId}
                onChange={setSelectedUserId}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <Input
              label="Notification Title"
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 60, message: "Max 60 characters" },
              })}
              error={errors.title?.message}
              placeholder="e.g., New ride available near you"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{watchTitle.length}/60</p>
          </div>

          {/* Message */}
          <div>
            <TextArea
              label="Message"
              {...register("message", {
                required: "Message is required",
                maxLength: { value: 500, message: "Max 500 characters" },
              })}
              rows={4}
              placeholder="Enter the notification message..."
              error={errors.message?.message}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{watchMessage.length}/500</p>
          </div>

          {/* Delivery — hidden for single user */}
          {!isSpecific && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="immediate" {...register("deliveryType")} />
                  <span className="text-sm">Send Immediately</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="scheduled" {...register("deliveryType")} />
                  <span className="text-sm">Schedule</span>
                </label>
              </div>
              {watchDeliveryType === "scheduled" && (
                <div className="mt-3">
                  <Input
                    min={new Date().toISOString().slice(0, 16)}
                    label="Scheduled Date & Time"
                    type="datetime-local"
                    {...register("scheduledFor", {
                      required: watchDeliveryType === "scheduled"
                        ? "Schedule date/time is required"
                        : false,
                    })}
                    error={errors.scheduledFor?.message}
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Send className="w-4 h-4" />}>
              Preview &amp; Send
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Preview / Confirm Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Preview Notification"
        size="md"
      >
        {previewData && (
          <div className="space-y-5">
            <div className="mx-auto w-full max-w-sm bg-gray-900 rounded-3xl p-4 shadow-2xl">
              <div className="bg-white rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#4338CA] flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Example Rides</p>
                </div>
                <p className="text-sm font-bold text-gray-900 break-words">{previewData.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed break-words whitespace-normal">{previewData.message}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Recipients</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {previewData.audienceType === "rider_only"
                    ? "1 Rider"
                    : previewData.audienceType === "driver_only"
                      ? "1 Driver"
                      : previewData.audienceType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-semibold text-gray-800">
                  {previewData.audienceType === "rider_only" || previewData.audienceType === "driver_only"
                    ? "Immediate"
                    : previewData.deliveryType === "scheduled" ? "Scheduled" : "Immediate"}
                </span>
              </div>
              {previewData.deliveryType === "scheduled" && previewData.scheduledFor && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled For</span>
                  <span className="font-semibold text-gray-800">{formatDateTime(previewData.scheduledFor)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowPreviewModal(false)}>Back</Button>
              <Button
                variant="success"
                icon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                onClick={handleConfirmSend}
                loading={sending}
                disabled={sending}
              >
                Confirm &amp; Send
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Notification Details"
        size="md"
      >
        {fetchingDetail ? (
          <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading details...</span>
          </div>
        ) : selectedNotification ? (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base  font-bold text-gray-900">{selectedNotification.title}</h3>
                <Badge className="capitalize" variant={statusVariant(selectedNotification.status)}>
                  {selectedNotification.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap">{selectedNotification.message || selectedNotification.messagePreview}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1 font-medium">Recipient Type</p>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  {recipientIcon(selectedNotification.recipientType)}
                  {selectedNotification.recipientType || "—"}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1 font-medium">Date &amp; Time</p>
                <p className="font-semibold text-gray-800">
                  {selectedNotification.dateAndTime || selectedNotification.scheduledFor ? formatDateTime(selectedNotification.dateAndTime || selectedNotification.scheduledFor) : "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ── Edit Scheduled Notification Modal ─────────────────────────────────── */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Scheduled Notification"
        size="md"
      >
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-5">
          <Select
            label="Recipient Type"
            options={[
              { value: "both", label: "Both (Riders & Drivers)" },
              { value: "drivers", label: "Drivers Only" },
              { value: "riders", label: "Riders Only" },
            ]}
            value={watchEdit("recipientType")}
            {...registerEdit("recipientType", { required: "Recipient type is required" })}
            error={errorsEdit.recipientType?.message}
          />
          <div>
            <Input
              label="Notification Title"
              {...registerEdit("title", {
                required: "Title is required",
                maxLength: { value: 60, message: "Max 60 characters" },
              })}
              error={errorsEdit.title?.message}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{watchEditTitle.length}/60</p>
          </div>
          <div>
            <TextArea
              label="Message"
              {...registerEdit("message", {
                required: "Message is required",
                maxLength: { value: 500, message: "Max 500 characters" },
              })}
              rows={4}
              error={errorsEdit.message?.message}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{watchEditMessage.length}/500</p>
          </div>
          <Input
            min={new Date().toISOString().slice(0, 16)}
            label="Scheduled Date & Time"
            type="datetime-local"
            {...registerEdit("scheduledFor", { required: "Schedule date/time is required" })}
            error={errorsEdit.scheduledFor?.message}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updating} disabled={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notifications;
