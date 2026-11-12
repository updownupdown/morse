import { useCallback, useState } from "react";

// State that persists in localStorage. `revive` can repair or upgrade
// whatever was stored (e.g. fill in settings added since it was saved).
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  revive?: (stored: unknown) => T,
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      return revive ? revive(parsed) : parsed;
    } catch (error) {
      return initialValue;
    }
  });

  // Same API as useState's setter. Functional updates always see the
  // latest value, so several updates in a row don't overwrite each other.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          // Storage full or unavailable: keep working from memory
        }

        return valueToStore;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
