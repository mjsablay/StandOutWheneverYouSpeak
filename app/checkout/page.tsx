"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wrap, Section, Check, PageSkeleton } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";

/**
 * Placeholder for Stripe Checkout.
 *
 * When Stripe is wired up, this page disappears entirely: the button on
 * /pricing will call POST /api/stripe/checkout, which creates a Checkout
 * Session and redirects to Stripe's own hosted payment page. Card details
 * should never be collected by our own form — that is why the inputs below
 * are deliberately disabled.
 */

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const [working, setWorking] = useState(false);
  const next = params.get("next");

  if (loading) return <PageSkeleton />;

  if (!user) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <h1 className="mb-2 text-2xl font-extrabold">Create an account first</h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              You need an account before subscribing to Speakers&apos; Circle.
            </p>
            <Link
              href="/signup?plan=circle"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Create account
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  if (user.tier === "circle") {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-10 text-center">
            <h1 className="mb-2 text-2xl font-extrabold">
              You&apos;re in the Circle 
            </h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Your Speakers&apos; Circle membership is active. Everything is
              unlocked.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/courses"
                className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
              >
                Start a course
              </Link>
              <Link
                href="/community"
                className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-ink hover:bg-accent-dark"
              >
                Meet the community
              </Link>
            </div>
          </div>
        </Wrap>
      </Section>
    );
  }

  return (
    <Section>
      <Wrap className="max-w-[560px]">
        <div className="rounded-2xl border border-line bg-white p-8 sm:p-10">
          <h1 className="mb-1 text-[28px] font-extrabold tracking-tight">
            Complete your subscription
          </h1>
          <p className="mb-7 text-[15px] text-ink-soft">
            Signed in as <strong className="text-ink">{user.email}</strong>
          </p>

          <div className="mb-7 rounded-xl border border-line bg-paper-warm p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-bold">Speakers&apos; Circle</span>
              <span className="text-2xl font-extrabold">
                $10{" "}
                <small className="text-[14px] font-medium text-ink-soft">
                  CAD / month
                </small>
              </span>
            </div>
            <ul className="mt-4 space-y-1.5 text-[14px] text-ink-soft">
              <li className="flex gap-2">
                <Check /> Every lesson in both courses
              </li>
              <li className="flex gap-2">
                <Check /> Unlimited AI practice sessions
              </li>
              <li className="flex gap-2">
                <Check /> Full Member community access
              </li>
              <li className="flex gap-2">
                <Check /> All live events &amp; cohort classes
              </li>
            </ul>
          </div>

          {/* Deliberately disabled — real card entry happens on Stripe's page */}
          <div className="mb-6 rounded-xl border border-dashed border-line p-5 opacity-60">
            <div className="mb-3 text-[13px] font-bold uppercase tracking-wider text-ink-soft">
              Card details
            </div>
            <input
              disabled
              placeholder="Card number — collected securely by Stripe"
              className="mb-2.5 w-full rounded-lg border border-line bg-paper-warm px-3.5 py-2.5 text-[14px]"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                disabled
                placeholder="MM / YY"
                className="rounded-lg border border-line bg-paper-warm px-3.5 py-2.5 text-[14px]"
              />
              <input
                disabled
                placeholder="CVC"
                className="rounded-lg border border-line bg-paper-warm px-3.5 py-2.5 text-[14px]"
              />
            </div>
            <p className="mt-3 text-[12.5px] text-ink-soft">
              In the live site this step redirects to Stripe&apos;s hosted
              checkout. We never handle card numbers ourselves.
            </p>
          </div>

          <button
            onClick={() => {
              setWorking(true);
              // Stripe isn't wired up yet. Upgrading a membership now has to
              // happen in the database — either through the Stripe webhook
              // (once built) or by an administrator.
              setTimeout(() => {
                setWorking(false);
                router.push(next || "/account");
              }, 600);
            }}
            disabled={working}
            className="w-full rounded-lg bg-accent px-5 py-3 text-[15.5px] font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-60"
          >
            {working ? "One moment…" : "Continue — $10 CAD/month"}
          </button>
          <p className="mt-3 text-center text-[13px] text-ink-soft">
            Payments aren&apos;t live yet. An administrator can grant
            Speakers&apos; Circle access in the meantime.
          </p>

          <p className="mt-4 text-center text-[13px] text-ink-soft">
            Cancel anytime. No long-term commitment.
          </p>
        </div>
      </Wrap>
    </Section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  );
}
