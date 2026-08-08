"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { getMember } from "@/lib/members";
import { useAuth } from "@/lib/mock-auth";

export default function MemberProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading, hasFullAccess } = useAuth();
  const [requested, setRequested] = useState(false);

  const member = getMember(slug);

  if (loading) return <PageSkeleton />;

  if (!member) {
    return (
      <Section>
        <Wrap className="max-w-[520px] text-center">
          <h1 className="mb-3 text-2xl font-extrabold">Member not found</h1>
          <Link
            href="/leaderboard"
            className="font-semibold text-brand hover:underline"
          >
            ← Back to leaderboard
          </Link>
        </Wrap>
      </Section>
    );
  }

  const isMember = hasFullAccess;

  return (
    <Section>
      <Wrap className="max-w-[820px]">
        <Link
          href="/leaderboard"
          className="mb-6 inline-block text-[14px] font-semibold text-brand hover:underline"
        >
          ← Back to leaderboard
        </Link>

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="h-20 bg-brand" />
          <div className="px-8 pb-8">
            <div className="-mt-10 mb-4">
              <span className="inline-block rounded-full border-4 border-white">
                <Avatar
                  initials={member.initials}
                  size={84}
                  variant={member.variant}
                />
              </span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight">
                  {member.name}
                </h1>
                <p className="text-[15.5px] text-ink-soft">{member.headline}</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {isMember ? (
                  <>
                    <button
                      onClick={() => setRequested(true)}
                      className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white transition hover:bg-brand-dark"
                    >
                      {requested ? "Request sent ✓" : "Request practice"}
                    </button>
                    <Link
                      href="/messages"
                      className="rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
                    >
                      Message
                    </Link>
                  </>
                ) : (
                  <Link
                    href={user ? "/checkout" : "/signup?plan=circle"}
                    className="rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-accent-dark"
                  >
                    Unlock to connect
                  </Link>
                )}
              </div>
            </div>

            <p className="mt-5 text-[15px] text-ink-soft">{member.bio}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {member.school && (
                <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  🎓 {member.school}
                </span>
              )}
              {member.company && (
                <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                  💼 {member.role ? `${member.role} · ` : ""}
                  {member.company}
                </span>
              )}
              <span className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]">
                📍 {member.location}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-8 border-t border-line pt-5">
              <div>
                <div className="text-xl font-extrabold">
                  {member.points.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">
                  Points
                </div>
              </div>
              <div>
                <div className="text-xl font-extrabold">#{member.rank}</div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">
                  Rank
                </div>
              </div>
              <div>
                <div className="text-xl font-extrabold">🔥 {member.streak}</div>
                <div className="text-xs uppercase tracking-wider text-ink-soft">
                  Day streak
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact + activity */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-7">
            <h2 className="mb-4 text-lg font-bold">Contact</h2>
            {isMember ? (
              <div className="space-y-3 text-[15px]">
                <div>
                  <div className="text-[12.5px] uppercase tracking-wider text-ink-soft">
                    Email
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    {member.email}
                  </a>
                </div>
                <div>
                  <div className="text-[12.5px] uppercase tracking-wider text-ink-soft">
                    LinkedIn
                  </div>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    View profile ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-paper-warm p-5 text-[14.5px] text-ink-soft">
                🔒 Contact details are visible to Speakers&apos; Circle members.
                <div className="mt-3">
                  <Link
                    href={user ? "/checkout" : "/signup?plan=circle"}
                    className="font-semibold text-brand hover:underline"
                  >
                    Upgrade to connect →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <h2 className="mb-4 text-lg font-bold">Currently practising</h2>
            <div className="mb-4 rounded-xl bg-brand-soft p-4">
              <div className="font-semibold">{member.working}</div>
              <div className="text-[13.5px] text-ink-soft">{member.course}</div>
            </div>
            <div className="mb-2 text-[12.5px] uppercase tracking-wider text-ink-soft">
              Focus areas
            </div>
            <div className="flex flex-wrap gap-2">
              {member.focus.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px]"
                >
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {member.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-accent-soft px-2.5 py-1.5 text-[12px] font-bold text-accent-ink"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
