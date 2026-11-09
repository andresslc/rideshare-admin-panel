import React, { forwardRef, useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

const MultiSelect = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      options = [],
      placeholder = "Select options...",
      searchable = false,
      value = [],
      onChange,
      disabled = false,
      name,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
      if (!searchable || !searchTerm) {
        setFilteredOptions(options);
        return;
      }
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }, [searchTerm, options, searchable]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchTerm("");
    };

    const handleSelect = (option) => {
      const newValue = value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value];

      if (onChange) {
        onChange({
          target: { name, value: newValue },
        });
      }
    };

    const removeOption = (e, optionValue) => {
      e.stopPropagation();
      if (disabled) return;
      const newValue = value.filter((v) => v !== optionValue);
      if (onChange) {
        onChange({ target: { name, value: newValue } });
      }
    };

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const baseClasses =
      "block w-full min-h-[38px] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200 cursor-pointer";
    const errorClasses = error
      ? "border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500"
      : "";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
      <div className="space-y-1" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <div
            ref={ref}
            onClick={handleToggle}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className} flex items-center justify-between`}
            {...props}
          >
            <div className="flex flex-wrap gap-1 flex-1 pr-6">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                  >
                    {opt.label}
                    <button
                      type="button"
                      onClick={(e) => removeOption(e, opt.value)}
                      className="hover:text-primary-900 dark:hover:text-primary-100 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 dark:text-gray-500 py-0.5">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronDown
              className={`absolute right-3 w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>

          <div
            className={`absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden transition-all duration-200 ease-in-out origin-bottom ${
              isOpen
                ? "opacity-100 scale-y-100 translate-y-0"
                : "opacity-0 scale-y-95 translate-y-2 pointer-events-none"
            }`}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none flex items-center justify-between transition-colors duration-150 ${
                        isSelected
                          ? "bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(option);
                      }}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
