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
export type Status = "pending" | "approved" | "declined";

export type HeadlineMode = "custom" | "school" | "work";

export type Profile = {
  id: string;
  email: string;
  /** Full name, kept in sync by the database from first + last. */
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  headline_mode?: HeadlineMode;
  tier: Tier;
  role: Role;
  status: Status;
  headline?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  school?: string | null;
  company?: string | null;
  role_title?: string | null;
  location?: string | null;
};

export type OAuthProvider = "google" | "azure" | "linkedin_oidc";

type AuthValue = {
  user: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  /** Admin has approved this account off the waitlist. */
  isApproved: boolean;
  /** Approved AND (paid or admin) — gates Speakers' Circle content. */
  hasFullAccess: boolean;
  signInWithEmail: (email: string, next?: string) => Promise<{ error?: string }>;
  signInWithProvider: (
    provider: OAuthProvider,
    next?: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ error?: string }>;
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
  status: Status;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  headline_mode: HeadlineMode;
};

const toProfile = (r: Row): Profile => ({
  id: r.id,
  email: r.email,
  name: r.display_name || r.email.split("@")[0],
  first_name: r.first_name,
  last_name: r.last_name,
  avatar_url: r.avatar_url,
  headline_mode: r.headline_mode,
  tier: r.tier,
  role: r.role,
  status: r.status,
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
          "id,email,display_name,first_name,last_name,avatar_url,headline,headline_mode,bio,linkedin_url,school,company,job_title,location,role,tier,status",
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

  const signInWithProvider = useCallback(
    async (provider: OAuthProvider, next?: string) => {
      const redirect = `${window.location.origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirect },
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
      const fields: Record<string, unknown> = {
        first_name: patch.first_name,
        last_name: patch.last_name,
        headline: patch.headline,
        headline_mode: patch.headline_mode,
        bio: patch.bio,
        linkedin_url: patch.linkedin,
        school: patch.school,
        company: patch.company,
        job_title: patch.role_title,
        location: patch.location,
        avatar_url: patch.avatar_url,
      };
      // Only send keys the caller actually supplied.
      Object.keys(fields).forEach(
        (k) => fields[k] === undefined && delete fields[k],
      );

      const { error } = await supabase
        .from("profiles")
        .update(fields)
        .eq("id", user.id);
      if (error) return { error: error.message };
      await loadProfile(user.id);
      return {};
    },
    [supabase, user, loadProfile],
  );

  /** Uploads an avatar to storage and saves the public URL on the profile. */
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return { error: "Not signed in" };
      if (file.size > 2 * 1024 * 1024)
        return { error: "Image must be under 2 MB." };

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) return { error: upErr.message };

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (dbErr) return { error: dbErr.message };

      await loadProfile(user.id);
      return {};
    },
    [supabase, user, loadProfile],
  );

  const refresh = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const isAdmin = user?.role === "admin";
  const isApproved = isAdmin || user?.status === "approved";

  const value: AuthValue = {
    user,
    loading,
    isAdmin,
    isApproved,
    hasFullAccess: isAdmin || (isApproved && user?.tier === "circle"),
    signInWithEmail,
    signInWithProvider,
    signOut,
    updateProfile,
    uploadAvatar,
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
