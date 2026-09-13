"use client";

/**
 * Waitlist triage.
 *
 * Calls `admin_waitlist()`, which joins each profile to its auth record so an
 * administrator can see how someone signed up rather than just that they did.
 * It is a function rather than a view so that `auth.users` is never reachable
 * through a selectable object in the public schema.
 *
 * THE ONE THING TO UNDERSTAND HERE: a confirmed email address does not mean a
 * person. Corporate mail filters open every link in every message to scan it,
 * and opening a magic link marks the address confirmed. That is why
 * `link_opened` sits below `signed_in` — nobody ever arrived.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Role, Status, Tier } from "@/lib/mock-auth";

/** Strongest evidence first. */
export type Verification = "oauth" | "signed_in" | "link_opened" | "unverified";

export type WaitlistRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  status: Status;
  role: Role;
  tier: Tier;
  signed_up_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  provider: string;
  verification: Verification;
  automation_signals: string[];
};

export const VERIFICATION_ORDER: Verification[] = [
  "oauth",
  "signed_in",
  "link_opened",
  "unverified",
];

export const VERIFICATION_LABEL: Record<Verification, string> = {
  oauth: "Identity confirmed",
  signed_in: "Signed in",
  link_opened: "Link opened only",
  unverified: "Nothing confirmed",
};

export const VERIFICATION_MEANING: Record<Verification, string> = {
  oauth:
    "Signed up through Google, Microsoft or LinkedIn. Someone had to be logged into that account, so this is a real person.",
  signed_in:
    "Used their email link and reached the site. A session exists, so someone was here.",
  link_opened:
    "The address exists and a link was opened, but no one ever arrived. Usually a corporate mail scanner clicking links automatically — not a person.",
  unverified:
    "An address typed into a form and nothing since. No evidence anyone owns it.",
};

/** The two levels that mean a human demonstrably held the account. */
export const isRealPerson = (v: Verification) =>
  v === "oauth" || v === "signed_in";

export const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  azure: "Microsoft",
  linkedin_oidc: "LinkedIn",
  email: "Email link",
};

export function useWaitlist(enabled: boolean) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc("admin_waitlist");
    if (error) setError(error.message);
    else
      setRows(
        ((data ?? []) as WaitlistRow[])
          .slice()
          .sort((a, b) => b.signed_up_at.localeCompare(a.signed_up_at)),
      );
    setLoading(false);
  }, [supabase, enabled]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  /**
   * Moves accounts between statuses. Declining is reversible — nothing is
   * deleted — so a mistake costs one click to undo.
   */
  const setStatus = useCallback(
    async (ids: string[], status: Status, approvedBy?: string) => {
      if (ids.length === 0) return {};
      const payload: Record<string, unknown> = { status };
      if (status === "approved") {
        payload.approved_at = new Date().toISOString();
        payload.approved_by = approvedBy;
      }
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .in("id", ids);
      if (error) return { error: error.message };
      setRows((r) =>
        r.map((x) => (ids.includes(x.id) ? { ...x, status } : x)),
      );
      return {};
    },
    [supabase],
  );

  /** Tier and role live on the profile; admins may change either. */
  const patch = useCallback(
    async (id: string, changes: Partial<Pick<WaitlistRow, "tier" | "role">>) => {
      const { error } = await supabase.from("profiles").update(changes).eq("id", id);
      if (error) return { error: error.message };
      setRows((r) => r.map((x) => (x.id === id ? { ...x, ...changes } : x)));
      return {};
    },
    [supabase],
  );

  return { rows, loading, error, reload: load, setStatus, patch };
}
