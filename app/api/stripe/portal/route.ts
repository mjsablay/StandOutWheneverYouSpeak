import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { missingStripeConfig, stripe } from "@/lib/stripe";

/**
 * Sends a member to Stripe's billing portal, where they can change their
 * card, read invoices, or cancel.
 *
 * Cancelling is deliberately not something this app implements itself. The
 * portal is Stripe's own hosted page, it is always correct about what the
 * subscription actually says, and a cancellation made there comes back to us
 * as a signed webhook like any other change. Building our own cancel button
 * would mean a second path to the truth, and two paths disagree eventually.
 */

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const missing = missingStripeConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Payments aren't switched on yet. Set ${missing.join(" and ")} in Vercel.` },
      { status: 501 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    return NextResponse.json(
      { error: "There's no billing record on this account yet." },
      { status: 404 },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // The portal needs configuring once in the Stripe dashboard. Say so
    // rather than showing a raw API error.
    const hint = /configuration/i.test(message)
      ? " Stripe needs its customer portal set up once, under Settings → Billing → Customer portal."
      : "";
    return NextResponse.json(
      { error: `Stripe refused the request: ${message}${hint}` },
      { status: 502 },
    );
  }
}
