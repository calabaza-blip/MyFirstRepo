import { useCallback, useState } from 'react';

/**
 * React hook for persisting state in localStorage with JSON serialization.
 * @param key - The localStorage key to read/write.
 * @param initialValue - Value used when no stored data exists or parsing fails.
 * @returns A tuple of `[storedValue, setValue, removeValue]`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore write errors (private browsing, quota exceeded)
      }
    },
    [key],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
