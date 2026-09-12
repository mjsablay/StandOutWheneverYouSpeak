"use client";

import Link from "next/link";
import { Wrap, Section } from "@/components/ui";

/**
 * /signup is now a signpost, not a form.
 *
 * Nobody creates their own account any more. This page used to take an email
 * address and immediately create one, which is what let 189 unusable accounts
 * onto the waitlist. The two real ways in are: ask for a place and be invited,
 * or sign in with an account you already hold elsewhere.
 *
 * The route is kept because links to it exist in the wild.
 */

export default function SignUpPage() {
  return (
    <Section>
      <Wrap className="max-w-[560px]">
        <div className="rounded-2xl border border-line bg-white p-8 sm:p-10">
          <h1 className="mb-2 text-[28px] font-extrabold tracking-tight">
            Joining Stand Out
          </h1>
          <p className="mb-8 text-[15px] text-ink-soft">
            We&apos;re opening in small groups, so places are given out rather
            than signed up for. Tell us a little about yourself and we&apos;ll
            invite you when there&apos;s room.
          </p>

          <Link
            href="/request"
            className="block w-full rounded-lg bg-accent px-5 py-3.5 text-center text-[15.5px] font-semibold text-ink transition hover:bg-accent-dark"
          >
            Request your place
          </Link>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[13px] font-semibold text-ink-soft">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <Link
            href="/signin"
            className="block w-full rounded-lg border border-line bg-white px-5 py-3.5 text-center text-[15.5px] font-semibold transition hover:bg-paper-warm"
          >
            Sign in to an account you already have
          </Link>

          <p className="mt-6 text-center text-[13.5px] text-ink-soft">
            Been invited by email? Open the link in that invitation and
            you&apos;re in — there&apos;s nothing to set up.
          </p>
        </div>
      </Wrap>
    </Section>
  );
}
