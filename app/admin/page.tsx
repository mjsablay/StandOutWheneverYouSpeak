"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Users, CalendarClock, BookOpen, Clock } from "lucide-react";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import MeetingRequests from "./MeetingRequests";
import Insights from "./Insights";
import PreviewControl from "./PreviewControl";
import TestData from "./TestData";
import {
  useAuth,
  initialsOf,
  ROLE_LABEL,
  TIER_LABEL,
  type Role,
  type Tier,
  type Status,
} from "@/lib/mock-auth";
import { COURSES } from "@/lib/courses";
import { PRELAUNCH } from "@/lib/site";

type MemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  school: string | null;
  role: Role;
  tier: Tier;
  status: Status;
  created_at: string;
};

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-brand-soft text-brand",
  approved: "bg-accent-soft text-accent-ink",
  declined: "bg-paper-warm text-ink-soft",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<MemberRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("pending");
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id,email,display_name,avatar_url,company,school,role,tier,status,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as MemberRow[]);
    setFetching(false);
  }, [supabase]);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, load, refreshKey]);

  if (loading || !user) return <PageSkeleton />;

  if (!isAdmin) {
    return (
      <Section>
        <Wrap className="max-w-[520px]">
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <ShieldAlert
              className="mx-auto mb-4 h-8 w-8 text-ink-soft"
              strokeWidth={1.75}
            />
            <h1 className="mb-2 text-2xl font-semibold">Administrators only</h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Ask an administrator if you need access to this area.
            </p>
            <Link
              href="/account"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Back to my profile
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const patch = async (id: string, changes: Partial<MemberRow>) => {
    setBusy(id);
    setError(null);
    const payload: Record<string, unknown> = { ...changes };
    if (changes.status === "approved") {
      payload.approved_at = new Date().toISOString();
      payload.approved_by = user.id;
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", id);
    if (error) setError(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, ...changes } : x)));
    setBusy(null);
  };

  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    circle: rows.filter((r) => r.tier === "circle").length,
    declined: rows.filter((r) => r.status === "declined").length,
  };

  const lessonsLive = COURSES.reduce(
    (n, c) => n + (c.comingSoon ? 0 : c.lessons.length),
    0,
  );
  const videosLive = COURSES.reduce(
    (n, c) => n + c.lessons.filter((l) => l.video).length,
    0,
  );

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const stats = [
    { icon: Clock, label: "Awaiting approval", value: counts.pending, hot: true },
    { icon: Users, label: "Approved members", value: counts.approved },
    { icon: CalendarClock, label: "Speakers' Circle", value: counts.circle },
    { icon: BookOpen, label: "Lessons live", value: lessonsLive },
  ];

  return (
    <Section className="py-10">
      <Wrap>
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold tracking-tight">
            Admin console
          </h1>
          <p className="mt-1.5 text-[16px] text-ink-soft">
            {PRELAUNCH
              ? "The site is in pre-launch — only you can see beyond the waitlist."
              : "The site is live to all members."}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, hot }) => (
            <div
              key={label}
              className={`rounded-2xl border bg-white p-5 ${
                hot && value > 0 ? "border-brand" : "border-line"
              }`}
            >
              <Icon className="mb-3 h-5 w-5 text-ink-soft" strokeWidth={2} />
              <div className="text-[28px] font-semibold leading-none">
                {value}
              </div>
              <div className="mt-1.5 text-[13px] text-ink-soft">{label}</div>
            </div>
          ))}
        </div>

        <Insights />

        <MeetingRequests />

        <PreviewControl />

        <TestData
          members={rows.map((r) => ({
            id: r.id,
            display_name: r.display_name,
            email: r.email,
          }))}
          onChange={() => setRefreshKey((k) => k + 1)}
        />

        {/* Members */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold tracking-tight">
            Members &amp; waitlist
          </h2>
          <div className="flex flex-wrap gap-2">
            {(["pending", "approved", "declined", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3.5 py-1.5 text-[13.5px] font-semibold capitalize transition ${
                  filter === f
                    ? "bg-brand text-white"
                    : "border border-line bg-white hover:bg-paper-warm"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
            {error}
          </div>
        )}

        <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-white">
          {fetching ? (
            <div className="p-10 text-center text-[15px] text-ink-soft">
              Loading members…
            </div>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center text-[15px] text-ink-soft">
              {filter === "pending"
                ? "No one waiting — the queue is clear."
                : `No ${filter} members yet.`}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {visible.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <Avatar
                    initials={initialsOf(r.display_name || r.email)}
                    size={40}
                    src={r.avatar_url}
                  />
                  <div className="min-w-[190px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">
                        {r.display_name || r.email.split("@")[0]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[r.status]}`}
                      >
                        {r.status}
                      </span>
                      {r.role === "admin" && (
                        <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-ink-soft">
                      {r.email}
                      {r.company ? ` · ${r.company}` : ""}
                    </div>
                  </div>

                  {r.status !== "approved" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "approved" })}
                      className="rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-ink hover:bg-accent-dark disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {r.status === "pending" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "declined" })}
                      className="rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold hover:bg-paper-warm disabled:opacity-50"
                    >
                      Decline
                    </button>
                  )}

                  <select
                    value={r.tier}
                    onChange={(e) => patch(r.id, { tier: e.target.value as Tier })}
                    className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px]"
                    aria-label="Subscription"
                  >
                    {(["free", "circle"] as Tier[]).map((v) => (
                      <option key={v} value={v}>
                        {TIER_LABEL[v]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={r.role}
                    onChange={(e) => patch(r.id, { role: e.target.value as Role })}
                    className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px]"
                    aria-label="Role"
                  >
                    {(["member", "admin"] as Role[]).map((v) => (
                      <option key={v} value={v}>
                        {ROLE_LABEL[v]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content status */}
        <div className="rounded-2xl border border-line bg-white">
          <div className="border-b border-line bg-paper-warm px-6 py-4">
            <h2 className="font-semibold">Content</h2>
          </div>
          <div className="divide-y divide-line">
            {COURSES.map((c) => (
              <div
                key={c.slug}
                className="flex flex-wrap items-center gap-4 px-6 py-4"
              >
                <div className="min-w-[200px] flex-1">
                  <div className="text-[15px] font-semibold">{c.name}</div>
                  <div className="text-[13px] text-ink-soft">
                    {c.lessons.length} lessons ·{" "}
                    {c.lessons.filter((l) => l.video).length} with video
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                    c.comingSoon
                      ? "bg-paper-warm text-ink-soft"
                      : "bg-accent-soft text-accent-ink"
                  }`}
                >
                  {c.comingSoon ? "Coming soon" : "Live"}
                </span>
              </div>
            ))}
            <div className="px-6 py-4 text-[13.5px] text-ink-soft">
              {videosLive} lesson videos are wired up. They play locally but
              show a placeholder on the live site until video hosting is
              configured.
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
