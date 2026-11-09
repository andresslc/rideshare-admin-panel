import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loadingResend, setLoadingResend] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { loadingAuthActions, verifyOTP, forgotPassword } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  let email;

  // Storage keys
  const TIMER_KEY = "otp_timer_expiry";

  useEffect(() => {
    email = location.state?.email;
    if (!email) {
      navigate("/auth/login");
    }
  }, [location]);

  useEffect(() => {
    // Initialize timer from localStorage or set new expiry
    const savedExpiry = localStorage.getItem(TIMER_KEY);
    const now = Date.now();

    if (savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      const remainingTime = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remainingTime);
      setCanResend(remainingTime === 0);
    } else {
      // Set new timer expiry (10 minutes from now)
      const expiryTime = now + 60 * 1000; // 1 minute in milliseconds
      localStorage.setItem(TIMER_KEY, expiryTime.toString());
    }
  }, []);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      // Clear expired timer from localStorage
      localStorage.removeItem(TIMER_KEY);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (value && !/^\d+$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (otpValue = otp.join("")) => {
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");

    const payload = {
      email: location?.state?.email,
      otp: otpValue,
    };

    const response = await verifyOTP(payload);

    if (response.success) {
      // Clear localStorage on successful verification
      localStorage.removeItem(TIMER_KEY);

      const email = location.state?.email;
      navigate("/auth/reset-password", { state: { email, verified: true } });
    } else {
      setError(response.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setError("");
    setLoadingResend(true);

    // Simulate API call
    const payload = {
      email: location?.state?.email,
    };
    const success = await forgotPassword(payload);

    if (success) {
      // Reset timer with new expiry time
      const now = Date.now();
      const newExpiry = now + 60 * 1000; // 10 minutes from now
      localStorage.setItem(TIMER_KEY, newExpiry.toString());

      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError("Failed to resend OTP. Please try again.");
    }

    setLoadingResend(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get email for display (from localStorage or location state)
  const displayEmail = location.state?.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
            <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify your identity
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit code to{" "}
            <span className="font-medium text-primary-600">{displayEmail}</span>
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter verification code
              </label>
              <div className="flex space-x-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Code expires in {formatTime(timeLeft)}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Code has expired. Please request a new one.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => handleSubmit()}
              className="w-full"
              loading={loadingAuthActions && !loadingResend}
              disabled={
                loadingAuthActions ||
                loadingResend ||
                otp.some((digit) => !digit)
              }
            >
              {loadingAuthActions && !loadingResend
                ? "Verifying..."
                : "Verify Code"}
            </Button>

            {/* Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={loadingAuthActions || loadingResend}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  {loadingResend ? "Resending Code..." : "Resend code"}
                </button>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Didn't receive the code?{" "}
                  <span className="text-primary-600">
                    Resend in {formatTime(timeLeft)}
                  </span>
                </p>
              )}
            </div>

            {/* Back to login */}
            <div className="text-center">
              <Link
                to="/auth/login"
                onClick={() => {
                  // Clear localStorage when going back to login
                  localStorage.removeItem(TIMER_KEY);
                }}
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </div>
          </div>
        </Card>

        {/* Demo Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Demo: Use code{" "}
            <span className="font-mono font-semibold">123456</span> to proceed
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
