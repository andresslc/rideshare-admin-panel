import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import Button from "./Button";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const CustomPopup = ({
  isOpen,
  onClose,
  type = "info", // success, error, warning, info
  title,
  message,
  cancelButtonTitle = "Cancel",
  continueButtonTitle = "Continue",
  onCancel,
  onContinue,
}) => {
  const icons = {
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <XCircle className="w-12 h-12 text-red-500" />,
    warning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    info: <Info className="w-12 h-12 text-blue-500" />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div>{icons[type]}</div>
        {title && (
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        <p className="text-gray-700 dark:text-gray-300 text-sm">{message}</p>
        <div className="flex space-x-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelButtonTitle}
            </Button>
          )}
          {onContinue && (
            <Button variant="primary" onClick={onContinue}>
              {continueButtonTitle}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

CustomPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  cancelButtonTitle: PropTypes.string,
  continueButtonTitle: PropTypes.string,
  onCancel: PropTypes.func,
  onContinue: PropTypes.func,
};

export default CustomPopup;
