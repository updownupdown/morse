import { useCallback, useEffect, useState } from "react";
import { Modes } from "../context/MorseContext";

// Each screen has its own address, so the browser's back button works
// and any screen can be linked to directly.
export const modeRoutes: Record<Modes, string> = {
  [Modes.Home]: "",
  [Modes.Learn]: "learn",
  [Modes.Send]: "practice/send",
  [Modes.Receive]: "practice/receive",
  [Modes.Translate]: "translate",
};

export type Route = {
  mode: Modes;
  // Anything after the mode's own path, e.g. the game in "#/play/rain"
  param?: string;
};

export function routeToHash({ mode, param }: Route) {
  return `#/${modeRoutes[mode]}${param ? `/${param}` : ""}`;
}

export function modeToHash(mode: Modes) {
  return routeToHash({ mode });
}

export function hashToRoute(hash: string, practiceMode: Modes): Route {
  const path = hash
    .replace(/^#\/?/, "")
    .replace(/\/+$/, "")
    .toLowerCase();

  // "#/practice" opens whichever practice mode was used last
  if (path === "practice") return { mode: practiceMode };

  const modes = Object.keys(modeRoutes) as Modes[];

  const exact = modes.find((mode) => modeRoutes[mode] === path);
  if (exact) return { mode: exact };

  // Longest matching prefix, with the rest as the parameter
  const prefixed = modes
    .filter(
      (mode) => modeRoutes[mode] !== "" && path.startsWith(modeRoutes[mode] + "/"),
    )
    .sort((a, b) => modeRoutes[b].length - modeRoutes[a].length)[0];

  if (prefixed) {
    return {
      mode: prefixed,
      param: path.slice(modeRoutes[prefixed].length + 1),
    };
  }

  return { mode: Modes.Home };
}

export function useHashRoute(practiceMode: Modes) {
  const [route, setRouteState] = useState<Route>(() =>
    hashToRoute(window.location.hash, practiceMode),
  );

  useEffect(() => {
    const onHashChange = () => {
      setRouteState(hashToRoute(window.location.hash, practiceMode));
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [practiceMode]);

  const setRoute = useCallback((newRoute: Route) => {
    const hash = routeToHash(newRoute);

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setRouteState(newRoute);
  }, []);

  return [route, setRoute] as const;
}
