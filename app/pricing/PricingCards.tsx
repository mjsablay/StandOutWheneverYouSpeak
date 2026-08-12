"use client";

import Link from "next/link";
import { Check } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";

const FRONT_ROW = [
  "Selected lessons from both courses",
  "Free live events & open houses",
  "Earn points & appear on the leaderboard",
];

const CIRCLE = [
  "Every lesson in both courses",
  "Unlimited AI practice sessions",
  "Full Member community access",
  "All live events, workshops & cohort classes",
];

export default function PricingCards() {
  const { user, loading } = useAuth();

  // Cards always render so the layout never shifts — only the button
  // label and destination depend on who's signed in.
  const isMember = user?.tier === "circle";

  // Account creation always comes first — never send a signed-out
  // visitor straight to payment.
  const circleHref = !user
    ? "/signup?plan=circle"
    : isMember
      ? "/account"
      : "/checkout";

  const freeHref = user ? "/account" : "/signup?plan=free";

  return (
    <div className="mx-auto grid max-w-[860px] gap-6 md:grid-cols-2">
      {/* Front Row */}
      <div className="rounded-2xl border border-line bg-white p-9">
        <h3 className="mb-1 text-[22px] font-bold">Front Row</h3>
        <p className="mb-5 text-[14.5px] text-ink-soft">
          Watch, learn, and get a feel for the method.
        </p>
        <div className="mb-0.5 text-[44px] font-extrabold tracking-tight">
          Free
        </div>
        <ul className="my-6 space-y-2">
          {FRONT_ROW.map((f) => (
            <li key={f} className="flex gap-2.5 py-1 text-[15px]">
              <Check />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={loading ? "/signup?plan=free" : freeHref}
          className="block w-full rounded-lg bg-brand px-5 py-2.5 text-center text-[14.5px] font-semibold text-white transition hover:bg-brand-dark"
        >
          {user ? "Go to my account" : "Create free account"}
        </Link>
      </div>

      {/* Speakers' Circle */}
      <div className="relative rounded-2xl border-2 border-accent bg-white p-9 shadow-[0_14px_40px_rgba(108,194,74,.16)]">
        <span className="absolute -top-3.5 left-9 rounded-full bg-accent px-3 py-1 text-xs font-bold text-ink">
          {isMember ? "Your plan" : "Most popular"}
        </span>
        <h3 className="mb-1 text-[22px] font-bold">Speakers&apos; Circle</h3>
        <p className="mb-5 text-[14.5px] text-ink-soft">
          The full curriculum, the AI coach, and the community.
        </p>
        <div className="mb-0.5 text-[44px] font-extrabold tracking-tight">
          $10{" "}
          <small className="text-[15px] font-medium text-ink-soft">
            CAD / month
          </small>
        </div>
        <ul className="my-6 space-y-2">
          {CIRCLE.map((f) => (
            <li key={f} className="flex gap-2.5 py-1 text-[15px]">
              <Check />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={loading ? "/signup?plan=circle" : circleHref}
          className="block w-full rounded-lg bg-accent px-5 py-2.5 text-center text-[14.5px] font-semibold text-ink transition hover:bg-accent-dark"
        >
          {isMember
            ? "You're a member "
            : user
              ? "Continue to payment"
              : "Create account & subscribe"}
        </Link>
        {/* Height reserved even when hidden, so the card never resizes */}
        <p
          className={`mt-3 text-center text-[13px] text-ink-soft ${
            user ? "invisible" : ""
          }`}
        >
          You&apos;ll create your account first, then pay.
        </p>
      </div>
    </div>
  );
}
