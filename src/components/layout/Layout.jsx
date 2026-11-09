import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ErrorBoundary from "../global/ErrorBoundary";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="relative flex h-dvh overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Sidebar />

      <div className="min-w-0 min-h-0 flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
          <div className="min-w-0 max-w-7xl mx-auto">
            <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
