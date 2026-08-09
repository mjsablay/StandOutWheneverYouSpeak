"use client";

/**
 * Admin "view as" preview.
 *
 * Lets an administrator see the site as a visitor, a free member, or a paid
 * member — without signing out. This only changes what the interface renders;
 * the database still enforces the real permissions, so an admin previewing
 * "visitor" would still be allowed to fetch admin data if they asked for it
 * directly. It's a design tool, not a security boundary.
 */

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ViewAs = "actual" | "visitor" | "free" | "circle";

const KEY = "standout.viewAs";

type Ctx = {
  viewAs: ViewAs;
  setViewAs: (v: ViewAs) => void;
};

const ViewAsContext = createContext<Ctx>({
  viewAs: "actual",
  setViewAs: () => {},
});

const EVENT = "standout:viewas";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function getSnapshot(): ViewAs {
  try {
    return (window.sessionStorage.getItem(KEY) as ViewAs | null) ?? "actual";
  } catch {
    return "actual";
  }
}

const getServerSnapshot = (): ViewAs => "actual";

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

import { useAuth } from "@/lib/mock-auth";

export type Audience = "visitor" | "pending" | "free" | "circle" | "admin";

/**
 * What the interface should render for, honouring an admin's preview choice.
 * Use this for presentation decisions; use useAuth() for real permissions.
 */
export function useAudience(): {
  audience: Audience;
  previewing: boolean;
  loading: boolean;
} {
  const { user, loading, isAdmin, isApproved, hasFullAccess } = useAuth();
  const { viewAs } = useViewAs();

  if (loading) return { audience: "visitor", previewing: false, loading: true };

  if (isAdmin && viewAs !== "actual") {
    const map: Record<string, Audience> = {
      visitor: "visitor",
      free: "free",
      circle: "circle",
    };
    return { audience: map[viewAs] ?? "admin", previewing: true, loading: false };
  }

  if (!user) return { audience: "visitor", previewing: false, loading: false };
  if (isAdmin) return { audience: "admin", previewing: false, loading: false };
  if (!isApproved) return { audience: "pending", previewing: false, loading: false };
  return {
    audience: hasFullAccess ? "circle" : "free",
    previewing: false,
    loading: false,
  };
}

export const VIEW_LABEL: Record<Exclude<ViewAs, "actual">, string> = {
  visitor: "Signed-out visitor",
  free: "Front Row member",
  circle: "Speakers' Circle member",
};
