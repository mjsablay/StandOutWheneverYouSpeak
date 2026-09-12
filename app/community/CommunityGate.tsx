"use client";

import Link from "next/link";
import { Users, Check } from "lucide-react";
import { Btn, Avatar } from "@/components/ui";
import { useAuth, initialsOf } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { useDirectory, nameOf } from "@/lib/directory";

const FEATURES: [string, string][] = [
  [
    "Find a practice partner",
    "Browse members, see what they're working on, and book a practice session.",
  ],
  [
    "Feedback threads",
    "Post a recording, get structured feedback from peers doing the same lessons.",
  ],
  ["Cohort classes", "Learn together in small groups with live instruction."],
];

/* ---------------- Locked marketing view ---------------- */

function LockedView({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="rounded-3xl bg-brand px-6 py-14 text-white sm:px-12">
      <div className="mx-auto max-w-[620px]">
        <span className="mb-5 inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
          Community
        </span>
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-tight tracking-tight">
          The member community.
        </h1>
        <p className="mt-3.5 text-[17px] text-[#b9c2d4]">
          Speakers&apos; Circle members get a room full of people to practise
          with — because an audience is the one thing an AI can&apos;t fully
          replace.
        </p>

        <ul className="mt-7 space-y-4">
          {FEATURES.map(([title, body]) => (
            <li key={title} className="flex gap-3.5">
              <Check
                className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-accent"
                strokeWidth={2.5}
              />
              <span className="text-[15.5px] text-[#d4dbe8]">
                <strong className="block text-base text-white">{title}</strong>
                {body}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Btn href={signedIn ? "/pricing" : "/signup"} variant="accent">
            {signedIn ? "See membership — $10/mo" : "Request your place"}
          </Btn>
          {!signedIn && (
            <Link
              href="/signin?next=/community"
              className="rounded-lg px-5 py-2.5 text-[14.5px] font-semibold text-white/80 hover:text-white"
            >
              Already a member? Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Member directory ---------------- */

function MemberDirectory({ firstName }: { firstName: string }) {
  const { user } = useAuth();
  const { members, loading } = useDirectory();

  const others = members.filter((m) => m.id !== user?.id);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[clamp(28px,4vw,38px)] font-semibold tracking-tight">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-2 text-[17px] text-ink-soft">
          Everyone here is working on the same thing you are. Reach out and
          book a practice session.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-[15px] text-ink-soft">
          Loading members…
        </div>
      ) : others.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-ink-soft" strokeWidth={1.5} />
          <p className="mb-1 text-[15px] font-medium">
            You&apos;re one of the first
          </p>
          <p className="mx-auto max-w-[400px] text-[14px] text-ink-soft">
            As more members are approved off the waitlist they&apos;ll appear
            here, and you&apos;ll be able to message them directly.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {others.map((m) => {
            const name = nameOf(m);
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <Link
                  href={`/members/${m.id}`}
                  className="group mb-4 flex items-center gap-3.5"
                >
                  <Avatar
                    initials={initialsOf(name)}
                    size={52}
                    src={m.avatar_url}
                  />
                  <div>
                    <div className="text-[17px] font-semibold group-hover:text-brand group-hover:underline">
                      {name}
                    </div>
                    {m.headline && (
                      <div className="text-[13.5px] text-ink-soft">
                        {m.headline}
                      </div>
                    )}
                  </div>
                </Link>

                {(m.company || m.school) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {m.company && (
                      <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                        {m.company}
                      </span>
                    )}
                    {m.school && (
                      <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                        {m.school}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2.5">
                  <Link
                    href="/messages"
                    className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Message
                  </Link>
                  <Link
                    href={`/members/${m.id}`}
                    className="rounded-lg border border-line px-4 py-2.5 text-[14px] font-semibold hover:bg-paper-warm"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ---------------- Gate ---------------- */

export default function CommunityGate() {
  const { user } = useAuth();
  const { loading, fullAccess, signedIn } = useAccess();

  if (loading)
    return (
      <div className="min-h-[520px] animate-pulse rounded-3xl bg-paper-warm" />
    );
  if (!signedIn) return <LockedView signedIn={false} />;
  if (!fullAccess) return <LockedView signedIn />;

  return <MemberDirectory firstName={(user?.name ?? "there").split(" ")[0]} />;
}
