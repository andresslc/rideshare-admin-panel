import React, { useState, useRef, useEffect, useCallback } from "react";
import { Settings, LogOut, Moon, Sun, Menu, X, Shield, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useApp } from "../../contexts/AppContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "../global/ConfirmModal";
import { api } from "../../lib/services";
import { formatDate } from "../../utils/helpers";
import { USER_ROLES } from "../../config/constants";

const LIMIT = 10;

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const { theme, toggleTheme, canToggleTheme } = useTheme();
  const { markNotificationAsRead, sidebarOpen, toggleMobileSidebar } = useApp();

  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [notifLoading, setNotifLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (page === 1) setNotifLoading(true);
    else setLoadingMore(true);
    try {
      const res = await api.getAdminNotifications(page, LIMIT);
      const data = res.data || [];
      setNotifications((prev) => append ? [...prev, ...data] : data);
      setNotifTotalPages(res.pagination?.totalPages || 1);
      setUnreadCount(append
        ? (prev) => prev + data.filter((n) => !n.isRead).length
        : data.filter((n) => !n.isRead).length
      );
    } catch (_e) {
      // ignore
    } finally {
      setNotifLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleBellClick = () => {
    setShowNotifications((prev) => {
      if (!prev) {
        // Refresh on open
        setNotifPage(1);
        fetchNotifications(1);
      }
      return !prev;
    });
    setShowUserMenu(false);
  };

  const handleLoadMore = () => {
    const next = notifPage + 1;
    setNotifPage(next);
    fetchNotifications(next, true);
  };

  const handleNotifClick = (notif) => {
    const driverId = notif.notificationContent?.metaData?.id;
    setShowNotifications(false);
    if (driverId) {
      navigate(`/driver/${driverId}`);
    }
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    sessionStorage.removeItem("autoLogoutRedirectUrl");
    sessionStorage.removeItem("redirectUrl");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("lockedUntil");
    localStorage.removeItem("loginAttempts");
    setUser(null);
    setShowLogoutConfirm(false);
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4 h-20">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((notif) => {
                        const hasLink = !!notif.notificationContent?.metaData?.id;
                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors ${
                              hasLink ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : "cursor-default"
                              }`}
                          >
                              <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700">
                                <Bell className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {notif.notificationContent?.title || "Notification"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                {notif.notificationContent?.description || ""}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-1">
                                {formatDate(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Load More / All Loaded */}
                      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-center">
                        {notifPage < notifTotalPages ? (
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-1.5 mx-auto"
                          >
                            {loadingMore ? (
                              <><div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> Loading...</>
                            ) : "Load more"}
                          </button>
                        ) : (
                          <p className="text-xs text-gray-400">All notifications loaded</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-primary-500/30 dark:bg-primary-900/10 rounded-full flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || "Admin"}
                </p>
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 scale-in">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <div className="py-2">
                  {user?.role === USER_ROLES.SUPER_ADMIN && (
                    <Link
                      to="/change-password"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 mb-1"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      Change Password
                    </Link>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to sign out? You will need to login again to access your account."
        confirmText="Sign out"
        cancelText="Cancel"
      />
    </header>
  );
};

export default Header;
