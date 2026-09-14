import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { modeById } from "@/lib/katya";
import { KATYA_TEXT_MODEL, requireCircleMember, type Turn } from "@/lib/katya-session";
import { findTopic } from "@/lib/topics";

/**
 * Saves a finished session to practice_sessions.
 *
 * Written with the service role, never by the browser: the client-side
 * insert policy was dropped in migration 0009 because a client that can
 * insert its own rows can insert its own scores. Katya's closing line is
 * kept separately so her next session on the topic can pick up from it.
 */

const REASONS = ["learner", "time_up", "error"] as const;
type Reason = (typeof REASONS)[number];

export async function POST(request: NextRequest) {
  const gate = await requireCircleMember();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const { member } = gate;

  const body = ((await request.json().catch(() => null)) ?? {}) as {
    topicId?: unknown;
    mode?: unknown;
    turns?: unknown;
    durationSeconds?: unknown;
    endedReason?: unknown;
  };

  const topic = typeof body.topicId === "string" ? findTopic(body.topicId) : null;
  const mode = modeById(typeof body.mode === "string" ? body.mode : "");
  const reason = REASONS.includes(body.endedReason as Reason)
    ? (body.endedReason as Reason)
    : "learner";
  const duration =
    typeof body.durationSeconds === "number" && Number.isFinite(body.durationSeconds)
      ? Math.max(0, Math.round(body.durationSeconds))
      : null;

  const turns: Turn[] = Array.isArray(body.turns)
    ? (body.turns as unknown[])
        .filter(
          (t): t is Turn =>
            !!t &&
            typeof t === "object" &&
            ((t as Turn).role === "coach" || (t as Turn).role === "learner") &&
            typeof (t as Turn).text === "string",
        )
        .map((t) => ({ role: t.role, text: t.text.trim().slice(0, 6000) }))
        .filter((t) => t.text)
    : [];

  if (!topic || !mode) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // A session the learner never spoke in is not worth a row.
  if (!turns.some((t) => t.role === "learner")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY to save sessions." },
      { status: 501 },
    );
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const transcript = turns
    .map((t) => `${t.role === "coach" ? "Katya" : "Learner"}: ${t.text}`)
    .join("\n\n");
  const closing = [...turns].reverse().find((t) => t.role === "coach")?.text ?? null;

  const { data, error } = await admin
    .from("practice_sessions")
    .insert({
      user_id: member.id,
      topic_id: topic.id,
      mode: mode.id,
      channel: "text",
      kind: "ai",
      transcript,
      duration_seconds: duration,
      model: KATYA_TEXT_MODEL(),
      ended_reason: reason,
      closing,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
