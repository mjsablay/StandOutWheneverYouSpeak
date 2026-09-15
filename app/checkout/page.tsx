"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Wrap, Section, PageSkeleton, Check } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { goToStripe } from "@/lib/billing";
import {
  CIRCLE_INCLUDES,
  PLAN,
  commitmentLine,
  priceLabel,
} from "@/lib/pricing";

/**
 * Starting a subscription.
 *
 * The page never grants anything. Paying happens on Stripe's own page, and
 * membership is switched on by the webhook when Stripe says the money
 * arrived — so the "success" state here waits for that to land rather than
 * claiming it already has. Anyone can type ?status=success into the address
 * bar; that must not be worth doing.
 */

function Success() {
  const { user, refresh } = useAuth();
  const access = useAccess();
  const [waited, setWaited] = useState(0);

  // The webhook usually lands before the redirect does, but not always.
  // Re-read the profile a few times rather than either lying or leaving them
  // on a spinner forever.
  useEffect(() => {
    if (access.fullAccess || waited > 10) return;
    const id = setTimeout(() => {
      void refresh();
      setWaited((n) => n + 1);
    }, 1500);
    return () => clearTimeout(id);
  }, [access.fullAccess, waited, refresh]);

  const done = access.fullAccess;

  return (
    <Section>
      <Wrap className="max-w-[560px]">
        <div className="rounded-2xl border-2 border-accent bg-accent-soft p-8 text-center sm:p-10">
          <ShieldCheck
            className="mx-auto mb-4 h-8 w-8 text-accent-ink"
            strokeWidth={1.75}
          />
          <h1 className="mb-2 text-[26px] font-semibold tracking-tight">
            {done ? "You're in." : "Payment received"}
          </h1>
          <p className="mb-7 text-[15.5px] text-ink-soft">
            {done ? (
              <>
                Welcome to {PLAN.name}. Every lesson, every practice topic and
                every coaching session is open to you now.
              </>
            ) : waited > 10 ? (
              <>
                Stripe has your payment. Your membership hasn&apos;t switched
                over yet, which is usually a few seconds — refresh in a moment,
                and get in touch if it stays like this.
              </>
            ) : (
              <>Switching your membership on. This takes a few seconds.</>
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
            >
              Start a course
            </Link>
            <Link
              href="/account"
              className="rounded-lg border border-line bg-white px-5 py-2.5 font-semibold hover:bg-paper-warm"
            >
              Your account
            </Link>
          </div>
          {user && (
            <p className="mt-5 text-[13px] text-ink-soft">
              Stripe emailed a receipt to {user.email}.
            </p>
          )}
        </div>
      </Wrap>
    </Section>
  );
}

function CheckoutInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const access = useAccess();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (access.loading) return <PageSkeleton />;

  if (params.get("status") === "success") return <Success />;

  if (access.fullAccess) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-10 text-center">
            <h1 className="mb-2 text-2xl font-semibold">
              You already have full access
            </h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Everything is unlocked on your account.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/courses"
                className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
              >
                Start a course
              </Link>
              <Link
                href="/account"
                className="rounded-lg border border-line bg-white px-5 py-2.5 font-semibold hover:bg-paper-warm"
              >
                Manage billing
              </Link>
            </div>
          </div>
        </Wrap>
      </Section>
    );
  }

  const start = async () => {
    setBusy(true);
    setError(null);
    const { error } = await goToStripe("/api/stripe/checkout");
    // On success the browser is already navigating to Stripe.
    if (error) {
      setError(error);
      setBusy(false);
    }
  };

  return (
    <Section>
      <Wrap className="max-w-[560px]">
        <div className="rounded-2xl border border-line bg-white p-8 sm:p-10">
          <CreditCard
            className="mb-4 h-7 w-7 text-ink-soft"
            strokeWidth={1.75}
          />
          <h1 className="mb-2 text-[26px] font-semibold tracking-tight">
            Join {PLAN.name}
          </h1>
          <p className="mb-6 text-[15.5px] text-ink-soft">
            {commitmentLine} You&apos;ll pay on Stripe&apos;s secure page, and
            we never see your card details.
          </p>

          <div className="mb-7 rounded-xl bg-paper-warm p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-semibold">{PLAN.name}</span>
              <span className="text-xl font-semibold">
                {priceLabel}{" "}
                <small className="text-[14px] font-normal text-ink-soft">
                  / {PLAN.interval}
                </small>
              </span>
            </div>
            <ul className="space-y-1.5">
              {CIRCLE_INCLUDES.map((f) => (
                <li key={f} className="flex gap-2.5 text-[14px] text-ink-soft">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-line bg-paper-warm p-4 text-[14px] text-ink-soft">
              {error}
            </div>
          )}

          <button
            onClick={() => void start()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-[15.5px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            <Lock className="h-4 w-4" strokeWidth={2.25} />
            {busy ? "Taking you to Stripe…" : "Continue to payment"}
          </button>

          {user && (
            <p className="mt-4 text-center text-[13px] text-ink-soft">
              Billed to {user.email}
            </p>
          )}
        </div>
      </Wrap>
    </Section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckoutInner />
    </Suspense>
  );
}
