import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const SUBSCRIPTION_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "canceled" },
];

const LIMITS = {
  firstName: 40,
  lastName: 40,
  email: 100,
  balance: 999999,
};

const statuses = ["success", "failed", "initiated", "processing"]
const validateEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);

const EditProfileModal = ({
  isOpen,
  onClose,
  userId,
  type,
  initialData,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subscriptionStatus: "",
    balance: "0",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      console.log("Initializing form with data:", initialData);
      setForm({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        subscriptionStatus: initialData.subscriptionStatus == "Expired" ? "canceled" : "active" || "",
        balance: "0",
      });
      setErrors({});
      setConfirmModalOpen(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Enforce char limits silently
    if (name === "firstName" && value.length > LIMITS.firstName) return;
    if (name === "lastName" && value.length > LIMITS.lastName) return;
    if (name === "email" && value.length > LIMITS.email) return;

    // Restrict balance to 2 decimal places max
    if (name === "balance" && value && !/^\d*\.?\d{0,2}$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (form.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s'-]+$/.test(form.firstName.trim())) {
      newErrors.firstName = "First name can only contain letters.";
    }

    if (form.lastName.trim() && !/^[a-zA-Z\s'-]+$/.test(form.lastName.trim())) {
      newErrors.lastName = "Last name can only contain letters.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (form.balance !== "") {
      const num = Number(form.balance);
      if (isNaN(num)) {
        newErrors.balance = "Balance must be a valid number.";
      } else if (num < 0) {
        newErrors.balance = "Balance cannot be negative.";
      } else if (num > LIMITS.balance) {
        newErrors.balance = `Balance cannot exceed ${LIMITS.balance.toLocaleString()}.`;
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    const payload = { type };
    if (form.firstName.trim()) payload.firstName = form.firstName.trim();
    if (form.lastName.trim()) payload.lastName = form.lastName.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.subscriptionStatus) payload.subscriptionStatus = form.subscriptionStatus;
    if (form.balance !== "") payload.balance = Number(form.balance);

    setLoading(true);
    try {
      const response = await api.updateUser(userId, payload);
      handleSuccess(response?.message, "Profile updated successfully");
      setConfirmModalOpen(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="First Name *"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                error={errors.firstName}
                maxLength={LIMITS.firstName}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">
                {form.firstName.length}/{LIMITS.firstName}
              </p>
            </div>
            <div>
              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                error={errors.lastName}
                maxLength={LIMITS.lastName}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">
                {form.lastName.length}/{LIMITS.lastName}
              </p>
            </div>
          </div>

          {/* Email */}
          <div>
            <Input
              label="Email *"
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              error={errors.email}
              maxLength={LIMITS.email}
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">
              {form.email.length}/{LIMITS.email}
            </p>
          </div>

          {/* Subscription Status */}
          {type === "driver" && (
            <Select
              label="Subscription Status"
              name="subscriptionStatus"
              value={form.subscriptionStatus}
              onChange={handleChange}
              options={SUBSCRIPTION_OPTIONS}
              placeholder="Select status..."
            />
          )}

          {/* Balance */}
          <Input
            label="Add Balance (Points)"
            name="balance"
            type="number"
            min="0"
            max={LIMITS.balance}
            step="0.01"
            value={form.balance}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.balance}
          />

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Changes"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Are you sure you want to save these changes?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {Number(form.balance) > 0 ? (
                  <>This will update profile details and add <strong className="text-gray-900 dark:text-white">{form.balance}</strong> points to the user balance.</>
                ) : (
                  <>This action will update the profile details for this user.</>
                )}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmSave}
              loading={loading}
            >
              Yes, Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditProfileModal;
