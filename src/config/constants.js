// App Configuration Constants
export const APP_CONFIG = {
  name: "Example Rides",
  version: "1.0.0",
  description: "Example Rides",
  author: "Example Rides",
  logo: "/logo.svg",
  supportEmail: "support@example.com",
  companyUrl: "https://example.com",
};

// Global Color Configuration - Dynamic Theme System
export const COLOR_CONFIG = {
  // Primary color (required) - Main brand color
  primary: {
    name: "Indigo",
    hex: "#4F46E5",
    rgb: "79, 70, 229",
    enabled: true, // Set to false to disable secondary color
  },
  // Secondary color (optional) - Accent color
  secondary: {
    name: "Amber",
    hex: "#F59E0B",
    rgb: "245, 158, 11",
    enabled: true,
  },
};

// Theme Options Configuration
export const THEME_OPTIONS = {
  enableThemeToggle: true, // Set to false to disable theme switching
  defaultTheme: "light", // 'light' or 'dark'
  forceTheme: "light", // Set to 'light' or 'dark' to force a single theme (disables toggle)
  enableSecondaryColor: COLOR_CONFIG.secondary.enabled,
  // Theme persistence
  persistTheme: true, // Save theme preference to localStorage
  respectSystemTheme: true, // Respect system dark/light mode preference
};

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:8080",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  formDataHeaders: {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  },
  // Stripe Configuration (for revenue tracking)
  stripe: {
    enabled: true, // Set to false to disable Stripe features
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",
    webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || "",
  },
};

// Florida Cities Configuration
export const FLORIDA_CITIES = [
  { value: "Jacksonville", label: "Jacksonville, FL" },
  { value: "Miami", label: "Miami, FL" },
  { value: "Tampa", label: "Tampa, FL" },
  { value: "Orlando", label: "Orlando, FL" },
  { value: "St. Petersburg", label: "St. Petersburg, FL" },
  { value: "Hialeah", label: "Hialeah, FL" },
  { value: "Tallahassee", label: "Tallahassee, FL" },
  { value: "Fort Lauderdale", label: "Fort Lauderdale, FL" },
  { value: "Port St. Lucie", label: "Port St. Lucie, FL" },
  { value: "Cape Coral", label: "Cape Coral, FL" },
  { value: "Pembroke Pines", label: "Pembroke Pines, FL" },
  { value: "Hollywood", label: "Hollywood, FL" },
  { value: "Miramar", label: "Miramar, FL" },
  { value: "Gainesville", label: "Gainesville, FL" },
  { value: "Coral Springs", label: "Coral Springs, FL" },
  { value: "Clearwater", label: "Clearwater, FL" },
  { value: "Palm Bay", label: "Palm Bay, FL" },
  { value: "Pompano Beach", label: "Pompano Beach, FL" },
  { value: "Lakeland", label: "Lakeland, FL" },
  { value: "West Palm Beach", label: "West Palm Beach, FL" },
  { value: "Miami Gardens", label: "Miami Gardens, FL" },
  { value: "Sarasota", label: "Sarasota, FL" },
  { value: "Fort Myers", label: "Fort Myers, FL" },
  { value: "Naples", label: "Naples, FL" },
  { value: "Pensacola", label: "Pensacola, FL" },
  { value: "Daytona Beach", label: "Daytona Beach, FL" },
  { value: "Ocala", label: "Ocala, FL" },
];

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxVisiblePages: 5,
};

// Date Format Configuration
export const DATE_CONFIG = {
  format: "MM/dd/yyyy",
  timeFormat: "HH:mm:ss",
  dateTimeFormat: "MM/dd/yyyy HH:mm:ss",
  timezone: "UTC",
};

// Navigation Menu Items
export const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/dashboard",
    children: [],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: "User",
    path: "/user-management",
    children: [
      // {
      //   id: "riders",
      //   label: "Riders",
      //   path: "/riders",
      // },
      // {
      //   id: "drivers",
      //   label: "Drivers",
      //   path: "/drivers",
      // },
    ],
  },
  {
    id: "driver-management",
    label: "Driver Requests ",
    icon: "User",
    path: "/driver-requests",
    children: [],
  },
  {
    id: "suspended-drivers",
    label: "Suspended Drivers",
    icon: "UserX",
    path: "/suspended-drivers",
    children: [],
  },
  {
    id: "rewarded-balance-history",
    label: "Rewarded Balance",
    icon: "Coins",
    path: "/rewarded-balance-history",
    children: [],
  },
  {
    id: "admin-management",
    label: "Admin Management",
    icon: "ShieldAlert",
    path: "/admin-users",
    children: [],
  },
  {
    id: "vehicle-category",
    label: "Vehicle Category",
    icon: "Car",
    path: "/vehicle-category",
    children: [],
  },
  // {
  //   id: "content-management",
  //   label: "Content Management",
  //   icon: "FileText",
  //   path: "/content-management",
  //   children: [],
  // },
  {
    id: "reports",
    label: "Reports",
    icon: "Info",
    path: "/reports",
    children: [],
  },
  // {
  //   id: "reports",
  //   label: "Reports Management",
  //   icon: "FileSpreadsheet",
  //   path: "/reports-management",
  //   children: [],
  // },
  {
    id: "notifications",
    label: "Notifications",
    icon: "Bell",
    path: "/notifications",
    children: [],
  },
  {
    id: "revenue",
    label: "Revenue",
    icon: "BadgeDollarSign",
    path: "/revenue",
    children: [],
  },
  {
    id: "private-rides",
    label: "Private Rides",
    icon: "Car",
    path: "/private-rides",
    children: [],
  },
  {
    id: "carpool-rides",
    label: "Carpool Rides",
    icon: "Users",
    path: "/carpool-rides",
    children: [],
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: "Tag",
    path: "/campaigns",
    children: [],
  },
  {
    id: "ride-rates",
    label: "Ride Rates",
    icon: "Gauge",
    path: "/ride-rates",
    children: [],
  },
  {
    id: "peak-windows",
    label: "Peak Windows",
    icon: "Clock3",
    path: "/peak-windows",
    children: [],
  },
  {
    id: "ride-configuration",
    label: "Ride Configuration",
    icon: "SlidersHorizontal",
    path: "/ride-configuration",
    children: [],
  },
  {
    id: "birds-eye-view",
    label: "Bird's Eye View",
    icon: "Map",
    path: "/birds-eye-view",
    children: [],
  },
  // {
  //   id: "history",
  //   label: "History",
  //   icon: "ShieldAlert",
  //   path: "/history",
  //   children: [],
  // },
  // {
  //   id: "products",
  //   label: "Products",
  //   icon: "Package",
  //   path: "/products",
  //   children: [
  //     { id: "products-list", label: "All Products", path: "/products" },
  //     { id: "categories", label: "Categories", path: "/products/categories" },
  //   ],
  // },
  // {
  //   id: "orders",
  //   label: "Orders",
  //   icon: "ShoppingCart",
  //   path: "/orders",
  //   children: [],
  // },
  // {
  //   id: "settings",
  //   label: "Settings",
  //   icon: "Settings",
  //   path: "/settings",
  //   children: [
  //     // {
  //     //   id: "configs",
  //     //   label: "Configurations",
  //     //   path: "/settings/configs",
  //     // },
  //     {
  //       id: "change-password",
  //       label: "Change Password",
  //       path: "/settings/change-password",
  //     },
  //   ],
  // },
];

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  GENERAL: "general",
};

// RBAC Permissions
export const PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: {
    downloadExcel: true,
    approveDriversVehicles: true,
    seeSensitiveData: true,
    sendNotifications: true,
    birdsEye: true,
    cancelledRides: true,
    vehicleCategory: true,
    financials: true,
    promos: true,
    balancePoints: true,
    manageUsers: true,
    viewUsersOnly: false,
    viewDriverRequests: true,
  },
  [USER_ROLES.ADMIN]: {
    downloadExcel: false,
    approveDriversVehicles: true,
    seeSensitiveData: true,
    sendNotifications: true,
    birdsEye: true,
    cancelledRides: true,
    vehicleCategory: true,
    financials: false,
    promos: false,
    balancePoints: false,
    manageUsers: true,
    viewUsersOnly: false,
    viewDriverRequests: true,
  },
  [USER_ROLES.GENERAL]: {
    downloadExcel: false,
    approveDriversVehicles: false,
    seeSensitiveData: false,
    sendNotifications: false,
    birdsEye: true,
    cancelledRides: true,
    vehicleCategory: false,
    financials: false,
    promos: false,
    balancePoints: false,
    manageUsers: false,
    viewUsersOnly: true,
    viewDriverRequests: false,
  },
};

// User Status Options
export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
};

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_OTP: "/auth/verify-otp",
  RESET_PASSWORD: "/auth/reset-password",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ALL_USERS: "all_users",
  ROLE_BASED: "role_based",
  SPECIFIC_USERS: "specific_users",
  ACTIVE_USERS: "active_users",
  INACTIVE_USERS: "inactive_users",
};

// Transaction Statuses
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

// Support Ticket Statuses
export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Support Ticket Priorities
export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// Report Types
export const REPORT_TYPES = {
  USER_REPORT: "user_report",
  CONTENT_REPORT: "content_report",
  SPAM_REPORT: "spam_report",
  ABUSE_REPORT: "abuse_report",
  OTHER: "other",
};

// Report Statuses
export const REPORT_STATUS = {
  PENDING: "pending",
  INVESTIGATING: "investigating",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

// Chart Colors (using primary/secondary theme)
export const CHART_COLORS = {
  primary: COLOR_CONFIG.primary.hex,
  secondary: COLOR_CONFIG.secondary.hex,
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  gray: "#6b7280",
};

// Dashboard Metrics Configuration
export const DASHBOARD_METRICS = {
  refreshInterval: 30000, // 30 seconds
  chartAnimationDuration: 1000,
  realtimeUpdates: true,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/csv",
  ],
  maxFiles: 5,
};

// Email Configuration
export const EMAIL_CONFIG = {
  templates: {
    welcome: "welcome",
    passwordReset: "password_reset",
    notification: "notification",
    support: "support_reply",
  },
  providers: {
    smtp: "smtp",
    sendgrid: "sendgrid",
    mailgun: "mailgun",
  },
};

// Security Configuration
export const SECURITY_CONFIG = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  maxLoginAttempts: 5,
  lockoutDuration: 2 * 60 * 1000, // 2 minutes
  otpLength: 6,
  otpExpiry: 10 * 60 * 1000, // 10 minutes
  sessionTimeout: 15 * 60 * 1000, // 15 minutes of inactivity before auto-logout
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enableReports: true,
  enableNotifications: true,
  enableChat: true,
  enableFileUpload: true,
  enableExport: true,
  enableBulkActions: true,
  enableAdvancedFilters: true,
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const RIDERS = [
  {
    id: 1,
    name: "Alice Morgan",
    email: "alice@example.com",
    phone: "+1 555-0101",
    status: "active",
    registeredAt: "2024-01-10",
    avatar: null,
    rating: 4.7,
    ridesCompleted: 42,
    ridesCancelled: 3,
    walletBalance: 35.5,
    lastLogin: "2024-06-01",
    lastRide: "2024-05-31",
    transactions: [
      { date: "2024-05-31", desc: "Ride Payment", type: "debit", amount: 12.0 },
      {
        date: "2024-05-28",
        desc: "Wallet Top-up",
        type: "credit",
        amount: 50.0,
      },
      { date: "2024-05-20", desc: "Ride Payment", type: "debit", amount: 8.5 },
    ],
    rideHistory: [
      {
        id: "R001",
        date: "2024-05-31",
        from: "Downtown",
        to: "Airport",
        fare: 12.0,
        status: "completed",
      },
      {
        id: "R002",
        date: "2024-05-20",
        from: "Mall",
        to: "Home",
        fare: 8.5,
        status: "completed",
      },
      {
        id: "R003",
        date: "2024-05-10",
        from: "Office",
        to: "Hotel",
        fare: 15.0,
        status: "cancelled",
      },
    ],
  },
  {
    id: 2,
    name: "Brian Lee",
    email: "brian@example.com",
    phone: "+1 555-0102",
    status: "active",
    registeredAt: "2024-02-14",
    avatar: null,
    rating: 4.2,
    ridesCompleted: 18,
    ridesCancelled: 7,
    walletBalance: 12.0,
    lastLogin: "2024-05-30",
    lastRide: "2024-05-29",
    transactions: [
      { date: "2024-05-29", desc: "Ride Payment", type: "debit", amount: 9.0 },
      {
        date: "2024-05-15",
        desc: "Wallet Top-up",
        type: "credit",
        amount: 20.0,
      },
    ],
    rideHistory: [
      {
        id: "R004",
        date: "2024-05-29",
        from: "Station",
        to: "University",
        fare: 9.0,
        status: "completed",
      },
    ],
  },
  {
    id: 3,
    name: "Clara Diaz",
    email: "clara@example.com",
    phone: "+1 555-0103",
    status: "deactivated",
    registeredAt: "2024-03-05",
    avatar: null,
    rating: 3.9,
    ridesCompleted: 5,
    ridesCancelled: 12,
    walletBalance: 0,
    lastLogin: "2024-04-10",
    lastRide: "2024-04-09",
    transactions: [],
    rideHistory: [],
  },
  {
    id: 4,
    name: "David Kim",
    email: "david@example.com",
    phone: "+1 555-0104",
    status: "active",
    registeredAt: "2024-01-22",
    avatar: null,
    rating: 4.9,
    ridesCompleted: 87,
    ridesCancelled: 1,
    walletBalance: 65.2,
    lastLogin: "2024-06-01",
    lastRide: "2024-06-01",
    transactions: [
      { date: "2024-06-01", desc: "Ride Payment", type: "debit", amount: 22.0 },
      {
        date: "2024-05-30",
        desc: "Wallet Top-up",
        type: "credit",
        amount: 100.0,
      },
    ],
    rideHistory: [
      {
        id: "R005",
        date: "2024-06-01",
        from: "Park",
        to: "Office",
        fare: 22.0,
        status: "completed",
      },
    ],
  },
];

export const DRIVERS = [
  {
    id: 1,
    name: "Ethan Brown",
    email: "ethan@example.com",
    phone: "+1 555-0201",
    status: "active",
    registeredAt: "2023-11-01",
    avatar: null,
    rating: 4.8,
    ridesCompleted: 210,
    ridesCancelled: 5,
    walletBalance: 320.0,
    totalWithdrawals: 2800.0,
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-12-31",
    lastLogin: "2024-06-01",
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: "2021",
      plate: "ABC-1234",
      color: "Silver",
    },
    documents: {
      license: "Verified",
      registration: "Verified",
      insurance: "Verified",
    },
    feedback: [
      {
        rider: "Alice Morgan",
        rating: 5,
        comment: "Very punctual and friendly!",
      },
      { rider: "David Kim", rating: 5, comment: "Clean car, smooth ride." },
      { rider: "Brian Lee", rating: 4, comment: "Good driver, slight detour." },
    ],
    transactions: [
      {
        date: "2024-06-01",
        desc: "Ride Earnings",
        type: "credit",
        amount: 45.0,
      },
      { date: "2024-05-30", desc: "Withdrawal", type: "debit", amount: 200.0 },
      {
        date: "2024-05-28",
        desc: "Ride Earnings",
        type: "credit",
        amount: 38.0,
      },
    ],
    rideHistory: [
      {
        id: "D001",
        date: "2024-06-01",
        from: "Airport",
        to: "Downtown",
        fare: 45.0,
        status: "completed",
      },
      {
        id: "D002",
        date: "2024-05-28",
        from: "Mall",
        to: "Hotel",
        fare: 38.0,
        status: "completed",
      },
    ],
  },
  {
    id: 2,
    name: "Fiona Walsh",
    email: "fiona@example.com",
    phone: "+1 555-0202",
    status: "active",
    registeredAt: "2024-01-15",
    avatar: null,
    rating: 4.5,
    ridesCompleted: 95,
    ridesCancelled: 8,
    walletBalance: 145.0,
    totalWithdrawals: 950.0,
    subscriptionStatus: "active",
    subscriptionExpiry: "2024-09-15",
    lastLogin: "2024-05-31",
    vehicle: {
      make: "Honda",
      model: "Civic",
      year: "2020",
      plate: "XYZ-5678",
      color: "White",
    },
    documents: {
      license: "Verified",
      registration: "Verified",
      insurance: "Pending",
    },
    feedback: [{ rider: "Clara Diaz", rating: 4, comment: "Decent ride." }],
    transactions: [
      {
        date: "2024-05-31",
        desc: "Ride Earnings",
        type: "credit",
        amount: 28.0,
      },
      { date: "2024-05-20", desc: "Withdrawal", type: "debit", amount: 100.0 },
    ],
    rideHistory: [
      {
        id: "D003",
        date: "2024-05-31",
        from: "Station",
        to: "Park",
        fare: 28.0,
        status: "completed",
      },
    ],
  },
  {
    id: 3,
    name: "George Tan",
    email: "george@example.com",
    phone: "+1 555-0203",
    status: "deactivated",
    registeredAt: "2023-08-20",
    avatar: null,
    rating: 3.6,
    ridesCompleted: 30,
    ridesCancelled: 20,
    walletBalance: 0,
    totalWithdrawals: 400.0,
    subscriptionStatus: "expired",
    subscriptionExpiry: "2024-02-28",
    lastLogin: "2024-03-01",
    vehicle: {
      make: "Ford",
      model: "Focus",
      year: "2018",
      plate: "DEF-9012",
      color: "Black",
    },
    documents: {
      license: "Verified",
      registration: "Expired",
      insurance: "Expired",
    },
    feedback: [],
    transactions: [],
    rideHistory: [],
  },
];
