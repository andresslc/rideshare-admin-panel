import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { SECURITY_CONFIG, USER_ROLES } from "../../config/constants";

const AdminUserModal = ({ isOpen, onClose, onSubmit, editingAdmin = null }) => {
  const isEditing = !!editingAdmin;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      isActive: true,
    },
  });

  const watchPassword = watch("password");

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        reset({
          name: editingAdmin.name || "",
          email: editingAdmin.email || "",
          password: "", // Usually we don't fetch or display password on edit
          role: editingAdmin.role || USER_ROLES.ADMIN,
          isActive: editingAdmin.isActive !== false,
        });
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
          isActive: true,
        });
      }
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, isEditing, editingAdmin, reset]);

  const validatePassword = (password) => {
    if (isEditing && !password) return true; // Optional on edit
    if (!isEditing && !password) return "Password is required"; // Required on add

    const errs = [];
    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      errs.push(`At least ${SECURITY_CONFIG.passwordMinLength} characters`);
    }
    if (SECURITY_CONFIG.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errs.push("One uppercase letter");
    }
    if (SECURITY_CONFIG.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errs.push("One lowercase letter");
    }
    if (SECURITY_CONFIG.passwordRequireNumbers && !/\d/.test(password)) {
      errs.push("One number");
    }
    if (
      SECURITY_CONFIG.passwordRequireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errs.push("One special character");
    }

    return errs.length === 0
      ? true
      : `Password must contain: ${errs.join(", ")}`;
  };

  const handleFormSubmit = async (data) => {
    const payload = { ...data };
    delete payload.confirmPassword;
    if (isEditing && !payload.password) {
      delete payload.password; // Don't send empty password on update
    }
    await onSubmit(payload);
  };

  const roleOptions = [
    { value: "", label: "Select Role", disabled: true },
    { value: USER_ROLES.ADMIN, label: "Admin" },
    { value: USER_ROLES.GENERAL, label: "General" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Admin User" : "Add Admin User"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" autoComplete="off">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <Input
            {...register("name", {
              required: "Name is required",
              maxLength: {
                value: 50,
                message: "Name cannot exceed 50 characters",
              },
            })}
            placeholder="John Doe"
            autoComplete="off"
            leftIcon={<User className="w-4 h-4 text-gray-400" />}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <Input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="john@example.com"
            type="email"
            autoComplete="new-email" // use new-email or something else to prevent autocomplete
            disabled={isEditing} // Email is usually non-editable
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
            error={errors.email?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEditing ? "Password (leave empty to keep current)" : "Password"}
          </label>
          <Input
            {...register("password", { validate: validatePassword })}
            type={showPassword ? "text" : "password"}
            placeholder={isEditing ? "Enter new password" : "Enter password"}
            autoComplete="new-password"
            leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            error={errors.password?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm Password
          </label>
          <Input
            {...register("confirmPassword", {
              validate: (value) => {
                if (isEditing && !watchPassword && !value) return true;
                if (!isEditing && !value) return "Please confirm your password";
                return value === watchPassword || "Passwords do not match";
              },
            })}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            autoComplete="new-password"
            leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            error={errors.confirmPassword?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <Controller
            name="role"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={roleOptions}
                error={errors.role?.message}
              />
            )}
          />
        </div>

        {isEditing && (
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Active User
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Admin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminUserModal;
