import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  billingDb,
  hasServiceKey,
  missingStripeConfig,
  STRIPE_KEYS,
  stripe,
} from "@/lib/stripe";

/**
 * Starts a Stripe Checkout session and hands back the URL to send them to.
 *
 * This route decides *who may pay*, not who has paid. It grants nothing: a
 * member's tier changes only when Stripe tells the webhook the money
 * arrived. That separation is the point — the success page can be forged by
 * anyone with a browser, a signed webhook cannot.
 */

export async function POST(request: NextRequest) {
  // ---- 1. Who is asking ----
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,tier,status,role,stripe_customer_id,display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "No profile found." }, { status: 404 });
  }

  // Being past the waitlist is the prerequisite for paying. Taking money
  // from someone who then cannot get in would be the worst possible bug.
  const isAdmin = profile.role === "admin";
  if (profile.status !== "approved" && !isAdmin) {
    return NextResponse.json(
      { error: "Your place hasn't been approved yet, so there's nothing to pay for." },
      { status: 403 },
    );
  }

  if (profile.tier === "circle") {
    return NextResponse.json(
      { error: "You're already a Speakers' Circle member." },
      { status: 409 },
    );
  }

  // ---- 2. Is billing switched on ----
  const missing = missingStripeConfig();
  if (missing.length > 0 || !hasServiceKey()) {
    if (!hasServiceKey()) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      {
        needsConfig: missing,
        error: `Payments aren't switched on yet. Set ${missing.join(" and ")} in Vercel.`,
      },
      { status: 501 },
    );
  }

  // ---- 3. Find or make their Stripe customer ----
  // Stored on the profile so a member keeps one customer record across
  // cancel-and-resubscribe, which keeps their invoice history in one place.
  const admin = billingDb();
  let customerId = profile.stripe_customer_id as string | null;

  try {
    if (customerId) {
      // A customer deleted in the Stripe dashboard would 404 forever
      // otherwise, so fall through to making a new one.
      const existing = await stripe().customers.retrieve(customerId);
      if ((existing as { deleted?: boolean }).deleted) customerId = null;
    }

    if (!customerId) {
      const created = await stripe().customers.create({
        email: profile.email as string,
        name: (profile.display_name as string) || undefined,
        // The webhook uses the customer id to find the member, but this is
        // the belt-and-braces path if that lookup ever misses.
        metadata: { user_id: user.id },
      });
      customerId = created.id;
      const { error } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (error) {
        return NextResponse.json(
          { error: `Could not save the billing record: ${error.message}` },
          { status: 500 },
        );
      }
    }

    // ---- 4. The session ----
    const origin = new URL(request.url).origin;
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: STRIPE_KEYS.price(), quantity: 1 }],
      // Both of these are read by the webhook when the session completes.
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?status=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Stripe refused the request: ${message}` },
      { status: 502 },
    );
  }
}
