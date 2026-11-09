// components/ui/GlobalFilter.jsx
import React from "react";

const GlobalFilter = ({ filters, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {filters.map((filter, index) => (
        <select
          key={index}
          value={filter.value}
          onChange={(e) => onChange(filter.key, e.target.value)}
          className="border border-gray-300 rounded-2xl px-4 py-2 w-40 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                     transition duration-300 ease-in-out shadow-sm hover:shadow-md"
        >
          {filter.options.map((option, idx) => (
            <option key={idx} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default GlobalFilter;
