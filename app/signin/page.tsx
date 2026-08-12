"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wrap, Section } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import SocialSignIn from "@/components/SocialSignIn";

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[15px] text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-brand";

function SignInInner() {
  const params = useSearchParams();
  const { signInWithEmail } = useAuth();
  const next = params.get("next");
  const linkExpired = params.get("error") === "link_expired";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-8 text-center sm:p-10">
            <h1 className="mb-2 text-2xl font-extrabold">Check your email</h1>
            <p className="text-[15px] text-ink-soft">
              We sent a sign-in link to{" "}
              <strong className="text-ink">{email}</strong>. Open it on this
              device and you&apos;ll be signed straight in.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-6 text-[14px] font-semibold text-brand hover:underline"
            >
              Use a different email
            </button>
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
            Sign in
          </h1>
          <p className="mb-7 text-[15px] text-ink-soft">
            Enter your email and we&apos;ll send you a sign-in link — no
            password to remember.
          </p>

          {linkExpired && (
            <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
              That link has expired or was already used. Enter your email for a
              fresh one.
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              const res = await signInWithEmail(email, next ?? undefined);
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
            </div>

            {error && (
              <p className="mb-4 text-[14px] font-medium text-brand">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand px-5 py-3 text-[15.5px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>

          <div className="mt-6">
            <SocialSignIn next={next ?? undefined} />
          </div>

          <p className="mt-6 text-center text-[14px] text-ink-soft">
            New here?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </Wrap>
    </Section>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
