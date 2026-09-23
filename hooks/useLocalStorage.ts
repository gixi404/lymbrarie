import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      try {
        const parsed = JSON.parse(item);
        // Type validation against initialValue to prevent legacy encrypted strings from poisoning non-string states
        if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
          return initialValue;
        }
        if (
          initialValue !== null &&
          initialValue !== undefined &&
          !Array.isArray(initialValue) &&
          typeof parsed !== typeof initialValue
        ) {
          return initialValue;
        }
        return parsed as T;
      } catch {
        // Fallback for unparseable legacy raw strings: only use item if initialValue is a string
        return typeof initialValue === "string" ? (item as unknown as T) : initialValue;
      }
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Silently fail on localStorage write errors
    }
  };
  return [storedValue, setValue] as const;
}

export default useLocalStorage;
