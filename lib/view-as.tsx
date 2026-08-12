"use client";

/**
 * Admin "view as" preview state.
 *
 * Stored in sessionStorage so it survives navigation but clears when the
 * tab closes — you can't accidentally leave yourself in preview forever.
 * Read this through useAccess() rather than directly.
 */

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ViewAs = "actual" | "visitor" | "pending" | "free" | "circle";

const KEY = "standout.viewAs";
const EVENT = "standout:viewas";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): ViewAs {
  try {
    return (window.sessionStorage.getItem(KEY) as ViewAs | null) ?? "actual";
  } catch {
    return "actual";
  }
}

const getServerSnapshot = (): ViewAs => "actual";

type Ctx = { viewAs: ViewAs; setViewAs: (v: ViewAs) => void };

const ViewAsContext = createContext<Ctx>({
  viewAs: "actual",
  setViewAs: () => {},
});

export function ViewAsProvider({ children }: { children: ReactNode }) {
  const viewAs = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setViewAs = useCallback((v: ViewAs) => {
    try {
      if (v === "actual") window.sessionStorage.removeItem(KEY);
      else window.sessionStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return (
    <ViewAsContext.Provider value={{ viewAs, setViewAs }}>
      {children}
    </ViewAsContext.Provider>
  );
}

export const useViewAs = () => useContext(ViewAsContext);

export const VIEW_OPTIONS: { value: ViewAs; label: string }[] = [
  { value: "actual", label: "Admin" },
  { value: "visitor", label: "Visitor" },
  { value: "pending", label: "Waitlisted" },
  { value: "free", label: "Front Row" },
  { value: "circle", label: "Circle" },
];
