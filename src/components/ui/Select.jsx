import React, { forwardRef, useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      prefix,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      options = [],
      placeholder = "Select an option...",
      searchable = false,
      onSearch,
      value,
      onChange,
      disabled = false,
      name,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter options based on search term
    useEffect(() => {
      if (!searchable || !searchTerm) {
        setFilteredOptions(options);
        return;
      }

      if (onSearch) {
        // If custom onSearch function is provided, use it
        onSearch(searchTerm);
      } else {
        // Default search behavior - filter by label
        const filtered = options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [searchTerm, options, searchable, onSearch]);

    // Reset search when options change (for custom onSearch)
    useEffect(() => {
      if (onSearch) {
        setFilteredOptions(options);
      }
    }, [options, onSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event) => {
        if (!isOpen) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
            break;
          case "Enter":
            event.preventDefault();
            if (highlightedIndex >= 0) {
              handleSelect(filteredOptions[highlightedIndex]);
            }
            break;
          case "Escape":
            event.preventDefault();
            setIsOpen(false);
            setSearchTerm("");
            setHighlightedIndex(-1);
            break;
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredOptions, highlightedIndex]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && dropdownRef.current) {
        const highlightedElement =
          dropdownRef.current.children[highlightedIndex];
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }
    }, [highlightedIndex]);

    const selectedOption = options?.find((opt) => opt.value === value);

    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchTerm("");
      setHighlightedIndex(-1);
    };
    const handleSelect = (option) => {
      if (onChange) {
        onChange({
          target: {
            name,
            value: option.value,
          },
        });
      }

      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    };

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setHighlightedIndex(-1);
    };

    const baseClasses =
      "block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200 cursor-pointer";
    const errorClasses = error
      ? "border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500"
      : "";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
      <div className="space-y-1" ref={containerRef}>
        {label && !prefix && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-28 text-xs font-medium text-gray-500 dark:text-gray-400 pointer-events-none z-10 whitespace-nowrap overflow-hidden text-ellipsis">
              {prefix}:
            </span>
          )}
          {leftIcon && !prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          {/* Trigger Button */}
          <button
            ref={ref}
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            name={name}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className} flex items-center justify-between text-left ${prefix ? 'pl-32' : (leftIcon ? 'pl-10' : '')}`}
            {...props}
          >
            <span
              className={
                selectedOption
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500"
              }
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {rightIcon && (
            <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}

          {/* Dropdown */}
          <div
            className={`absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden transition-all duration-200 ease-in-out origin-top ${
              isOpen
                ? "opacity-100 scale-y-100 translate-y-0"
                : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
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
                  />
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto" ref={dropdownRef}>
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2">
                  <Loader2 className={`animate-spin text-primary-600`} />{" "}
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 flex items-center justify-between transition-colors duration-150 ${
                      highlightedIndex === index
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    } ${
                      option.value === value
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Check className="w-4 h-4" />}
                  </button>
                ))
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

Select.displayName = "Select";

export default Select;