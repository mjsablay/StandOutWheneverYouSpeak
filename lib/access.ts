"use client";

/**
 * The single source of truth for what the interface should show.
 *
 * Every gate in the app should use this — not useAuth() directly — so that
 * an admin's "view as" preview actually changes the whole site rather than
 * just the home page.
 *
 * Presentation only. The database still enforces real permissions through
 * row-level security, so previewing never grants or removes actual access.
 */

import { useAuth } from "@/lib/mock-auth";
import { useViewAs } from "@/lib/view-as";

export type Audience = "visitor" | "pending" | "free" | "circle" | "admin";

export type Access = {
  audience: Audience;
  /** True while an admin is previewing as someone else. */
  previewing: boolean;
  loading: boolean;
  /** Show the interface as though signed in. */
  signedIn: boolean;
  /** Past the waitlist. */
  approved: boolean;
  /** Speakers' Circle content unlocked. */
  fullAccess: boolean;
  /** Show admin-only surfaces. */
  admin: boolean;
};

export function useAccess(): Access {
  const auth = useAuth();
  const { viewAs } = useViewAs();

  if (auth.loading) {
    return {
      audience: "visitor",
      previewing: false,
      loading: true,
      signedIn: false,
      approved: false,
      fullAccess: false,
      admin: false,
    };
  }

  // Admin previewing as someone else
  if (auth.isAdmin && viewAs !== "actual") {
    const previews: Record<string, Access> = {
      visitor: {
        audience: "visitor",
        previewing: true,
        loading: false,
        signedIn: false,
        approved: false,
        fullAccess: false,
        admin: false,
      },
      pending: {
        audience: "pending",
        previewing: true,
        loading: false,
        signedIn: true,
        approved: false,
        fullAccess: false,
        admin: false,
      },
      free: {
        audience: "free",
        previewing: true,
        loading: false,
        signedIn: true,
        approved: true,
        fullAccess: false,
        admin: false,
      },
      circle: {
        audience: "circle",
        previewing: true,
        loading: false,
        signedIn: true,
        approved: true,
        fullAccess: true,
        admin: false,
      },
    };
    if (previews[viewAs]) return previews[viewAs];
  }

  if (!auth.user) {
    return {
      audience: "visitor",
      previewing: false,
      loading: false,
      signedIn: false,
      approved: false,
      fullAccess: false,
      admin: false,
    };
  }

  const audience: Audience = auth.isAdmin
    ? "admin"
    : !auth.isApproved
      ? "pending"
      : auth.hasFullAccess
        ? "circle"
        : "free";

  return {
    audience,
    previewing: false,
    loading: false,
    signedIn: true,
    approved: auth.isApproved,
    fullAccess: auth.hasFullAccess,
    admin: auth.isAdmin,
  };
}
