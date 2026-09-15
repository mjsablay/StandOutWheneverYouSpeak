"use client";

import Link from "next/link";
import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { formatPeriodEnd, goToStripe, useSubscription } from "@/lib/billing";
import {
  PLAN,
  STATUS_LABEL,
  commitmentLine,
  isEntitled,
  priceWithInterval,
} from "@/lib/pricing";

/**
 * What the member is paying, and the way out.
 *
 * Everything shown here is what the Stripe webhook recorded, so it says
 * nothing the payment processor hasn't confirmed. Changing a card or
 * cancelling happens in Stripe's own portal rather than in a form here —
 * one source of truth, and the change comes back to us as a signed event.
 */
export default function BillingPanel() {
  const { user, isAdmin } = useAuth();
  const { subscription, loading } = useSubscription();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const open = async (path: "/api/stripe/checkout" | "/api/stripe/portal") => {
    setBusy(true);
    setError(null);
    const { error } = await goToStripe(path);
    if (error) {
      setError(error);
      setBusy(false);
    }
  };

  const paying = isEntitled(subscription?.status);
  const renews = formatPeriodEnd(subscription?.current_period_end ?? null);

  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
      <div className="mb-1 flex items-center gap-2.5">
        <CreditCard className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
        <h2 className="text-lg font-bold">Billing</h2>
      </div>

      {loading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-paper-warm" />
      ) : paying ? (
        <>
          <p className="mb-4 mt-2 text-[14.5px] text-ink-soft">
            You&apos;re on {PLAN.name} at {priceWithInterval}.{" "}
            {subscription?.cancel_at_period_end
              ? renews
                ? `Your membership is set to end on ${renews}, and you keep access until then.`
                : "Your membership is set to end when the current period does."
              : renews
                ? `It renews on ${renews}.`
                : ""}
          </p>
          {subscription?.status === "trialing" && (
            <p className="mb-4 text-[14px] text-ink-soft">
              You&apos;re in a free trial.
            </p>
          )}
          <button
            onClick={() => void open("/api/stripe/portal")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[14px] font-semibold transition hover:bg-paper-warm disabled:opacity-60"
          >
            <ExternalLink className="h-4 w-4 text-brand" strokeWidth={2} />
            {busy ? "Opening Stripe…" : "Manage or cancel"}
          </button>
        </>
      ) : subscription ? (
        <>
          <p className="mb-4 mt-2 text-[14.5px] text-ink-soft">
            Your {PLAN.name} membership is{" "}
            <strong className="text-ink">
              {(STATUS_LABEL[subscription.status] ?? subscription.status).toLowerCase()}
            </strong>
            {subscription.status === "past_due"
              ? ", so a payment didn't go through. Updating your card will put it right."
              : "."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void open("/api/stripe/portal")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[14px] font-semibold transition hover:bg-paper-warm disabled:opacity-60"
            >
              <ExternalLink className="h-4 w-4 text-brand" strokeWidth={2} />
              Update payment details
            </button>
            <button
              onClick={() => void open("/api/stripe/checkout")}
              disabled={busy}
              className="rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              Start again
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4 mt-2 text-[14.5px] text-ink-soft">
            You&apos;re on {PLAN.free}, which is free.{" "}
            {isAdmin
              ? "Your administrator account already opens everything, so there's nothing to pay for."
              : `${PLAN.name} is ${priceWithInterval} and opens every lesson, the practice topics and coaching with Katya. ${commitmentLine}`}
          </p>
          {!isAdmin && (
            <Link
              href="/checkout"
              className="inline-block rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-dark"
            >
              Join {PLAN.name}
            </Link>
          )}
        </>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-line bg-paper-warm p-3.5 text-[13.5px] text-ink-soft">
          {error}
        </p>
      )}
    </div>
  );
}
