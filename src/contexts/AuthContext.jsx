import React, { createContext, useContext, useState, useEffect } from "react";
import { SECURITY_CONFIG, PERMISSIONS } from "../config/constants";
import { handleError, handleSuccess } from "../utils/helpers";
import { api } from "../lib/services";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAuthActions, setLoadingAuthActions] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingLockTime, setRemainingLockTime] = useState(null);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Inactivity timer logic
  // Compares wall-clock time against the last activity instead of relying on a
  // single long setTimeout, which browsers pause during sleep and throttle in
  // background tabs.
  useEffect(() => {
    if (!user || showTimeoutModal) return;

    let lastActivity = Date.now();
    let loggingOut = false;

    const markActivity = () => {
      lastActivity = Date.now();
    };

    const checkIdle = async () => {
      if (loggingOut) return;
      if (Date.now() - lastActivity < SECURITY_CONFIG.sessionTimeout) return;

      loggingOut = true;
      // Capture current path ONLY for auto-logout
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (currentPath && !currentPath.startsWith("/auth") && currentPath !== "/") {
        sessionStorage.setItem("autoLogoutRedirectUrl", currentPath);
      }
      // Automatic logout on timeout
      await logout();
      setShowTimeoutModal(true);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    // Capture phase: pages scroll inside <main>, and scroll events don't bubble
    // up to window, so without it scrolling a table wouldn't count as activity.
    events.forEach((event) => window.addEventListener(event, markActivity, true));
    // Returning to the tab after sleep or a long background stretch: check at once.
    document.addEventListener("visibilitychange", checkIdle);
    const interval = setInterval(checkIdle, 10000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", checkIdle);
      events.forEach((event) => window.removeEventListener(event, markActivity, true));
    };
  }, [user, showTimeoutModal]);

  // Check if user is locked out
  const isLockedOut = () => {
    const lockedUntilCache = localStorage.getItem("lockedUntil");
    if (!lockedUntilCache) return false;
    return new Date() < new Date(lockedUntilCache);
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const userData = sessionStorage.getItem("userData");

        // Clean up legacy localStorage so closing browser enforces fresh session
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);
  // Login function
  const login = async (email, password) => {
    if (isLockedOut()) {
      const remainingTime = Math.ceil(
        (new Date(lockedUntil) - new Date()) / 1000 / 60,
      );
      return {
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes.`,
      };
    }

    setLoading(true);

    try {
      // Generate device information
      const deviceuniqueid = `device-${Date.now()}-${Math.floor(
        Math.random() * 10000,
      )}`;
      const devicemodel = navigator.userAgent || "Unknown Device";

      const response = await api.login({
        email,
        password,
        deviceuniqueid,
        devicemodel,
      });

      const userData = response?.data?.admin;
      const token = response?.data?.token;

      // Store auth data in sessionStorage so closing the tab/browser logs out automatically
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("userData", JSON.stringify(userData));
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      setUser(userData);
      setLoginAttempts(0);
      localStorage.setItem("loginAttempts", 0);
      setLockedUntil(null);
      localStorage.setItem("lockedUntil", JSON.stringify(null));

      handleSuccess(response.message, "Login successful");
      return { success: true, user: userData };
    } catch (error) {
      let loginAttemptsCache = localStorage.getItem("loginAttempts");
      if (loginAttemptsCache) {
        loginAttemptsCache = parseInt(loginAttemptsCache, 10);
      }
      const newAttempts = loginAttemptsCache + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts);

      if (newAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
        const lockoutEnd = new Date(
          Date.now() + SECURITY_CONFIG.lockoutDuration,
        );
        setLockedUntil(lockoutEnd.toISOString());
        localStorage.setItem("lockedUntil", lockoutEnd.toISOString());
        return {
          success: false,
          error: `Too many failed attempts. Account locked for ${
            SECURITY_CONFIG.lockoutDuration / 60000
          } minutes.`,
        };
      }

      handleError(error);
      return {
        success: false,
        error: `Invalid credentials. ${
          SECURITY_CONFIG.maxLoginAttempts - newAttempts
        } attempts remaining.`,
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      // Clear auth data
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");

      setUser(null);
      setLoginAttempts(0);
      localStorage.setItem("loginAttempts", 0);
      setLockedUntil(null);
      localStorage.setItem("lockedUntil", JSON.stringify(null));

      handleSuccess("Logout successful");
      return { success: true };
    } catch (error) {
      handleError(error);
      return { success: false, error: "Logout failed." };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.forgotPassword({ email: payload.email });
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoadingAuthActions(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.verifyOTP({
        email: payload.email,
        otp: payload.otp,
      });

      if (response?.data?.token) {
        sessionStorage.setItem("authToken", response.data.token);
        localStorage.removeItem("authToken");
      }

      handleSuccess(response.message, "OTP verified successfully");
      return { success: true };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.message || "OTP verification failed.",
      };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  // Update password function
  const updatePassword = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.updatePassword(payload);

      if (response.success) {
        handleSuccess(response.message, "Password updated successfully");
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to update password.");
      }
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.message || "Failed to update password.",
      };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  const resetPassword = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.resetPassword({
        email: payload.email,
        newPassword: payload.newPassword,
      });

      if (response.success) {
        sessionStorage.removeItem("authToken");
        localStorage.removeItem("authToken");
        handleSuccess(response.message, "Password reset successfully");
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to reset password.");
      }
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.message || "Failed to reset password.",
      };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  // Update password auth function
  const updatePasswordAuth = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.updatePasswordAuth(payload);

      if (response.success) {
        handleSuccess(response.message, "Password updated successfully");

        // Clear auth data
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");

        setUser(null);
        setLoginAttempts(0);
        localStorage.setItem("loginAttempts", 0);
        setLockedUntil(null);
        localStorage.setItem("lockedUntil", JSON.stringify(null));
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to update password.");
      }
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: error.message || "Failed to update password.",
      };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  // Register function
  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await api.register({ email, password, name });
      handleSuccess(response.message, "User registered successfully");
      return { success: true, user: response.data.user };
    } catch (error) {
      handleError(error);
      return { success: false, error: "Registration failed." };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLockedOut()) {
      const interval = setInterval(() => {
        const lockedUntilCache = localStorage.getItem("lockedUntil");
        if (lockedUntilCache) {
          const remainingTime = Math.max(
            new Date(lockedUntilCache) - new Date(),
            0,
          );
          setRemainingLockTime(remainingTime);
          if (remainingTime === 0) {
            clearInterval(interval);
            setLockedUntil(null);
            setLoginAttempts(0);
            localStorage.removeItem("lockedUntil");
            localStorage.setItem("loginAttempts", "0");
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingLockTime(null);
    }
  }, [lockedUntil]);

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    const userRole = user.role.toLowerCase();
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) return false;
    return rolePermissions[permission] === true;
  };
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role.toLowerCase());
    }
    return user.role.toLowerCase() === roles.toLowerCase();
  };

  const value = {
    user,
    loading,
    loadingAuthActions,
    isAuthenticated: !!user,
    isLockedOut: isLockedOut(),
    hasPermission,
    hasRole,
    loginAttempts,
    remainingLockTime,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updatePassword,
    updatePasswordAuth,
    register,
    setUser,
    showTimeoutModal,
    setShowTimeoutModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
