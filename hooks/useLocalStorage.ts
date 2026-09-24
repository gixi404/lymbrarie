import { useEffect, useState } from "react";

const EVENT_NAME = "lymbrarie-local-storage";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      try {
        const parsed = JSON.parse(item);
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
        if (typeof parsed === "string" && parsed.startsWith("U2FsdGVk")) {
          return initialValue;
        }
        return parsed as T;
      } catch {
        return typeof initialValue === "string" && !item.startsWith("U2FsdGVk")
          ? (item as unknown as T)
          : initialValue;
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
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(
          new CustomEvent(EVENT_NAME, {
            detail: { key, value: valueToStore },
          })
        );
      }
    } catch {
      // Silently fail on localStorage write errors
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleCustomEvent(e: Event) {
      const customEvt = e as CustomEvent<{ key: string; value: T }>;
      if (customEvt.detail?.key === key) {
        setStoredValue(customEvt.detail.value);
      }
    }

    function handleStorageEvent(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue as unknown as T);
        }
      }
    }

    window.addEventListener(EVENT_NAME, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
