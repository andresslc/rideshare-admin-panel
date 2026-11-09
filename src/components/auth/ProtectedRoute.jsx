import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AUTH_ROUTES } from '../../config/constants'

const ProtectedRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, loading, hasPermission, hasRole } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const autoRedirect = sessionStorage.getItem("autoLogoutRedirectUrl");
    if (autoRedirect && !autoRedirect.startsWith("/auth") && autoRedirect !== "/") {
      return (
        <Navigate
          to={`${AUTH_ROUTES.LOGIN}?redirect=${encodeURIComponent(autoRedirect)}`}
          state={{ from: autoRedirect, isAutoLogout: true }}
          replace
        />
      );
    }
    return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have the required role to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
