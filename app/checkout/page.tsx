"use client";

import Link from "next/link";
import { Suspense } from "react";
import { CreditCard, Check } from "lucide-react";
import { Wrap, Section, PageSkeleton } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";

/**
 * Holding page until Stripe is connected.
 *
 * This used to fake a payment and grant membership, which was misleading —
 * it looked like a working purchase. Now it states plainly that payments
 * aren't live and offers the honest alternative: ask us for access.
 *
 * When Stripe is wired up this page goes away entirely: the pricing button
 * will POST to /api/stripe/checkout and redirect to Stripe's hosted page.
 */

const INCLUDED = [
  "Every lesson in both courses",
  "Coaching sessions with Katya",
  "Full member community access",
  "All live events, workshops and cohort classes",
];

function CheckoutInner() {
  const { user } = useAuth();
  const access = useAccess();

  if (access.loading) return <PageSkeleton />;

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
                href="/community"
                className="rounded-lg border border-line bg-white px-5 py-2.5 font-semibold hover:bg-paper-warm"
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
          <CreditCard
            className="mb-4 h-7 w-7 text-ink-soft"
            strokeWidth={1.75}
          />
          <h1 className="mb-2 text-[26px] font-semibold tracking-tight">
            Payments aren&apos;t live yet
          </h1>
          <p className="mb-6 text-[15.5px] text-ink-soft">
            We&apos;re still setting up billing. In the meantime, if
            you&apos;d like Speakers&apos; Circle access, just ask — we&apos;re
            granting it manually to early members.
          </p>

          <div className="mb-7 rounded-xl bg-paper-warm p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="font-semibold">Speakers&apos; Circle</span>
              <span className="text-xl font-semibold">
                $10{" "}
                <small className="text-[14px] font-normal text-ink-soft">
                  CAD / month
                </small>
              </span>
            </div>
            <ul className="space-y-1.5">
              {INCLUDED.map((f) => (
                <li key={f} className="flex gap-2.5 text-[14px] text-ink-soft">
                  <Check
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent"
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/contact"
            className="block w-full rounded-lg bg-brand px-5 py-3 text-center text-[15.5px] font-semibold text-white transition hover:bg-brand-dark"
          >
            Request access
          </Link>

          {user && (
            <p className="mt-4 text-center text-[13px] text-ink-soft">
              We&apos;ll use the email on your account: {user.email}
            </p>
          )}
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
