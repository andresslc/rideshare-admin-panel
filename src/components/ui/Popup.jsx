import { useState } from "react";
import Modal from "./Modal";
import Card from "./Card";
import Button from "./Button";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

/**
 * CustomPopup - A flexible modal popup for success, error, info, or confirmation.
 *
 * Props:
 * - open: boolean (controls visibility)
 * - onClose: function (called when closed)
 * - type: 'success' | 'error' | 'info' | 'confirm' (default: 'info')
 * - title: string (optional)
 * - message: string | ReactNode
 * - confirmText: string (default: 'Yes')
 * - cancelText: string (default: 'No')
 * - onConfirm: async function (called on Yes, can be async, supports loading)
 * - onCancel: function (called on No/cancel/close)
 * - showCloseButton: boolean (default: true)
 * - icon: ReactNode (optional, overrides default icon)
 * - children: ReactNode (optional, for custom content)
 */
const ICONS = {
  success: <CheckCircle className="w-12 h-12 text-green-600" />,
  error: <XCircle className="w-12 h-12 text-red-600" />,
  info: <AlertTriangle className="w-12 h-12 text-blue-600" />,
  confirm: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
};

const BG_CLASSES = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  confirm:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
};

export default function Popup({
  open,
  onClose,
  type = "info",
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  showCloseButton = true,
  icon,
  children,
  ...modalProps
}) {
  const [loading, setLoading] = useState(false);
  const isConfirm = type === "confirm";

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      setLoading(false);
      onClose && onClose();
    } catch (e) {
      setLoading(false);
      // Optionally handle error
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel ? onCancel() : onClose && onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleCancel}
      showCloseButton={showCloseButton}
      {...modalProps}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={`w-24 h-24 flex justify-center items-center rounded-full ${BG_CLASSES[type]}`}>{icon || ICONS[type]}</div>
        {title && (
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2">
            {title}
          </h3>
        )}
        {message && (
          <p className="text-center text-gray-700 dark:text-gray-200 text-base mt-1 w-[440px]">
            {message}
          </p>
        )}
        {children}
      </div>
      {isConfirm && (
        <div className="flex justify-center gap-4 mt-6">
          <Button
            type="button"
            className="min-w-[96px]"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            className="min-w-[96px]"
            loading={loading}
            disabled={loading}
            onClick={handleConfirm}
            variant="primary"
          >
            {loading ? "Please wait..." : confirmText}
          </Button>
        </div>
      )}
    </Modal>
  );
}
