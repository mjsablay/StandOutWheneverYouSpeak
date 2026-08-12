/**
 * Metric gathering for the admin insight agents.
 *
 * DESIGN NOTE — why aggregate before sending to a model:
 *   1. Privacy. Members' names, emails and messages never leave the database.
 *      The agent sees counts, rates and short anonymised excerpts.
 *   2. Cost. A few hundred tokens of numbers beats thousands of rows.
 *   3. Quality. Models reason better over a clean summary than raw records.
 *
 * Each area returns a plain object. The agent turns that into an assessment.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type InsightArea =
  | "waitlist"
  | "meetings"
  | "engagement"
  | "community"
  | "content";

export const AREA_LABEL: Record<InsightArea, string> = {
  waitlist: "Waitlist & members",
  meetings: "Meeting requests",
  engagement: "Learning engagement",
  community: "Community activity",
  content: "Course content",
};

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400_000).toISOString();

const rate = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;

/* eslint-disable @typescript-eslint/no-explicit-any */
type DB = SupabaseClient<any, "public", any>;

export async function gatherMetrics(
  supabase: DB,
  area: InsightArea,
): Promise<Record<string, unknown>> {
  switch (area) {
    case "waitlist": {
      const { data } = await supabase
        .from("profiles")
        .select("status,tier,role,created_at,approved_at,company,school,location");
      const rows = data ?? [];
      const pending = rows.filter((r) => r.status === "pending");
      const approved = rows.filter((r) => r.status === "approved");

      const waits = approved
        .filter((r) => r.approved_at)
        .map(
          (r) =>
            (new Date(r.approved_at as string).getTime() -
              new Date(r.created_at as string).getTime()) /
            3600_000,
        );

      return {
        total_signups: rows.length,
        pending: pending.length,
        approved: approved.length,
        declined: rows.filter((r) => r.status === "declined").length,
        paying: rows.filter((r) => r.tier === "circle").length,
        conversion_to_paid_percent: rate(
          rows.filter((r) => r.tier === "circle").length,
          approved.length,
        ),
        signups_last_7_days: rows.filter(
          (r) => (r.created_at as string) > daysAgo(7),
        ).length,
        signups_last_30_days: rows.filter(
          (r) => (r.created_at as string) > daysAgo(30),
        ).length,
        median_hours_to_approval:
          waits.length === 0
            ? null
            : Math.round(waits.sort((a, b) => a - b)[Math.floor(waits.length / 2)]),
        oldest_pending_days: pending.length
          ? Math.round(
              (Date.now() -
                Math.min(
                  ...pending.map((p) =>
                    new Date(p.created_at as string).getTime(),
                  ),
                )) /
                86400_000,
            )
          : 0,
        profile_completeness_percent: rate(
          rows.filter((r) => r.company || r.school).length,
          rows.length,
        ),
        top_locations: topCounts(rows.map((r) => r.location as string | null)),
        top_companies: topCounts(rows.map((r) => r.company as string | null)),
      };
    }

    case "meetings": {
      const { data } = await supabase
        .from("meeting_requests")
        .select("intent,team_size,timeframe,status,created_at,organization,message");
      const rows = data ?? [];

      return {
        total_requests: rows.length,
        new_unhandled: rows.filter((r) => r.status === "new").length,
        scheduled: rows.filter((r) => r.status === "scheduled").length,
        declined: rows.filter((r) => r.status === "declined").length,
        requests_last_30_days: rows.filter(
          (r) => (r.created_at as string) > daysAgo(30),
        ).length,
        by_intent: countBy(rows.map((r) => r.intent as string)),
        by_team_size: countBy(rows.map((r) => r.team_size as string | null)),
        by_timeframe: countBy(rows.map((r) => r.timeframe as string | null)),
        corporate_share_percent: rate(
          rows.filter((r) =>
            ["team_training", "speaking_engagement", "partnership"].includes(
              r.intent as string,
            ),
          ).length,
          rows.length,
        ),
        // Short excerpts only — enough for themes, not enough to identify anyone.
        recent_asks: rows
          .slice(-12)
          .map((r) => String(r.message ?? "").slice(0, 160)),
      };
    }

    case "engagement": {
      const [{ data: progress }, { data: attempts }, { data: practice }] =
        await Promise.all([
          supabase.from("lesson_progress").select("user_id,watched,quiz_passed,best_score,updated_at"),
          supabase.from("quiz_attempts").select("user_id,lesson_id,score,passed,created_at"),
          supabase.from("practice_sessions").select("user_id,kind,score_total,created_at"),
        ]);

      const p = progress ?? [];
      const a = attempts ?? [];
      const pr = practice ?? [];

      return {
        members_with_activity: new Set(p.map((r) => r.user_id)).size,
        lessons_watched: p.filter((r) => r.watched).length,
        quizzes_passed: p.filter((r) => r.quiz_passed).length,
        quiz_attempts: a.length,
        quiz_pass_rate_percent: rate(a.filter((r) => r.passed).length, a.length),
        average_quiz_score:
          a.length === 0
            ? null
            : Math.round(
                a.reduce((s, r) => s + (r.score as number), 0) / a.length,
              ),
        hardest_lessons: hardestLessons(a),
        practice_sessions: pr.length,
        practice_sessions_last_30_days: pr.filter(
          (r) => (r.created_at as string) > daysAgo(30),
        ).length,
        average_practice_score:
          pr.filter((r) => r.score_total).length === 0
            ? null
            : Math.round(
                pr
                  .filter((r) => r.score_total)
                  .reduce((s, r) => s + (r.score_total as number), 0) /
                  pr.filter((r) => r.score_total).length,
              ),
      };
    }

    case "community": {
      const [{ data: convos }, { data: msgs }, { data: profiles }] =
        await Promise.all([
          supabase.from("conversations").select("id,is_demo,created_at"),
          supabase.from("messages").select("sender_id,conversation_id,created_at"),
          supabase.from("profiles").select("id,tier,status"),
        ]);

      const real = (convos ?? []).filter((c) => !c.is_demo);
      const m = msgs ?? [];
      const circle = (profiles ?? []).filter(
        (p) => p.tier === "circle" && p.status === "approved",
      );

      return {
        conversations: real.length,
        messages_total: m.length,
        messages_last_30_days: m.filter(
          (r) => (r.created_at as string) > daysAgo(30),
        ).length,
        members_who_have_messaged: new Set(m.map((r) => r.sender_id)).size,
        eligible_members: circle.length,
        participation_rate_percent: rate(
          new Set(m.map((r) => r.sender_id)).size,
          circle.length,
        ),
        average_messages_per_conversation:
          real.length === 0 ? 0 : Math.round((m.length / real.length) * 10) / 10,
      };
    }

    case "content": {
      const [{ data: lessons }, { data: progress }, { data: attempts }] =
        await Promise.all([
          supabase.from("lessons").select("id,course_slug,title,video_file,free_preview"),
          supabase.from("lesson_progress").select("lesson_id,watched,quiz_passed"),
          supabase.from("quiz_attempts").select("lesson_id,passed,score"),
        ]);

      const l = lessons ?? [];
      const p = progress ?? [];

      return {
        total_lessons: l.length,
        lessons_with_video: l.filter((r) => r.video_file).length,
        free_preview_lessons: l.filter((r) => r.free_preview).length,
        lessons_never_started: l.filter(
          (r) => !p.some((x) => x.lesson_id === r.id),
        ).length,
        completion_by_lesson: l
          .map((r) => ({
            title: r.title as string,
            started: p.filter((x) => x.lesson_id === r.id).length,
            passed: p.filter((x) => x.lesson_id === r.id && x.quiz_passed).length,
          }))
          .filter((r) => r.started > 0)
          .slice(0, 20),
        quiz_difficulty: hardestLessons(attempts ?? []),
      };
    }
  }
}

/* ---------- helpers ---------- */

function countBy(values: (string | null)[]) {
  const out: Record<string, number> = {};
  values.forEach((v) => {
    if (!v) return;
    out[v] = (out[v] ?? 0) + 1;
  });
  return out;
}

function topCounts(values: (string | null)[], limit = 5) {
  return Object.entries(countBy(values))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function hardestLessons(attempts: { lesson_id?: unknown; passed?: unknown }[]) {
  const byLesson: Record<string, { attempts: number; passes: number }> = {};
  attempts.forEach((a) => {
    const id = String(a.lesson_id ?? "");
    if (!id) return;
    byLesson[id] ??= { attempts: 0, passes: 0 };
    byLesson[id].attempts += 1;
    if (a.passed) byLesson[id].passes += 1;
  });
  return Object.entries(byLesson)
    .map(([id, v]) => ({
      lesson_id: id,
      attempts: v.attempts,
      pass_rate_percent: rate(v.passes, v.attempts),
    }))
    .sort((a, b) => a.pass_rate_percent - b.pass_rate_percent)
    .slice(0, 5);
}
