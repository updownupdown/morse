import { useEffect } from "react";

type Sentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<Sentinel> };
};

// Keeps the screen awake while `active`, where the browser allows it.
// The lock is dropped whenever the page is hidden, so it's taken again
// on return.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!active || !wakeLock) return;

    let sentinel: Sentinel | null = null;
    let cancelled = false;

    const request = () => {
      if (document.visibilityState !== "visible") return;

      wakeLock
        .request("screen")
        .then((lock) => {
          if (cancelled) lock.release().catch(() => {});
          else sentinel = lock;
        })
        .catch(() => {});
    };

    request();
    document.addEventListener("visibilitychange", request);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
