import type { Metadata } from "next";
import Link from "next/link";
import { Wrap, Section, SectionHead, Avatar } from "@/components/ui";
import { POINTS_RULES } from "@/lib/site";
import { MEMBERS } from "@/lib/members";

export const metadata: Metadata = {
  title: "Leaderboard — Stand Out Whenever You Speak",
  description:
    "Every lesson, practice session, and event earns points. Show up consistently and climb.",
};

export default function LeaderboardPage() {
  const ranked = [...MEMBERS].sort((a, b) => a.rank - b.rank);

  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Leaderboard"
          title="The Leaderboard."
          sub="Every lesson, practice session, and event earns points. Show up consistently and climb. Select a member to see their profile."
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper-warm">
                  <th className="border-b border-line px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Rank
                  </th>
                  <th className="border-b border-line px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Member
                  </th>
                  <th className="hidden border-b border-line px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-ink-soft sm:table-cell">
                    Streak
                  </th>
                  <th className="border-b border-line px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((m) => (
                  <tr
                    key={m.slug}
                    className="border-b border-line transition last:border-0 hover:bg-paper-warm"
                  >
                    <td className="px-4 py-3.5 text-[15px] font-extrabold text-ink">
                      {m.rank}
                    </td>
                    <td className="px-4 py-3.5 text-[15px]">
                      <Link
                        href={`/members/${m.slug}`}
                        className="group flex items-center gap-2.5 font-semibold"
                      >
                        <Avatar
                          initials={m.initials}
                          size={28}
                          variant={m.variant}
                        />
                        <span className="group-hover:text-brand group-hover:underline">
                          {m.name}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3.5 text-[13px] text-ink-soft sm:table-cell">
                      {m.streak} days
                    </td>
                    <td className="px-4 py-3.5 text-right text-[15px] font-extrabold">
                      {m.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <h3 className="mb-4 text-lg font-bold">How you earn points</h3>
            <ul>
              {POINTS_RULES.map(([label, pts]) => (
                <li
                  key={label}
                  className="flex items-center justify-between border-b border-line py-2.5 text-[14.5px] last:border-0"
                >
                  {label}
                  <span className="ml-4 whitespace-nowrap font-extrabold text-brand">
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
