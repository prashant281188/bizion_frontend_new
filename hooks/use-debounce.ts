// hooks/use-debounce.ts
import { useCallback, useEffect, useRef, useState } from "react";

/** Generic value debounce — kept for backward compatibility. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Search input hook.
 *
 * - `value`    → bind to <input value={}>.  Updates on every keystroke (no lag).
 * - `query`    → use in queryKey / queryFn.  Only updates after the user stops
 *                typing for `delay` ms — this is the only thing that triggers API calls.
 * - `onChange` → bind to <input onChange={}>.
 * - `reset`    → clears both immediately.
 * - `setValue` → programmatic override (e.g. initialise from URL params).
 */
export function useSearch(delay = 400, initial = "") {
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initial value when it changes externally (e.g. URL params on mount)
  const initialRef = useRef(initial);
  useEffect(() => {
    if (initialRef.current !== initial) {
      initialRef.current = initial;
      setValue(initial);
      setQuery(initial);
    }
  }, [initial]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setQuery(next), delay);
    },
    [delay],
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setValue("");
    setQuery("");
  }, []);

  // Clean up on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { value, query, onChange, reset, setValue };
}
