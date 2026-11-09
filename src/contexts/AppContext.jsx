import React, { createContext, useContext, useState, useEffect } from "react";
import { MENU_ITEMS, PERMISSIONS, USER_ROLES } from "../config/constants";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appConfigs, setAppConfigs] = useState(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);

  const { user } = useAuth();

  // Filter menu items based on feature flags and configurations
  const getFilteredMenuItems = () => {
    if (!user || !user.role) return MENU_ITEMS;
    
    const userRole = user.role.toLowerCase();
    // Default to general if unknown role
    const permissions = PERMISSIONS[userRole] || PERMISSIONS[USER_ROLES.GENERAL];

    return MENU_ITEMS.filter((item) => {
      switch (item.id) {
        case "admin-management":
          return userRole === USER_ROLES.SUPER_ADMIN;
        case "driver-management":
          return permissions.viewDriverRequests;
        case "vehicle-category":
          return permissions.vehicleCategory;
        case "notifications":
          return permissions.sendNotifications;
        case "revenue":
        case "ride-rates":
        case "peak-windows":
        case "ride-configuration":
          return permissions.financials;
        case "promo-codes":
          return permissions.promos;
        case "cancelled-rides":
          return permissions.cancelledRides;
        case "birds-eye-view":
          return permissions.birdsEye;
        default:
          return true; // Dashboard, User Management, Reports, Completed Rides allowed for all
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value = {
    // Sidebar state
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    toggleMobileSidebar,

    // Loading state
    loading,
    setLoading,

    // Menu items
    menuItems: getFilteredMenuItems(),

    // App configurations
    appConfigs,
    setAppConfigs,

    // Dashboard analytics
    dashboardAnalytics,
    setDashboardAnalytics,

    // Utility functions
    isMobile: () => window.innerWidth < 1024,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
