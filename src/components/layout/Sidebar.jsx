import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import { APP_CONFIG } from "../../config/constants";
import { useApp } from "../../contexts/AppContext";
import * as Icons from "lucide-react";
import useGetRequestsCount from "../../hooks/drivers/useGetRequestsCount";

const Sidebar = () => {
  const location = useLocation();
  const {
    menuItems,
    sidebarCollapsed,
    sidebarOpen,
    toggleMobileSidebar,
    toggleSidebar,
  } = useApp();
  const { count: pendingRequestsCount } = useGetRequestsCount();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.children.length === 0) return isActive(item.path);
    return item.children.some((child) => isActive(child.path));
  };

  const renderMenuItem = (item) => {
    const IconComponent = Icons[item.icon] || Icons.Circle;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const active = isParentActive(item);

    return (
      <div key={item.id} className="mb-1">
        {hasChildren ? (
          <div>
            <button
              onClick={() => !sidebarCollapsed && toggleExpanded(item.id)}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              } px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                active
                  ? "bg-primary-500/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-5 h-5 ${
                    sidebarCollapsed ? "" : "mr-3"
                  } flex-shrink-0`}
                >
                  <IconComponent className="w-5 h-5 transition-colors duration-200" />
                </div>
                {!sidebarCollapsed && (
                  <span className="transition-opacity duration-200 truncate">
                    {item.label}
                  </span>
                )}
                {item?.id === "driver-management" && (
                  <div className="ml-auto flex items-center gap-1">
                    {pendingRequestsCount > 0 && (
                      <span
                        title="Pending Driver Requests"
                        className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-amber-500 text-white text-[10px] font-semibold leading-none"
                      >
                        {pendingRequestsCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Chevron only if not collapsed */}
              {!sidebarCollapsed && (
                <div
                  className={`transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Children only if expanded and not collapsed */}
            {isExpanded && !sidebarCollapsed && (
              <div className="ml-8 mt-1 space-y-1 fade-in">
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    to={child.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleMobileSidebar();
                      }
                    }}
                    className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 truncate ${
                      isActive(child.path)
                        ? "bg-primary-500/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 border-l-2 border-primary-500"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) {
                toggleMobileSidebar();
              }
            }}
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
              active
                ? "bg-primary-500/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 border-l-2 border-primary-500"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <div
              className={`flex items-center justify-center w-5 h-5 ${
                sidebarCollapsed ? "" : "mr-3"
              } flex-shrink-0`}
            >
              <IconComponent className="w-5 h-5 transition-colors duration-200" />
            </div>
            {!sidebarCollapsed && (
              <span className="transition-opacity duration-200 truncate">
                {item.label}
              </span>
            )}
            {item?.id === "driver-management" && (
              <div className="ml-auto flex items-center gap-1">
                {pendingRequestsCount > 0 && (
                  <span
                    title="Pending Driver Requests"
                    className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-amber-500 text-white text-[10px] font-semibold leading-none"
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </div>
            )}
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"}
        w-64 transition-all duration-500
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 h-20 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center w-full" : ""
            } transition-all duration-500`}
          >
            {APP_CONFIG.logo ? (
              <img
                src={APP_CONFIG.logo}
                alt={APP_CONFIG.name}
                className="h-full max-h-10"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {APP_CONFIG.name.charAt(0)}
                </span>
              </div>
            )}

            {!sidebarCollapsed && (
              <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white transition-opacity duration-300 truncate">
                {APP_CONFIG.name}
              </span>
            )}
          </div>
          {/* Collapse/Expand button (desktop only) */}
          {/* <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 ml-2"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={`w-5 h-5 ${
                sidebarCollapsed ? "-rotate-180" : ""
              } transition-all`}
            />
          </button> */}
          {/* Mobile close button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer */}
        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "gap-3"
            } p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  System Status
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  All systems operational
                </p>
              </div>
            )}
          </div>
        </div> */}
      </aside>
    </>
  );
};

export default Sidebar;
