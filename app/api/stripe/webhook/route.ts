import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { isEntitled } from "@/lib/pricing";
import {
  billingDb,
  customerIdOf,
  hasServiceKey,
  periodEnd,
  priceIdOf,
  STRIPE_KEYS,
  stripe,
} from "@/lib/stripe";

/**
 * The only thing in this codebase that may turn someone into a paying member.
 *
 * WHY IT IS THE ONLY THING
 * `profiles.tier` is what every lock on the site reads. The browser cannot
 * write it (migration 0010's trigger refuses everyone but an admin and the
 * service role), and the checkout success page deliberately grants nothing —
 * anyone can type that URL. A Stripe-signed webhook is the only evidence
 * that money actually moved.
 *
 * ORDER DOES NOT MATTER
 * Stripe does not promise delivery order, and retries mean the same event
 * can arrive twice. So no handler trusts the event body's snapshot of the
 * subscription: each one re-fetches the subscription and writes whatever is
 * true *now*. Replaying yesterday's event therefore converges on today's
 * answer instead of resurrecting a stale one.
 *
 * NOTE FOR proxy.ts
 * This path is allowed through the pre-launch gate explicitly. Without that
 * it would be redirected to "/", Stripe would read the 307 as a failed
 * delivery, and retry forever while nobody's membership ever activated.
 */

/** Events worth acting on. Anything else is acknowledged and ignored. */
const HANDLED = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: NextRequest) {
  const secret = STRIPE_KEYS.webhook();
  if (!secret || !STRIPE_KEYS.secret() || !hasServiceKey()) {
    // 501 rather than 500: nothing is broken, it just isn't configured.
    return NextResponse.json(
      { error: "Billing is not configured on this deployment." },
      { status: 501 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature." }, { status: 400 });
  }

  // Must be the raw body, byte for byte. Parsing it first would change the
  // bytes and every signature check would fail.
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, signature, secret);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // A bad signature is either a misconfigured secret or someone trying it
    // on. Either way it is never an event.
    return NextResponse.json(
      { error: `Signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  if (!HANDLED.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    const subscriptionId = subscriptionIdFrom(event);
    if (!subscriptionId) {
      return NextResponse.json({ received: true, note: "no subscription on event" });
    }

    const sub = await stripe().subscriptions.retrieve(subscriptionId);
    const result = await syncSubscription(sub);
    return NextResponse.json({ received: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // 500 asks Stripe to retry, which is what we want for a transient
    // database or network failure.
    return NextResponse.json(
      { error: `Could not apply ${event.type}: ${message}` },
      { status: 500 },
    );
  }
}

/** Pull the subscription id out of whichever event shape arrived. */
function subscriptionIdFrom(event: Stripe.Event): string | null {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription") return null;
    return typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription?.id ?? null);
  }
  const sub = event.data.object as Stripe.Subscription;
  return sub.id ?? null;
}

/**
 * Write the subscription to the database and set the member's tier to match.
 * Safe to run repeatedly with the same input.
 */
async function syncSubscription(sub: Stripe.Subscription) {
  const db = billingDb();
  const customerId = customerIdOf(sub.customer);

  // Find the member. The customer id is the normal route; the metadata we
  // stamped at checkout is the fallback if a customer record was ever
  // recreated by hand in the dashboard.
  let userId: string | null = null;

  if (customerId) {
    const { data } = await db
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = (data?.id as string) ?? null;
  }

  if (!userId) {
    const fromMetadata = sub.metadata?.user_id;
    if (fromMetadata) {
      const { data } = await db
        .from("profiles")
        .select("id")
        .eq("id", fromMetadata)
        .maybeSingle();
      userId = (data?.id as string) ?? null;
      // Heal the link so the next event takes the fast path.
      if (userId && customerId) {
        await db
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }
    }
  }

  if (!userId) {
    // Acknowledge rather than 500: retrying will not conjure a member, and
    // an endlessly failing webhook is noise that hides real failures.
    return { note: "no matching member", customer: customerId };
  }

  const entitled = isEntitled(sub.status);

  const { error: subError } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      status: sub.status,
      price_id: priceIdOf(sub),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      current_period_end: periodEnd(sub),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (subError) throw new Error(subError.message);

  // The entitlement itself. An admin who lets a subscription lapse still has
  // full access through their role, so this is safe to apply to anyone.
  const { error: tierError } = await db
    .from("profiles")
    .update({ tier: entitled ? "circle" : "free" })
    .eq("id", userId);
  if (tierError) throw new Error(tierError.message);

  return { user: userId, status: sub.status, tier: entitled ? "circle" : "free" };
}
