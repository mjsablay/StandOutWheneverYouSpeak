"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { MEMBERS } from "@/lib/members";
import { COURSES } from "@/lib/courses";
import {
  useAuth,
  ROLE_LABEL,
  TIER_LABEL,
  type Role,
  type Tier,
} from "@/lib/mock-auth";

/**
 * Admin console.
 *
 * Demo only: role and tier changes are held in component state, not saved.
 * Once Supabase is connected these become updates to the `profiles` table,
 * protected by a policy that only admins can change roles.
 */

type Row = {
  slug: string;
  name: string;
  email: string;
  initials: string;
  variant: "brand" | "accent" | "dark";
  role: Role;
  tier: Tier;
};

const seedRows = (): Row[] =>
  MEMBERS.map((m, i) => ({
    slug: m.slug,
    name: m.name,
    email: m.email,
    initials: m.initials,
    variant: m.variant,
    role: "member",
    tier: i < 3 ? "circle" : "free",
  }));

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [rows, setRows] = useState<Row[]>(seedRows);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/admin");
  }, [loading, user, router]);

  if (loading || !user) return <PageSkeleton />;

  if (!isAdmin) {
    return (
      <Section>
        <Wrap className="max-w-[560px]">
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <div className="mb-3 text-4xl">🔐</div>
            <h1 className="mb-2 text-2xl font-extrabold">Administrators only</h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              This area manages members, roles, and course content. Ask an
              administrator if you need access.
            </p>
            <Link
              href="/account"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Back to my account
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const update = (slug: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.slug === slug ? { ...x, ...patch } : x)));
    setSaved(slug);
    setTimeout(() => setSaved(null), 1600);
  };

  const stats = [
    { label: "Members", value: rows.length },
    {
      label: "Speakers' Circle",
      value: rows.filter((r) => r.tier === "circle").length,
    },
    { label: "Administrators", value: rows.filter((r) => r.role === "admin").length },
    {
      label: "Lessons published",
      value: COURSES.reduce(
        (n, c) => n + (c.comingSoon ? 0 : c.lessons.length),
        0,
      ),
    },
  ];

  return (
    <Section>
      <Wrap>
        <div className="mb-8">
          <span className="mb-3 inline-block rounded-full bg-ink px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-white">
            Admin
          </span>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
            Platform administration
          </h1>
          <p className="mt-2 text-[17px] text-ink-soft">
            Manage who has access to what.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="text-[28px] font-extrabold leading-none">
                {s.value}
              </div>
              <div className="mt-1.5 text-[13px] uppercase tracking-wider text-ink-soft">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Members table */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-paper-warm px-6 py-4">
            <h2 className="font-bold">Members &amp; access</h2>
          </div>
          <div className="divide-y divide-line">
            {rows.map((r) => (
              <div
                key={r.slug}
                className="flex flex-wrap items-center gap-4 px-6 py-4"
              >
                <Avatar initials={r.initials} size={40} variant={r.variant} />
                <div className="min-w-[180px] flex-1">
                  <Link
                    href={`/members/${r.slug}`}
                    className="text-[15px] font-semibold hover:text-brand hover:underline"
                  >
                    {r.name}
                  </Link>
                  <div className="text-[13px] text-ink-soft">{r.email}</div>
                </div>

                <label className="text-[13px]">
                  <span className="mb-1 block font-semibold text-ink-soft">
                    Role
                  </span>
                  <select
                    value={r.role}
                    onChange={(e) =>
                      update(r.slug, { role: e.target.value as Role })
                    }
                    className="rounded-lg border border-line bg-white px-3 py-2 text-[14px]"
                  >
                    {(["member", "admin"] as Role[]).map((v) => (
                      <option key={v} value={v}>
                        {ROLE_LABEL[v]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-[13px]">
                  <span className="mb-1 block font-semibold text-ink-soft">
                    Subscription
                  </span>
                  <select
                    value={r.tier}
                    onChange={(e) =>
                      update(r.slug, { tier: e.target.value as Tier })
                    }
                    className="rounded-lg border border-line bg-white px-3 py-2 text-[14px]"
                  >
                    {(["free", "circle"] as Tier[]).map((v) => (
                      <option key={v} value={v}>
                        {TIER_LABEL[v]}
                      </option>
                    ))}
                  </select>
                </label>

                <span className="w-[70px] text-[13px] font-semibold text-accent-ink">
                  {saved === r.slug ? "Saved ✓" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-warm p-6">
          <h2 className="mb-1.5 font-bold">Next for this console</h2>
          <p className="text-[14.5px] text-ink-soft">
            The member list above is still sample data. Once members start
            signing up it will read live from the database, and role and
            subscription changes here will save to their profile — enforced by
            security policies so only administrators can make them.
          </p>
        </div>
      </Wrap>
    </Section>
  );
}
