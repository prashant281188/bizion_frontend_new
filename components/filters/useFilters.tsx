import { useState } from "react";

export function useFilters<T extends object>(initial: T) {
  const [filters, setFilters] = useState<T>(initial);

  const setFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(initial);
  };

  return {
    filters,
    setFilter,
    resetFilters,
  };
}