import React, { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { APP_CONFIG, AUTH_ROUTES } from "../../config/constants";

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading, isLockedOut, remainingLockTime } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Validate redirect path to prevent open redirect vulnerabilities
  const isValidRedirect = (url) => {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("/") || url.startsWith("//")) return false;
    if (url.startsWith("/auth")) return false;
    return true;
  };

  // Determine the target redirect path (only used if auto-logged out)
  const getRedirectUrl = () => {
    // 1. URL search parameters: ?redirect=... or ?redirectUrl=...
    const searchParams = new URLSearchParams(location.search);
    const queryRedirect = searchParams.get("redirect") || searchParams.get("redirectUrl");
    if (isValidRedirect(queryRedirect)) {
      return queryRedirect;
    }

    // 2. Stored auto-logout redirect in sessionStorage
    const storedAutoRedirect = sessionStorage.getItem("autoLogoutRedirectUrl");
    if (isValidRedirect(storedAutoRedirect)) {
      return storedAutoRedirect;
    }

    // 3. Fallback to dashboard
    return "/dashboard";
  };

  const clearAutoRedirect = () => {
    sessionStorage.removeItem("autoLogoutRedirectUrl");
    sessionStorage.removeItem("redirectUrl");
  };

  // Redirect if already logged in
  if (user) {
    const destination = getRedirectUrl();
    clearAutoRedirect();
    return <Navigate to={destination} replace />;
  }

  useEffect(() => {
    if (!isLockedOut) {
      setError((prev) => {
        if (prev && prev.includes("locked")) return "";
        return prev;
      });
    }
  }, [isLockedOut]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result?.success) {
      const destination = getRedirectUrl();
      clearAutoRedirect();
      navigate(destination, { replace: true });
    }
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {APP_CONFIG.name.charAt(0)}
            </span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back to {APP_CONFIG.name}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {isLockedOut && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">Account Temporarily Locked</p>
              <p className="mt-1">
                Too many failed login attempts. Please try again in{" "}
                {Math.floor(remainingLockTime / 60000)} minutes and{" "}
                {Math.floor((remainingLockTime % 60000) / 1000)} seconds.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  placeholder="Enter your email"
                  disabled={loading || isLockedOut}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  maxLength={64}
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      tabIndex={-1}
                      disabled={loading || isLockedOut}
                    >
                      {!showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                  }
                  placeholder="Enter your password"
                  disabled={loading || isLockedOut}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading || isLockedOut}
                >
                  {!showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to={AUTH_ROUTES.FORGOT_PASSWORD}
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
