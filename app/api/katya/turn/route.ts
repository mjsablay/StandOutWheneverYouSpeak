import { NextResponse, type NextRequest } from "next/server";
import { modeById, type KatyaMode } from "@/lib/katya";
import {
  askKatya,
  buildKatyaInstructions,
  hasOpenAIKey,
  KATYA_TEXT_MODEL,
  loadMaterials,
  requireCircleMember,
  type PlatformSignal,
  type Turn,
} from "@/lib/katya-session";

/**
 * One turn of a text session with Katya.
 *
 * The browser holds the transcript and sends it whole each time; the server
 * decides who may practise, gathers what the platform knows about the
 * exercise (topic, the member's saved Frame and Notes, their last session,
 * the timer) and asks the model for Katya's next line. Nothing is stored
 * here — the end route saves the session once it is over.
 *
 * With no OPENAI_API_KEY the route says so (501) rather than failing oddly,
 * the same pattern as the invite route and its service key.
 */

const MAX_TURNS = 80;
const MAX_CHARS = 6000;
const SIGNALS: PlatformSignal[] = ["two_minutes", "time_up"];

type Body = {
  topicId?: unknown;
  mode?: unknown;
  turns?: unknown;
  remainingSeconds?: unknown;
  signal?: unknown;
};

function cleanTurns(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_TURNS) return null;
  const out: Turn[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") return null;
    const { role, text } = t as { role?: unknown; text?: unknown };
    if ((role !== "coach" && role !== "learner") || typeof text !== "string") return null;
    const trimmed = text.trim();
    if (!trimmed) continue;
    out.push({ role, text: trimmed.slice(0, MAX_CHARS) });
  }
  return out;
}

export async function POST(request: NextRequest) {
  const gate = await requireCircleMember();
  if ("error" in gate) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }
  const { member, supabase } = gate;

  const body = ((await request.json().catch(() => null)) ?? {}) as Body;

  const topicId = typeof body.topicId === "string" ? body.topicId : "";
  const mode = modeById(typeof body.mode === "string" ? body.mode : "");
  const turns = cleanTurns(body.turns ?? []);
  const remainingSeconds =
    typeof body.remainingSeconds === "number" && Number.isFinite(body.remainingSeconds)
      ? Math.max(0, Math.round(body.remainingSeconds))
      : null;
  const signal = SIGNALS.includes(body.signal as PlatformSignal)
    ? (body.signal as PlatformSignal)
    : null;

  if (!topicId || !mode || !turns) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (mode.voiceOnly) {
    return NextResponse.json(
      { error: `${mode.name} needs to hear you. It arrives with the voice coach.` },
      { status: 400 },
    );
  }
  if (!hasOpenAIKey()) {
    return NextResponse.json(
      {
        needsKey: true,
        error:
          "Katya is not connected yet. Set OPENAI_API_KEY in Vercel to turn on text sessions.",
      },
      { status: 501 },
    );
  }

  const materials = await loadMaterials(supabase, member.id, topicId);
  if (!materials) {
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });
  }

  const instructions = buildKatyaInstructions({
    ...materials,
    mode: mode.id as KatyaMode,
    channel: "text",
    learnerName: member.firstName,
    remainingSeconds,
    signal,
  });

  const result = await askKatya(instructions, turns, turns.length === 0);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ reply: result.reply, model: KATYA_TEXT_MODEL() });
}
