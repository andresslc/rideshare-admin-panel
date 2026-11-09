import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { useForm } from "react-hook-form";
import { SECURITY_CONFIG } from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";

const ResetPassword = () => {
  const { loadingAuthActions, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const verified = location.state?.verified;

    if (!email || !verified) {
      navigate("/auth/login");
    }
  }, [email, location.state?.verified, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const watchPassword = watch("password");

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      errors.push(`At least ${SECURITY_CONFIG.passwordMinLength} characters`);
    }

    if (SECURITY_CONFIG.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }

    if (SECURITY_CONFIG.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }

    if (SECURITY_CONFIG.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push("One number");
    }

    if (
      SECURITY_CONFIG.passwordRequireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push("One special character");
    }

    return errors.length === 0
      ? true
      : `Password must contain: ${errors.join(", ")}`;
  };

  const onSubmit = async (data) => {
    const payload = {
      email: email,
      newPassword: data.password,
    };

    const response = await resetPassword(payload);

    if (response.success) {
      setIsSuccess(true);
      // reset(); // Assuming reset is from useForm

      // // Hide success message after 5 seconds
      // setTimeout(() => {
      //   setIsSuccess(false);
      // }, 5000);
    } else {
      // handleError(response.error || "Error resetting password");
      console.error("Error resetting password:", response.error);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Password reset successful
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Your password has been updated successfully.
              </p>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => navigate("/auth/login")}
                className="w-full"
              >
                Continue to login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your new password for{" "}
            <span className="font-medium text-primary-600">{email}</span>
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                maxLength: {
                  value: 64,
                  message: "Password cannot exceed 64 characters",
                },
                validate: validatePassword,
              })}
              error={errors.password?.message}
              maxLength={64}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                maxLength: {
                  value: 64,
                  message: "Password cannot exceed 64 characters",
                },
                validate: (value) =>
                  value === watchPassword || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
              maxLength={64}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {/* Password Requirements */}
            {watchPassword && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-2">Password requirements:</p>
                <ul className="space-y-1">
                  <li
                    className={`flex items-center ${
                      watchPassword.length >= SECURITY_CONFIG.passwordMinLength
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 mr-2" />
                    At least {SECURITY_CONFIG.passwordMinLength} characters
                  </li>
                  {SECURITY_CONFIG.passwordRequireUppercase && (
                    <li
                      className={`flex items-center ${
                        /[A-Z]/.test(watchPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One uppercase letter
                    </li>
                  )}
                  {SECURITY_CONFIG.passwordRequireLowercase && (
                    <li
                      className={`flex items-center ${
                        /[a-z]/.test(watchPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One lowercase letter
                    </li>
                  )}
                  {SECURITY_CONFIG.passwordRequireNumbers && (
                    <li
                      className={`flex items-center ${
                        /\d/.test(watchPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One number
                    </li>
                  )}
                  {SECURITY_CONFIG.passwordRequireNumbers && (
                    <li
                      className={`flex items-center text-sm ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(watchPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One special character
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              loading={loadingAuthActions}
              disabled={loadingAuthActions}
            >
              {loadingAuthActions ? "Updating..." : "Update password"}
            </Button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
