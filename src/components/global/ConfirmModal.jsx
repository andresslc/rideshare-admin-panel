import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>

          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
