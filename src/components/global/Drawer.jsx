// components/ui/Drawer.jsx
import React from "react";
import { X } from "lucide-react";

const Drawer = ({ isOpen, onClose, title, size = "sm", children }) => {
  if (!isOpen) return null;

  const widthClass =
    size === "sm"
      ? "w-80"
      : size === "md"
      ? "w-96"
      : size === "lg"
      ? "w-[500px]"
      : "w-80";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 z-50 p-4 overflow-y-auto ${widthClass} shadow-lg transition-transform`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

export default Drawer;
