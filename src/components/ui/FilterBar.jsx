import React from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import { X as XIcon, Search, Calendar } from "lucide-react";

/**
 * FilterBar - A highly reusable, professional filter bar for any page.
 */
const FilterBar = ({
  filters = [],
  onClear,
  showClear = true,
  className = "",
  searchable = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}) => {
  return (
    <div className={`flex items-center flex-wrap gap-4 ${className}`}>
      {searchable && (
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            rightIcon={
              searchValue ? (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange("")}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              ) : null
            }
            className="bg-white dark:bg-gray-800"
          />
        </div>
      )}

      {filters.map((filter) => {
        if (filter.type === "select") {
          return (
            <div key={filter.key} className="min-w-[140px]">
              <Select
                value={filter.value}
                onChange={filter.onChange}
                options={[...(filter.options || [])]}
                className={`py-1 px-3 text-sm ${filter.className || ""}`}
                placeholder={filter.placeholder || filter.label}
                prefix={filter.label}
              />
            </div>
          );
        }
        if (filter.type === "date") {
          return (
            <div key={filter.key} className="min-w-[140px]">
              <Input
                type="date"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                placeholder={filter.placeholder || filter.label}
                className={`${filter.className || ""}`}
                leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
                prefix={filter.label}
              />
            </div>
          );
        }
        // Default to text input
        return (
          <div key={filter.key} className="min-w-[140px]">
            <Input
              type="text"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              placeholder={filter.placeholder || filter.label}
              className={`${filter.className || ""}`}
              prefix={filter.label}
            />
          </div>
        );
      })}
      {showClear && filters.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-1"
        >
          <XIcon className="w-4 h-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
