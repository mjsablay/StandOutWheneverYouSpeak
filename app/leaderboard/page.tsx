"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Wrap, Section, SectionHead, Avatar, PageSkeleton } from "@/components/ui";
import { POINTS_RULES } from "@/lib/site";
import { useDirectory, nameOf } from "@/lib/directory";
import { useAccess } from "@/lib/access";
import { useAuth, initialsOf } from "@/lib/mock-auth";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const access = useAccess();
  const { members, loading } = useDirectory(access.signedIn);

  if (access.loading) return <PageSkeleton />;

  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Leaderboard"
          title="The Leaderboard."
          sub="Every lesson, practice session, and event earns points. Show up consistently and climb."
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {!access.signedIn ? (
              <div className="px-6 py-14 text-center">
                <Trophy
                  className="mx-auto mb-3 h-8 w-8 text-ink-soft"
                  strokeWidth={1.5}
                />
                <p className="mb-1 text-[15px] font-medium">
                  Sign in to see the rankings
                </p>
                <Link
                  href="/signin?next=/leaderboard"
                  className="text-[14px] font-semibold text-brand hover:underline"
                >
                  Sign in
                </Link>
              </div>
            ) : loading ? (
              <div className="p-10 text-center text-[15px] text-ink-soft">
                Loading…
              </div>
            ) : members.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Trophy
                  className="mx-auto mb-3 h-8 w-8 text-ink-soft"
                  strokeWidth={1.5}
                />
                <p className="mb-1 text-[15px] font-medium">
                  No rankings yet
                </p>
                <p className="mx-auto max-w-[360px] text-[14px] text-ink-soft">
                  As members complete lessons and practise, they&apos;ll appear
                  here. Be the first.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-paper-warm">
                    <th className="border-b border-line px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Rank
                    </th>
                    <th className="border-b border-line px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Member
                    </th>
                    <th className="hidden border-b border-line px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft sm:table-cell">
                      Lessons
                    </th>
                    <th className="border-b border-line px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`border-b border-line transition last:border-0 hover:bg-paper-warm ${
                        m.id === user?.id ? "bg-brand-soft/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 text-[15px] font-semibold text-ink">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3.5 text-[15px]">
                        <Link
                          href={`/members/${m.id}`}
                          className="group flex items-center gap-2.5 font-medium"
                        >
                          <Avatar
                            initials={initialsOf(nameOf(m))}
                            size={28}
                            src={m.avatar_url}
                          />
                          <span className="group-hover:text-brand group-hover:underline">
                            {nameOf(m)}
                            {m.id === user?.id && (
                              <span className="ml-1.5 text-[12.5px] text-ink-soft">
                                (you)
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3.5 text-[13px] text-ink-soft sm:table-cell">
                        {m.lessons_completed}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[15px] font-semibold">
                        {m.points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <h3 className="mb-4 text-lg font-semibold">How you earn points</h3>
            <ul>
              {POINTS_RULES.map(([label, pts]) => (
                <li
                  key={label}
                  className="flex items-center justify-between border-b border-line py-2.5 text-[14.5px] last:border-0"
                >
                  {label}
                  <span className="ml-4 whitespace-nowrap font-semibold text-brand">
                    +{pts}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
