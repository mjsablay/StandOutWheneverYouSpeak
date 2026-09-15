import "server-only";

import Stripe from "stripe";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Stripe, server side only.
 *
 * Nothing here may be imported from a Client Component: the secret key is
 * the whole bank. `server-only` makes that a build error rather than a
 * discovery in production.
 *
 * Every route degrades the way the invite and Katya routes do — if the keys
 * are missing it says exactly which one to set, instead of failing in a way
 * that looks like a bug.
 */

export const STRIPE_KEYS = {
  secret: () => process.env.STRIPE_SECRET_KEY?.trim() ?? "",
  webhook: () => process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "",
  price: () => process.env.STRIPE_PRICE_ID?.trim() ?? "",
};

/** Which required variables are missing, in the order you'd set them. */
export function missingStripeConfig(): string[] {
  const missing: string[] = [];
  if (!STRIPE_KEYS.secret()) missing.push("STRIPE_SECRET_KEY");
  if (!STRIPE_KEYS.price()) missing.push("STRIPE_PRICE_ID");
  return missing;
}

export const stripeReady = () => missingStripeConfig().length === 0;

let cached: Stripe | null = null;

export function stripe(): Stripe {
  const key = STRIPE_KEYS.secret();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  // The SDK pins its own API version; don't override it here or the shape of
  // the objects below changes under you.
  if (!cached) cached = new Stripe(key);
  return cached;
}

/** True while pointed at Stripe's test mode, so the UI can say so. */
export const isTestMode = () => STRIPE_KEYS.secret().startsWith("sk_test_");

/**
 * Supabase client that bypasses row-level security.
 *
 * Billing writes `profiles.tier` and `profiles.stripe_customer_id`, which
 * migration 0010's trigger refuses from anyone but an admin or the service
 * role. That is deliberate: paying is the only way a member's tier should
 * ever change, and this is the only code that may do it.
 */
export function billingDb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const hasServiceKey = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

/**
 * When the current paid period ends.
 *
 * In the API version this SDK pins (2026-08-26.dahlia) `current_period_end`
 * is a property of the subscription *item*, not of the subscription. Reading
 * `subscription.current_period_end` returns undefined and silently stores
 * null, which is how a billing page ends up unable to say when a plan
 * renews.
 */
export function periodEnd(sub: Stripe.Subscription): string | null {
  const seconds = sub.items?.data?.[0]?.current_period_end;
  return typeof seconds === "number"
    ? new Date(seconds * 1000).toISOString()
    : null;
}

/** The Price a subscription is on, whatever shape Stripe expanded it to. */
export function priceIdOf(sub: Stripe.Subscription): string | null {
  const price = sub.items?.data?.[0]?.price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

/** A customer reference can come back as an id or an expanded object. */
export function customerIdOf(
  customer: string | { id: string } | null | undefined,
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}
