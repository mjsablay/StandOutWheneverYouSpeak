"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrap, Section, PageSkeleton } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import type { ReactNode } from "react";

/**
 * Wraps any member-only screen. Signed-in users who haven't been approved
 * off the waitlist see a holding page instead of the content.
 *
 * This is presentation only — the real protection is the `is_approved()`
 * check inside the database's row-level security policies, so a user
 * cannot reach the data even by calling the API directly.
 */
export default function WaitlistGate({ children }: { children: ReactNode }) {
  const { user, loading, isApproved, signOut } = useAuth();
  const router = useRouter();

  if (loading) return <PageSkeleton />;
  if (!user) return <PageSkeleton />;
  if (isApproved) return <>{children}</>;

  const declined = user.status === "declined";

  return (
    <Section>
      <Wrap className="max-w-[600px]">
        <div className="rounded-2xl border border-line bg-white p-8 text-center sm:p-12">
          

          <h1 className="mb-3 text-[28px] font-extrabold tracking-tight">
            {declined
              ? "We couldn't approve this account"
              : "You're on the waitlist"}
          </h1>

          {declined ? (
            <p className="mb-7 text-[16px] text-ink-soft">
              If you think this is a mistake, get in touch and we&apos;ll take
              another look.
            </p>
          ) : (
            <>
              <p className="mb-4 text-[16px] text-ink-soft">
                Thanks for signing up,{" "}
                <strong className="text-ink">{user.name}</strong>. Stand Out is
                opening in stages, and we&apos;re letting members in a group at
                a time so every cohort gets proper attention.
              </p>
              <p className="mb-7 text-[16px] text-ink-soft">
                We&apos;ll email{" "}
                <strong className="text-ink">{user.email}</strong> the moment
                your place is ready.
              </p>
            </>
          )}

          <div className="mb-7 rounded-xl bg-paper-warm p-5 text-left">
            <div className="mb-2 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
              While you wait
            </div>
            <ul className="space-y-1.5 text-[14.5px] text-ink-soft">
              <li>
                · Browse the{" "}
                <Link href="/courses" className="font-semibold text-brand hover:underline">
                  course outlines
                </Link>{" "}
                to see what&apos;s covered
              </li>
              <li>
                · Check{" "}
                <Link href="/events" className="font-semibold text-brand hover:underline">
                  upcoming events
                </Link>{" "}
                — open houses are free to attend
              </li>
              <li>
                · Have a question?{" "}
                <Link href="/contact" className="font-semibold text-brand hover:underline">
                  Book a call
                </Link>{" "}
                with Barry or Michael
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
            >
              Back to home
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
            >
              Sign out
            </button>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
