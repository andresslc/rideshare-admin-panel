import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { useForm } from "react-hook-form";
import { validateEmail } from "../../utils/helpers";
import { useAuth } from "../../contexts/AuthContext";

const ForgotPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { loadingAuthActions, forgotPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      email: data?.email,
    };
    const success = await forgotPassword(payload);
    if (success) {
      setIsEmailSent(true);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                We've sent an OTP to{" "}
                <span className="font-medium text-primary-600">
                  {getValues("email")}
                </span>
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {/* Verify Button */}
              <div className="text-center">
                <Link
                  to="/auth/verify-otp"
                  state={{ email: getValues("email") }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Verify OTP
                </Link>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  try again
                </button>
              </p>

              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </Link>
              </div>
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you an to verify you.
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                validate: (value) =>
                  validateEmail(value) || "Please enter a valid email address",
              })}
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            />

            <Button
              type="submit"
              className="w-full"
              loading={loadingAuthActions}
              disabled={loadingAuthActions}
            >
              {loadingAuthActions ? "Sending..." : "Verify Email"}
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

export default ForgotPassword;
