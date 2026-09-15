"use client";

/**
 * The member's own subscription, read from the database.
 *
 * Read-only by construction: `subscriptions` has one SELECT policy and no
 * write policy at all, so there is nothing a browser could do to this table
 * even if it tried. Everything here comes from what the Stripe webhook
 * recorded.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/mock-auth";

export type Subscription = {
  status: string;
  price_id: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  updated_at: string | null;
};

export function useSubscription() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("status,price_id,cancel_at_period_end,current_period_end,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    setSubscription((data as Subscription | null) ?? null);
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { subscription, loading, reload: load };
}

/** POSTs to a billing route and follows the Stripe URL it returns. */
export async function goToStripe(
  path: "/api/stripe/checkout" | "/api/stripe/portal",
): Promise<{ error?: string }> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST" });
  } catch (e) {
    return { error: `Could not reach the server: ${(e as Error).message}` };
  }

  // A signed-out session is redirected to the sign-in page, which arrives as
  // HTML with a 200. Anything that isn't JSON is a failure, not a session.
  if (!res.headers.get("content-type")?.includes("application/json")) {
    return { error: "You've been signed out. Sign in again to continue." };
  }

  const body = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !body.url) {
    return { error: body.error ?? `Something went wrong (${res.status}).` };
  }

  window.location.assign(body.url);
  return {};
}

export const formatPeriodEnd = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
