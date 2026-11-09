import { useState, useEffect } from 'react';

/**
 * Custom hook to persist state in sessionStorage and restore it when navigating back
 * @param {string} key - Unique key for storing the state
 * @param {any} defaultValue - Default value if no stored state exists
 * @param {boolean} persistInUrl - Whether to also persist in URL search params
 * @param {any} initialOverride - Optional scoped-link value, ahead of saved state on mount
 * @returns {[any, function]} - [currentValue, setValue]
 */
export const usePersistentState = (key, defaultValue, persistInUrl = false, initialOverride) => {
  // Get initial value from sessionStorage or URL params
  const getInitialValue = () => {
    // A scoped navigation link takes precedence over a previous saved filter.
    // Pages using this option remount their content on location.key changes.
    if (initialOverride !== undefined) return initialOverride;
    try {
      if (persistInUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlValue = urlParams.get(key);
        if (urlValue !== null) {
          // Try to parse as JSON, fallback to string
          try {
            return JSON.parse(urlValue);
          } catch {
            return urlValue;
          }
        }
      }

      const stored = sessionStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn(`Error reading stored value for ${key}:`, error);
    }
    return defaultValue;
  };

  const [value, setValue] = useState(getInitialValue);

  // Update sessionStorage and URL when value changes
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));

      if (persistInUrl) {
        const urlParams = new URLSearchParams(window.location.search);
        if (value !== defaultValue && value !== '' && value !== null && value !== undefined) {
          urlParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        } else {
          urlParams.delete(key);
        }

        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (error) {
      console.warn(`Error storing value for ${key}:`, error);
    }
  }, [key, value, defaultValue, persistInUrl]);

  return [value, setValue];
};

/**
 * Hook specifically for filter state persistence
 * @param {string} pageKey - Unique key for the page (e.g., 'users', 'products')
 * @param {object} defaultFilters - Default filter values
 * @returns {[object, function]} - [filters, setFilters]
 */
export const useFilterPersistence = (pageKey, defaultFilters = {}) => {
  const [filters, setFilters] = usePersistentState(`${pageKey}_filters`, defaultFilters, true);

  // Helper to update a specific filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Helper to clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return [filters, updateFilter, clearFilters];
};
