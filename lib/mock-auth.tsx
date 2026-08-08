"use client";

/**
 * Real authentication, backed by Supabase.
 *
 * The file name is kept so imports across the app don't churn; the demo
 * localStorage implementation it replaced is gone. Access rules now live in
 * the database as Row-Level Security policies, so a user editing anything
 * in their browser cannot grant themselves paid or admin access.
 *
 * TWO SEPARATE CONCEPTS — don't conflate them:
 *   role : what you're allowed to DO   (admin | member)
 *   tier : what you've PAID for        (free  | circle)
 * Admins see everything regardless of tier.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type Tier = "free" | "circle";
export type Role = "admin" | "member";

export type Profile = {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  role: Role;
  headline?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  school?: string | null;
  company?: string | null;
  role_title?: string | null;
  location?: string | null;
};

type AuthValue = {
  user: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  hasFullAccess: boolean;
  signInWithEmail: (email: string, next?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

type Row = {
  id: string;
  email: string;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  school: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  role: Role;
  tier: Tier;
};

const toProfile = (r: Row): Profile => ({
  id: r.id,
  email: r.email,
  name: r.display_name || r.email.split("@")[0],
  tier: r.tier,
  role: r.role,
  headline: r.headline,
  bio: r.bio,
  linkedin: r.linkedin_url,
  school: r.school,
  company: r.company,
  role_title: r.job_title,
  location: r.location,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "id,email,display_name,headline,bio,linkedin_url,school,company,job_title,location,role,tier",
        )
        .eq("id", userId)
        .single();
      setUser(data ? toProfile(data as Row) : null);
    },
    [supabase],
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (data.user) await loadProfile(data.user.id);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) await loadProfile(session.user.id);
      else setUser(null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const signInWithEmail = useCallback(
    async (email: string, next?: string) => {
      const redirect = `${window.location.origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      return error ? { error: error.message } : {};
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!user) return { error: "Not signed in" };
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: patch.name,
          headline: patch.headline,
          bio: patch.bio,
          linkedin_url: patch.linkedin,
          school: patch.school,
          company: patch.company,
          job_title: patch.role_title,
          location: patch.location,
        })
        .eq("id", user.id);
      if (error) return { error: error.message };
      await loadProfile(user.id);
      return {};
    },
    [supabase, user, loadProfile],
  );

  const refresh = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const value: AuthValue = {
    user,
    loading,
    isAdmin: user?.role === "admin",
    hasFullAccess: user?.role === "admin" || user?.tier === "circle",
    signInWithEmail,
    signOut,
    updateProfile,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const initialsOf = (name: string) =>
  name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  member: "Member",
};

export const TIER_LABEL: Record<Tier, string> = {
  free: "Front Row",
  circle: "Speakers' Circle",
};

/** Kept for compatibility with existing imports. */
export type MockUser = Profile;
