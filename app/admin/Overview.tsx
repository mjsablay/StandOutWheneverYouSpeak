"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Inbox, Users, Activity, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { COURSES } from "@/lib/courses";
import { PRELAUNCH } from "@/lib/site";
import { dateParts, timeLabel, type LiveEvent } from "@/lib/events";
import type { WaitlistRow } from "@/lib/waitlist";

/**
 * The state of the platform on one screen — every number here is read from
 * a table, none is a projection. "Needs attention" is the admin's to-do
 * list, each line a link into the tab where the work happens.
 */

type Numbers = {
  requestsNew: number;
  requestsWeek: number;
  meetingsNew: number;
  members: number;
  circle: number;
  pending: number;
  active7d: number;
  watched7d: number;
  quizzesPassed: number;
  points: number;
  nextEvent: LiveEvent | null;
};

const WEEK_AGO = () => new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

export default function Overview({ go }: { go: (tab: string) => void }) {
  const supabase = useMemo(() => createClient(), []);
  const [n, setN] = useState<Numbers | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const week = WEEK_AGO();
        const [req, meet, people, prog, pts, ev] = await Promise.all([
          supabase.from("waitlist_requests").select("status,created_at"),
          supabase.from("meeting_requests").select("status"),
          supabase.rpc("admin_waitlist"),
          supabase.from("member_progress").select("watched,quiz_passed,updated_at"),
          supabase.from("points_ledger").select("points"),
          supabase
            .from("events")
            .select("id,title,details,host,join_url,starts_at,tier")
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
            .limit(1),
        ]);
        const firstError = [req, meet, people, prog, pts, ev].find((r) => r.error)?.error;
        if (firstError) throw new Error(firstError.message);
        const rows = (people.data ?? []) as WaitlistRow[];
        const reqRows = (req.data ?? []) as { status: string; created_at: string }[];
        const progRows = (prog.data ?? []) as { watched: boolean; quiz_passed: boolean; updated_at: string }[];
        if (cancelled) return;
        setN({
          requestsNew: reqRows.filter((r) => r.status === "new").length,
          requestsWeek: reqRows.filter((r) => r.created_at > week).length,
          meetingsNew: ((meet.data ?? []) as { status: string }[]).filter((m) => m.status === "new").length,
          members: rows.filter((r) => r.status === "approved").length,
          circle: rows.filter((r) => r.status === "approved" && r.tier === "circle").length,
          pending: rows.filter((r) => r.status === "pending").length,
          active7d: rows.filter((r) => r.last_sign_in_at && r.last_sign_in_at > week).length,
          watched7d: progRows.filter((p) => p.watched && p.updated_at > week).length,
          quizzesPassed: progRows.filter((p) => p.quiz_passed).length,
          points: ((pts.data ?? []) as { points: number }[]).reduce((a, b) => a + b.points, 0),
          nextEvent: ((ev.data ?? []) as LiveEvent[])[0] ?? null,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const lessonsLive = COURSES.reduce((t, c) => t + (c.comingSoon ? 0 : c.lessons.length), 0);
  const videosLive = COURSES.reduce((t, c) => t + c.lessons.filter((l) => l.video).length, 0);

  const attention = n
    ? [
        n.requestsNew > 0 && {
          tab: "requests",
          text: `${n.requestsNew} request${n.requestsNew === 1 ? "" : "s"} to join waiting on you`,
        },
        n.meetingsNew > 0 && {
          tab: "meetings",
          text: `${n.meetingsNew} meeting request${n.meetingsNew === 1 ? "" : "s"} unanswered`,
        },
        n.pending > 0 && {
          tab: "members",
          text: `${n.pending} account${n.pending === 1 ? "" : "s"} awaiting approval`,
        },
        !n.nextEvent && { tab: "events", text: "No event scheduled — members see an empty calendar" },
      ].filter(Boolean) as { tab: string; text: string }[]
    : [];

  const stat = (label: string, value: number | string, sub?: string) => (
    <div key={label} className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="display text-[34px] leading-none text-brand">{value}</div>
      <div className="mt-2 text-[13.5px] font-semibold">{label}</div>
      {sub && <div className="text-[12.5px] text-ink-soft">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-[15px] text-ink-soft">
        {PRELAUNCH
          ? "Pre-launch: the public sees the waitlist; approved members and admins see the whole site."
          : "The site is live to everyone who signs up."}
      </p>

      {error && (
        <div className="rounded-2xl border border-brand bg-brand-soft p-4 text-[14px]">{error}</div>
      )}

      {/* Needs attention */}
      <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
        <div className="mb-3 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
          Needs attention
        </div>
        {!n ? (
          <p className="text-[14.5px] text-ink-soft">Checking…</p>
        ) : attention.length === 0 ? (
          <p className="text-[14.5px] text-ink-soft">Nothing waiting on you.</p>
        ) : (
          <ul className="divide-y divide-line">
            {attention.map((a) => (
              <li key={a.text}>
                <button
                  onClick={() => go(a.tab)}
                  className="group flex w-full items-center justify-between gap-4 py-3 text-left text-[15px] font-medium hover:text-brand"
                >
                  {a.text}
                  <ArrowRight className="h-4 w-4 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-brand" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Numbers */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
          <Users className="h-3.5 w-3.5" strokeWidth={2.5} /> People
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stat("Members", n?.members ?? "–", "approved accounts")}
          {stat("Speakers' Circle", n?.circle ?? "–", "paid tier")}
          {stat("Active this week", n?.active7d ?? "–", "signed in, last 7 days")}
          {stat("Requests this week", n?.requestsWeek ?? "–", "new requests to join")}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
          <Activity className="h-3.5 w-3.5" strokeWidth={2.5} /> Learning
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stat("Lessons watched", n?.watched7d ?? "–", "last 7 days")}
          {stat("Quizzes passed", n?.quizzesPassed ?? "–", "all time")}
          {stat("Points awarded", n?.points.toLocaleString() ?? "–", "all time")}
          {stat("Lessons live", lessonsLive, `${videosLive} with video, all streaming`)}
        </div>
      </div>

      {/* Next event + content */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.5} /> Next event
          </div>
          {n?.nextEvent ? (
            <div className="flex items-center gap-4">
              <div className="min-w-[58px] rounded-xl bg-brand-soft px-2 py-2 text-center text-brand">
                <span className="block text-[11px] font-bold uppercase">{dateParts(n.nextEvent.starts_at).month}</span>
                <span className="block text-xl font-extrabold leading-tight">{dateParts(n.nextEvent.starts_at).day}</span>
              </div>
              <div>
                <div className="text-[15.5px] font-semibold">{n.nextEvent.title}</div>
                <div className="text-[13.5px] text-ink-soft">{timeLabel(n.nextEvent.starts_at)}</div>
              </div>
            </div>
          ) : (
            <p className="text-[14.5px] text-ink-soft">
              Nothing scheduled.{" "}
              <button onClick={() => go("events")} className="font-semibold text-brand hover:underline">
                Schedule one
              </button>
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} /> Courses
          </div>
          <ul className="divide-y divide-line">
            {COURSES.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <div className="text-[15px] font-semibold">{c.name}</div>
                  <div className="text-[13px] text-ink-soft">
                    {c.lessons.length} lessons · {c.lessons.filter((l) => l.video).length} with video
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide ${
                    c.comingSoon ? "bg-paper-warm text-ink-soft" : "bg-accent-soft text-accent-ink"
                  }`}
                >
                  {c.comingSoon ? "Coming soon" : "Live"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-ink-soft">
        <Inbox className="h-3.5 w-3.5" strokeWidth={2} />
        Requests, meetings and members each have their own tab on the left.
        <Trophy className="ml-3 h-3.5 w-3.5" strokeWidth={2} />
        Points are awarded by the database, never by hand.
      </div>
    </div>
  );
}
