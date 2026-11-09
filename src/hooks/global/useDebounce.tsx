import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value over a specified delay
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default is 500ms)
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(handler); // Clear the timeout if value changes or on unmount
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
