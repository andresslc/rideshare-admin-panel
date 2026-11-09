import { useState } from "react";
import Badge from "./Badge";
import Input from "./Input";
import { X } from "lucide-react";

// TagInput Component for Sizes and Colors
const TagInput = ({
  label,
  value = [],
  onChange,
  placeholder,
  error,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newValue = inputValue.trim();
      if (!value.includes(newValue)) {
        onChange([...value, newValue]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={error}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="primary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Type and press Enter to add {label.toLowerCase()}
      </p>
    </div>
  );
};

export default TagInput;
