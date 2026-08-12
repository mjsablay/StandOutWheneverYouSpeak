"use client";

import Link from "next/link";
import { useState } from "react";
import { Btn, Avatar } from "@/components/ui";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { MEMBERS } from "@/lib/members";

const FEATURES: [string, string][] = [
  [
    "Find a practice partner",
    "Browse members, see what they're working on, and book a practice session.",
  ],
  [
    "Feedback threads",
    "Post a recording, get structured feedback from peers who are doing the same lessons.",
  ],
  ["Cohort classes", "Learn together in small groups with live instruction."],
];

/* ---------------- Locked marketing view ---------------- */

function LockedView({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="rounded-3xl bg-brand px-6 py-14 text-white sm:px-12">
      <div className="grid items-center gap-11 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="mb-5 inline-block text-[13px] font-bold uppercase tracking-[0.12em] text-accent">
            Community
          </span>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight">
            The Member community.
          </h1>
          <p className="mt-3.5 text-[17px] text-[#b9c2d4]">
            Speakers&apos; Circle members get a room full of people to practice
            with — because an audience is the one thing an AI can&apos;t fully
            replace.
          </p>

          <ul className="mt-7 space-y-4">
            {FEATURES.map(([title, body]) => (
              <li key={title} className="flex gap-3.5">
                <span className="font-extrabold text-accent"></span>
                <span className="text-[15.5px] text-[#d4dbe8]">
                  <strong className="block text-base text-white">{title}</strong>
                  {body}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Btn
              href={signedIn ? "/checkout?next=/community" : "/signup?plan=circle&next=/community"}
              variant="accent"
            >
              {signedIn
                ? "Upgrade to unlock — $10/mo"
                : "Join Speakers' Circle — $10/mo"}
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

        <div className="relative rounded-2xl border border-[#34415e] bg-[#232f47] p-6">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-[#8fa0bf]">
            Members practicing this week
          </div>
          <div className="select-none blur-[3px]">
            {MEMBERS.slice(0, 3).map((m, i) => (
              <div
                key={m.name}
                className={`flex items-center gap-3 py-3 text-[14.5px] text-[#e8edf6] ${
                  i < 2 ? "border-b border-[#2e3b58]" : ""
                }`}
              >
                <Avatar initials={m.initials} variant={m.variant} />
                <div className="flex-1">
                  {m.name}
                  <span className="block text-[12.5px] text-[#8fa0bf]">
                    Working on: {m.working} · {m.course}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#8fa0bf]">
            Member profiles unlock with Speakers&apos; Circle.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Unlocked member directory ---------------- */

function MemberDirectory({ name }: { name: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-[12.5px] font-bold text-accent-ink">
            Speakers&apos; Circle
          </span>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
            Welcome back, {name.split(" ")[0]}.
          </h1>
          <p className="mt-2 text-[17px] text-ink-soft">
            Reach out to a member and book a practice session. Everyone here is
            working on the same thing you are.
          </p>
        </div>
        <Link
          href="/account"
          className="rounded-lg border border-line bg-white px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
        >
          Edit my profile
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {MEMBERS.map((m) => (
          <div
            key={m.slug}
            className="rounded-2xl border border-line bg-white p-6"
          >
            <Link
              href={`/members/${m.slug}`}
              className="group mb-4 flex items-center gap-3.5"
            >
              <Avatar initials={m.initials} size={52} variant={m.variant} />
              <div>
                <div className="text-[17px] font-bold group-hover:text-brand group-hover:underline">
                  {m.name}
                </div>
                <div className="text-[13.5px] text-ink-soft">{m.headline}</div>
              </div>
            </Link>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                {m.company}
              </span>
              <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                {m.working}
              </span>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setSentTo(m.name)}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-dark"
              >
                {sentTo === m.name ? "Request sent" : "Request practice"}
              </button>
              <Link
                href="/messages"
                className="rounded-lg border border-line px-4 py-2.5 text-[14px] font-semibold hover:bg-paper-warm"
              >
                Message
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 font-bold">Coming to the community</h3>
        <p className="text-[14.5px] text-ink-soft">
          Real member messaging, feedback threads where you post a recording and
          get structured notes back, and scheduled peer practice rooms.
        </p>
      </div>
    </>
  );
}

/* ---------------- Gate ---------------- */

export default function CommunityGate() {
  const { user } = useAuth();
  const { loading, fullAccess, signedIn } = useAccess();

  // Reserve the same footprint while auth resolves, so the page
  // doesn't collapse and re-expand on refresh.
  if (loading)
    return (
      <div className="min-h-[520px] animate-pulse rounded-3xl bg-paper-warm" />
    );
  if (!signedIn) return <LockedView signedIn={false} />;
  if (!fullAccess) return <LockedView signedIn />;

  return <MemberDirectory name={user?.name || "there"} />;
}
