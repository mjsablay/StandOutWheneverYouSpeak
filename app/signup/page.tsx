"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wrap, Section, Check } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[15px] text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-brand";

function SignUpInner() {
  const params = useSearchParams();
  const { signInWithEmail } = useAuth();

  const plan = params.get("plan") === "circle" ? "circle" : "free";
  const next = params.get("next") ?? (plan === "circle" ? "/checkout" : "/account");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-8 text-center sm:p-10">
            <div className="mb-3 text-4xl">📬</div>
            <h1 className="mb-2 text-2xl font-extrabold">Check your email</h1>
            <p className="text-[15px] text-ink-soft">
              We sent a confirmation link to{" "}
              <strong className="text-ink">{email}</strong>. Open it and your
              account is ready
              {plan === "circle" ? " — then you'll complete payment." : "."}
            </p>
          </div>
        </Wrap>
      </Section>
    );
  }

  return (
    <Section>
      <Wrap className="max-w-[520px]">
        <div className="rounded-2xl border border-line bg-white p-8 sm:p-10">
          <h1 className="mb-2 text-[28px] font-extrabold tracking-tight">
            Create your account
          </h1>
          <p className="mb-7 text-[15px] text-ink-soft">
            {plan === "circle"
              ? "First create your account, then you'll complete payment for Speakers' Circle."
              : "Join the Front Row free — no credit card required."}
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              const res = await signInWithEmail(email, next);
              setBusy(false);
              if (res.error) setError(res.error);
              else setSent(true);
            }}
          >
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-semibold"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={field}
                placeholder="you@example.com"
              />
              <p className="mt-2 text-[13px] text-ink-soft">
                We&apos;ll email you a link to confirm — no password needed. You
                can add your name and bio once you&apos;re in.
              </p>
            </div>

            {error && (
              <p className="mb-4 text-[14px] font-medium text-brand">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-lg px-5 py-3 text-[15.5px] font-semibold transition disabled:opacity-60 ${
                plan === "circle"
                  ? "bg-accent text-ink hover:bg-accent-dark"
                  : "bg-brand text-white hover:bg-brand-dark"
              }`}
            >
              {busy
                ? "Sending…"
                : plan === "circle"
                  ? "Create account & continue"
                  : "Create my free account"}
            </button>
          </form>

          {plan === "circle" && (
            <ul className="mt-6 space-y-1.5 border-t border-line pt-6 text-[14px] text-ink-soft">
              <li className="flex gap-2">
                <Check /> Every lesson in both courses
              </li>
              <li className="flex gap-2">
                <Check /> Unlimited AI practice sessions
              </li>
              <li className="flex gap-2">
                <Check /> Full Member community access
              </li>
            </ul>
          )}

          <p className="mt-6 text-center text-[14px] text-ink-soft">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-brand hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Wrap>
    </Section>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpInner />
    </Suspense>
  );
}
