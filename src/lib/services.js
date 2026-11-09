import axios from "axios";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";

// Uses VITE_BASE_URL from the environment — falls back to a local API.
const BASE_URL = `${import.meta.env.VITE_BASE_URL || "http://localhost:8080"}/api/admin/`;

// Create an Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken");
    // console.log("req token: ", token);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("autoLogoutRedirectUrl");
      sessionStorage.removeItem("redirectUrl");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/auth/login";
      }
    }
    // Cancelled requests are expected (a newer search replaced this one) — don't
    // log them and don't treat them as auth failures.
    if (!axios.isCancel?.(error) && error?.code !== "ERR_CANCELED") {
      console.log("API Error:", error.response?.data || error);
    }
    return Promise.reject(error);
  },
);

// Centralized API Handling functions start

/**
 * True when a request was deliberately cancelled (a newer search superseded it),
 * rather than having actually failed. Callers use this to stay silent instead of
 * showing an error toast.
 */
export const isAbortError = (error) =>
  Boolean(
    error &&
    (error.isCanceled === true ||
      error.code === "ERR_CANCELED" ||
      error.name === "CanceledError" ||
      error.name === "AbortError" ||
      axios.isCancel?.(error)),
  );

const handleApiError = (error) => {
  // A cancelled request is not a failure. Rethrow it tagged so it survives the
  // conversion to a plain Error below and callers can recognise and ignore it.
  if (isAbortError(error)) {
    const canceled = new Error("Request canceled");
    canceled.isCanceled = true;
    canceled.code = "ERR_CANCELED";
    throw canceled;
  }

  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    throw new Error(errorMessage);
  }
  throw new Error(error?.message || error || "An Unexpected error occurred");
};
const formatStartDateForApi = (date) => {
  if (!date) return "";
  if (date.includes("T")) return date;
  return `${date}T00:00:00.000Z`;
};

const formatEndDateForApi = (date) => {
  if (!date) return "";
  if (date.includes("T")) return date;
  return `${date}T23:59:59.999Z`;
};

const handleApiResponse = (response) => {
  const responseData = response.data;
  console.log("API response run");

  // Check if success is false and throw an error
  if (!responseData.success) {
    throw new Error(
      responseData.message || "Something went wrong, Please try again!",
    );
  }

  return responseData; // Only return the response data {status, message, data}
};

const apiHandler = async (apiCall) => {
  try {
    const response = await apiCall();
    return handleApiResponse(response);
  } catch (error) {
    if (!isAbortError(error)) console.log(error);
    throw handleApiError(error);
  }
};

// Centralized API Handling functions end

// Auth APIs

const login = (credentials) =>
  apiHandler(() =>
    API.post(
      "login",
      { email: credentials.email, password: credentials.password },
      {
        headers: {
          deviceuniqueid: credentials.deviceuniqueid,
          devicemodel: credentials.devicemodel,
        },
      },
    ),
  );

const forgotPassword = (payload) =>
  apiHandler(() => API.post("forgot-password", payload));

const verifyOTP = (payload) =>
  apiHandler(() => API.post("verify-otp", payload));

const resetPassword = (payload) =>
  apiHandler(() => API.post("reset-password", payload));

const updatePassword = (payload) =>
  apiHandler(() => API.put("update-password", payload));

const updatePasswordAuth = (payload) =>
  apiHandler(() => API.post("/auth/update-password-auth", payload));

const logout = () => apiHandler(() => API.post("/auth/logout"));

// App Configs API
const getAppConfigs = () => apiHandler(() => API.get("/global/config"));

const updateAppConfigs = (payload) =>
  apiHandler(() => API.put("/global/config", payload));

const getDashboardStats = (config) => apiHandler(() => API.get("/dashboard-stats", config));

const getRideAnalytics = (params = {}, config = {}) =>
  apiHandler(() => API.get("/ride-analytics", { ...config, params }));

// Products API
const createProduct = (productData) =>
  apiHandler(() =>
    API.post(`/product`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );

const getAllProducts = (
  search,
  status,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  config,
) =>
  apiHandler(() =>
    API.get(
      `/product?page=${page}&limit=${limit}&search=${search}&status=${status}`,
      config,
    ),
  );

const updateProduct = (id, productData) =>
  apiHandler(() => API.put(`/product/${id}`, productData));

const deleteProduct = (id) => apiHandler(() => API.delete(`/product/${id}`));

const getProductById = (id) => apiHandler(() => API.get(`/product/${id}`));

// Categories API
const createCategory = (categoryData) =>
  apiHandler(() => API.post(`/category`, categoryData));

const getAllCategories = (
  status, // active or inactive
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
) =>
  apiHandler(() =>
    API.get(`/category?status=${status}&page=${page}&limit=${limit}`),
  );

const updateCategory = (id, categoryData) =>
  apiHandler(() => API.put(`/category/${id}`, categoryData));

const deleteCategory = (id) => apiHandler(() => API.delete(`/category/${id}`));

const getCategoryById = (id) => apiHandler(() => API.get(`/category/${id}`));

// Orders API
const getOrders = (
  paymentStatus,
  orderStatus,
  orderType,
  startDate,
  endDate,
  search,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  config,
) =>
  apiHandler(() =>
    API.get(
      `/order?paymentStatus=${paymentStatus}&orderStatus=${orderStatus}&orderType=${orderType}&startDate=${formatStartDateForApi(startDate)}&endDate=${formatEndDateForApi(endDate)}&search=${search}&page=${page}&limit=${limit}`,
      config,
    ),
  );

const getOrdersByContact = (contactEmail) =>
  apiHandler(() => API.get(`/order/contact?email=${contactEmail}`));

const getOrderById = (id) => apiHandler(() => API.get(`/order/${id}`));

const updateOrder = (id, orderData) =>
  apiHandler(() => API.put(`/order/${id}`, orderData));

const getAllDocs = (
  search,
  status,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  config,
) =>
  apiHandler(() =>
    API.get(
      `/docs?status=${status}&page=${page}&limit=${limit}&search=${search}`,
      config,
    ),
  );
const getDriverDocs = (driverId) =>
  apiHandler(() => API.get(`/docs?driverId=${driverId}&limit=${100}`));
const getDriverVehicles = (driverId) =>
  apiHandler(() => API.get(`/vehicles?driverId=${driverId}`));

const updateDocs = (documentsList = [], vehiclesList = []) =>
  apiHandler(() => {
    const mergedDocuments = [
      ...documentsList.map((d) => ({
        id: d.id || d._id,
        status: d.status,
        ...(d.rejectReason && { rejectReason: d.rejectReason }),
        ...(d.metadata && { metadata: d.metadata }),
      })),
      ...vehiclesList.map((v) => ({
        id: v.id || v._id,
        status: v.status,
        ...(v.rejectReason && { rejectReason: v.rejectReason }),
        ...(v.metadata && { metadata: v.metadata }),
      })),
    ];

    return API.put(`/docs/respond`, {
      documents: mergedDocuments,
    });
  });

// Vehicle Types API
const getAllVehicleTypes = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  rideType = "",
  config,
) =>
  apiHandler(() => {
    let url = `/vehicle-types?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (rideType) url += `&rideType=${rideType}`;
    return API.get(url, config);
  });

// Admin Users API
const createAdminUser = (data) =>
  apiHandler(() => API.post(`/admin-users`, data));
const getAdminUsers = (
  page = 1,
  limit = 10,
  role = "",
  search = "",
  sort = "desc",
  config,
) =>
  apiHandler(() => {
    let url = `/admin-users?page=${page}&limit=${limit}&sort=${sort}`;
    if (role) url += `&role=${role}`;
    if (search) url += `&search=${search}`;
    return API.get(url, config);
  });
const updateAdminUser = (id, data) =>
  apiHandler(() => API.patch(`/admin-users/${id}`, data));
const deleteAdminUser = (id) =>
  apiHandler(() => API.delete(`/admin-users/${id}`));

const createVehicleType = (payload) =>
  apiHandler(() => API.post("/vehicle-types", payload));

const updateVehicleType = (id, payload) =>
  apiHandler(() => API.put(`/vehicle-types/${id}`, payload));

const deleteVehicleType = (id) =>
  apiHandler(() => API.delete(`/vehicle-types/${id}`));

// User Management API
const getUsers = (
  type,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  startDate = "",
  endDate = "",
  config,
) =>
  apiHandler(() => {
    let url = `/users?type=${type}&page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    return API.get(url, config);
  });

const exportUsers = (
  type,
  { status, sort, startDate, endDate, search, fields } = {},
) => {
  const params = new URLSearchParams();
  params.append("type", type);
  if (status) params.append("status", status);
  if (sort) params.append("sort", sort);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (search) params.append("search", search);
  if (fields?.length) fields.forEach((f) => params.append("fields", f));
  // Bypass apiHandler — response is raw CSV, not JSON with {success}
  return API.get(`/users/export?${params.toString()}`, {
    responseType: "blob",
  });
};

const getDrivers = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  status = "",
  config,
  requirements = "",
) =>
  apiHandler(() => {
    let url = `/drivers?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;
    if (requirements) url += `&requirements=${encodeURIComponent(requirements)}`;
    return API.get(url, config);
  });

const getRequestsCount = () => apiHandler(() => API.get("/requests-count"));

const getUserDetail = (id, type, config) =>
  apiHandler(() => API.get(`/users/${id}?type=${type}`, config));

const updateUserStatus = (id, type, status) =>
  apiHandler(() => API.patch(`/users/${id}/status`, { type, status }));

const updateUser = (id, data) =>
  apiHandler(() => API.patch(`/users/${id}`, data));

const deleteUser = (id, type) =>
  apiHandler(() => API.delete(`/users/${id}?type=${type}`));

const getDriverTransactions = (driverId, page = 1, limit = 10) =>
  apiHandler(() =>
    API.get(`/drivers/${driverId}/transactions?page=${page}&limit=${limit}`),
  );

const getBirdsEyeView = (config) => apiHandler(() => API.get("/birds-eye-view", config));

const getSubscriptionRevenue = (
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  status = "",
  config,
) =>
  apiHandler(() => {
    let url = `/subscription-revenue?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    if (status) url += `&subscriptionStatus=${status}`;
    return API.get(url, config);
  });

const getWithdrawalRevenue = (
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  config,
) =>
  apiHandler(() => {
    let url = `/withdrawals?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    return API.get(url, config);
  });

const getReports = (page = 1, limit = 10, status = "", sort = "desc", config) =>
  apiHandler(() => {
    let url = `/reports?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return API.get(url, config);
  });

const getNotifications = (
  page = 1,
  limit = 10,
  search = "",
  sort = "desc",
  startDate = "",
  endDate = "",
  config,
) =>
  apiHandler(() => {
    let url = `/notifications?page=${page}&limit=${limit}&sort=${sort}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    return API.get(url, config);
  });

const sendNotification = (payload) =>
  apiHandler(() => API.post("/notifications", payload));

const getAdminNotifications = (page = 1, limit = 10) =>
  apiHandler(() => API.get(`/notifications/mine?page=${page}&limit=${limit}`));

const getNotificationById = (id) =>
  apiHandler(() => API.get(`/notifications/${id}`));

const updateNotification = (id, payload) =>
  apiHandler(() => API.patch(`/notifications/${id}`, payload));

const deleteNotification = (id) =>
  apiHandler(() => API.delete(`/notifications/${id}`));

const getRides = (
  page = 1,
  limit = 10,
  search = "",
  rideStatus = "",
  startDate = "",
  endDate = "",
  config,
) =>
  apiHandler(() => {
    let url = `/rides?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (rideStatus) url += `&rideStatus=${rideStatus}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    return API.get(url, config);
  });

const resolveReport = (id, adminNotes = "") =>
  apiHandler(() => API.patch(`/reports/${id}/resolved`, { adminNotes }));

const getReportById = (id) => apiHandler(() => API.get(`/reports/${id}`));

const exportRides = (status, startDate = "", endDate = "") => {
  let url = `/rides/export?status=${status}`;
  if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
  if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
  return API.get(url, { responseType: "blob" });
};

const getRideById = (id) => apiHandler(() => API.get(`/rides/${id}`));

const getJourneyTimeline = (journeyType, id) =>
  apiHandler(() => API.get(`/journeys/${journeyType}/${id}/timeline`));

const getCarpoolRides = (
  page = 1,
  limit = 10,
  search = "",
  status = "",
  startDate = "",
  endDate = "",
  sort = "desc",
  config,
) =>
  apiHandler(() => {
    let url = `/carpool-rides?page=${page}&limit=${limit}&sort=${sort}`;
    if (search) url += `&search=${search}`;
    if (status) url += `&status=${status}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    return API.get(url, config);
  });

const getCarpoolRideById = (id) =>
  apiHandler(() => API.get(`/carpool-rides/${id}`));

const exportCarpoolRides = (status, startDate = "", endDate = "") => {
  let url = `/carpool-rides/export?status=${status}`;
  if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
  if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
  return API.get(url, { responseType: "blob" });
};

// Suspended Drivers API
const getSuspendedDrivers = (
  page = 1,
  limit = 10,
  suspensionType = "all",
  search = "",
  config,
) =>
  apiHandler(() => {
    let url = `/drivers/suspended?page=${page}&limit=${limit}`;
    if (suspensionType) url += `&suspensionType=${suspensionType}`;
    if (search) url += `&search=${search}`;
    return API.get(url, config);
  });

const getDriverSuspensionDetails = (id) =>
  apiHandler(() => API.get(`/drivers/${id}/suspension`));

const suspendDriver = (id, payload) =>
  apiHandler(() => API.post(`/drivers/${id}/suspend`, payload));

const unsuspendDriver = (id) =>
  apiHandler(() => API.post(`/drivers/${id}/unsuspend`));

// Rewarded Balance History
const getRewardedBalanceHistory = (
  page = 1,
  limit = 10,
  userType = "all",
  search = "",
  startDate = "",
  endDate = "",
  sortBy = "createdAt",
  order = "desc",
  config,
) =>
  apiHandler(() => {
    let url = `/rewarded-balance-history?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`;
    if (userType && userType !== "all") url += `&userType=${userType}`;
    if (search) url += `&search=${search}`;
    if (startDate) url += `&startDate=${formatStartDateForApi(startDate)}`;
    if (endDate) url += `&endDate=${formatEndDateForApi(endDate)}`;
    return API.get(url, config);
  });

// Campaigns API
const getCampaigns = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  status = "",
) => {
  let url = `/campaigns?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  return apiHandler(() => API.get(url));
};

const getCampaignById = (id) => apiHandler(() => API.get(`/campaigns/${id}`));

const createCampaign = (payload) =>
  apiHandler(() => API.post("/campaigns", payload));

const updateCampaign = (id, payload) =>
  apiHandler(() => API.patch(`/campaigns/${id}`, payload));

const updateCampaignStatus = (id, status) =>
  apiHandler(() => API.patch(`/campaigns/${id}/status`, { status }));

const deleteCampaign = (id) => apiHandler(() => API.delete(`/campaigns/${id}`));

const getCampaignStats = (id) =>
  apiHandler(() => API.get(`/campaigns/${id}/stats`));

const getCampaignRedemptions = (
  id,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
  search = "",
  config,
) => {
  let url = `/campaigns/${id}/redemptions?page=${page}&limit=${limit}`;
  if (search) url += `&search=${search}`;
  return apiHandler(() => API.get(url, config));
};

const getGeneratedCodes = (
  id,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize,
) =>
  apiHandler(() =>
    API.get(`/campaigns/${id}/codes?page=${page}&limit=${limit}`),
  );

const getUserRedemptionHistory = (campaignId, userId) =>
  apiHandler(() => API.get(`/campaigns/${campaignId}/redemptions/${userId}`));

// Ride Rates & Peak Windows API
const getRideRates = (cityName) => {
  if (typeof cityName === "string" && cityName.trim()) {
    return apiHandler(() =>
      API.get(`/ride-rates?cityName=${encodeURIComponent(cityName.trim())}`),
    );
  }
  if (cityName && typeof cityName === "object") {
    const searchVal = cityName.cityName || cityName.city;
    if (searchVal && typeof searchVal === "string" && searchVal.trim()) {
      return apiHandler(() =>
        API.get(`/ride-rates?cityName=${encodeURIComponent(searchVal.trim())}`),
      );
    }
  }
  return apiHandler(() => API.get("/ride-rates"));
};

const updateRideRate = (rideType, payload) =>
  apiHandler(() => API.put(`/ride-rates/${rideType}`, payload));

const createCityRideRate = (payload) =>
  apiHandler(() => API.post("/city-ride-rates", payload));

const updateCityRideRate = (id, payload) =>
  apiHandler(() => API.put(`/city-ride-rates/${id}`, payload));

const deleteCityRideRate = (id) =>
  apiHandler(() => API.delete(`/city-ride-rates/${id}`));

const getPeakWindows = () => apiHandler(() => API.get("/peak-windows"));

const createPeakWindow = (payload) =>
  apiHandler(() => API.post("/peak-windows", payload));

const updatePeakWindow = (id, payload) =>
  apiHandler(() => API.put(`/peak-windows/${id}`, payload));

const deletePeakWindow = (id) =>
  apiHandler(() => API.delete(`/peak-windows/${id}`));

// Ride Configuration API
const getRideConfiguration = () =>
  apiHandler(() => API.get("/ride-configuration"));

const updateRideConfiguration = (payload) =>
  apiHandler(() => API.patch("/ride-configuration", payload));

export const api = {
  getUsers,
  exportUsers,
  getDrivers,
  getRequestsCount,
  getUserDetail,
  getDriverDocs,
  getDriverVehicles,
  updateUserStatus,
  updateUser,
  deleteUser,
  getDriverTransactions,
  getBirdsEyeView,
  getSubscriptionRevenue,
  getWithdrawalRevenue,
  updateDocs,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updatePassword,
  updatePasswordAuth,
  logout,
  getAppConfigs,
  updateAppConfigs,
  getDashboardStats,
  getRideAnalytics,
  getAllProducts,
  getAllCategories,
  createProduct,
  createCategory,
  updateProduct,
  deleteProduct,
  getProductById,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getOrders,
  getOrdersByContact,
  getOrderById,
  updateOrder,
  getAllDocs,
  getAllVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getReports,
  resolveReport,
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getReportById,
  getNotifications,
  sendNotification,
  getAdminNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getRides,
  getRideById,
  getJourneyTimeline,
  exportRides,
  getCarpoolRides,
  getCarpoolRideById,
  exportCarpoolRides,
  getSuspendedDrivers,
  getDriverSuspensionDetails,
  suspendDriver,
  unsuspendDriver,
  getRewardedBalanceHistory,
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
  getCampaignStats,
  getCampaignRedemptions,
  getGeneratedCodes,
  getUserRedemptionHistory,
  getRideRates,
  updateRideRate,
  createCityRideRate,
  updateCityRideRate,
  deleteCityRideRate,
  getPeakWindows,
  createPeakWindow,
  updatePeakWindow,
  deletePeakWindow,
  getRideConfiguration,
  updateRideConfiguration,
};
