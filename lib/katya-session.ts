import "server-only";

import { createClient } from "@/lib/supabase/server";
import { KATYA_CONTEXT } from "@/lib/katya-context";
import { modeById, type KatyaMode } from "@/lib/katya";
import { findTopic, sectionOf, type Topic } from "@/lib/topics";

/**
 * Server side of a Katya session: who may practise, what the platform
 * hands her about the current exercise, and the call to the model.
 *
 * Barry's document lists what the platform "may provide": the topic, the
 * learner's Frame, their Masterful Notes, a previous attempt, the coaching
 * mode and reliable timing. It also says what she must never do: claim to
 * see material she was not given, invent time remaining, or assess what the
 * channel cannot carry. buildKatyaInstructions() is where both halves are
 * kept honest — every item is either supplied verbatim or marked as not
 * supplied, and the channel says what can and cannot be heard.
 */

export type Turn = { role: "coach" | "learner"; text: string };

export type PlatformSignal = "two_minutes" | "time_up";

export type SessionMaterials = {
  topic: Topic;
  mode: KatyaMode;
  channel: "text" | "voice";
  learnerName: string | null;
  audience: string | null;
  frame: string | null;
  notes: string | null;
  previous: { when: string; mode: KatyaMode; closing: string | null } | null;
  /** From the platform timer, or null when there is no reliable timer. */
  remainingSeconds: number | null;
  signal: PlatformSignal | null;
};

const MODE_LABEL: Record<KatyaMode, string> = {
  frame: "COACH MY FRAME",
  notes: "REVIEW MY MASTERFUL NOTES",
  delivery: "COACH MY DELIVERY",
};

const notSupplied = (what: string) =>
  `Not supplied. The learner has not added ${what} on the platform. Do not assume one exists and do not invent it.`;

export function buildKatyaInstructions(m: SessionMaterials): string {
  const mode = modeById(m.mode);
  if (!mode) throw new Error(`Unknown mode ${m.mode}`);
  const section = sectionOf(m.topic.id);

  const lines: string[] = [];
  lines.push("PLATFORM SESSION MATERIALS");
  lines.push(
    "Everything below is supplied by the Speakers' Circle platform for the current learner and the current exercise. Use it as described in LEARNER-SPECIFIC SESSION MATERIALS above.",
  );
  lines.push("");

  // ---- Channel ----
  if (m.channel === "text") {
    lines.push("CHANNEL: TEXT");
    lines.push(
      "This session is typed, not spoken. The learner types each turn and reads your replies. There is no audio, no Push to Talk and no visual signal.",
    );
    lines.push(
      "Do not mention Push to Talk. Do not assess pace, pauses, fillers, vocal emphasis or any other delivery behaviour, because you cannot hear the learner. If asked about delivery, say briefly that delivery coaching needs the voice session.",
    );
    lines.push(
      "Keep the same conversational pacing as if speaking: one short coaching idea or one short question per turn, roughly 15 to 25 words, then stop and let the learner respond.",
    );
  } else {
    lines.push("CHANNEL: VOICE");
    lines.push(
      "The learner speaks using Push to Talk. Button release is the signal that their turn is finished. No visual-analysis information is available: eye contact, posture, gesture and facial expression are Not Assessed.",
    );
  }
  lines.push("");

  // ---- Mode ----
  lines.push(`COACHING MODE: ${MODE_LABEL[m.mode]}`);
  lines.push(
    `The learner chose this mode on the platform before joining, so do not ask where they would like to start. Perform the readiness check for this mode using the material below, then begin. The recommended cap for this mode is about ${mode.minutes} minutes.`,
  );
  lines.push("");

  // ---- Learner ----
  if (m.learnerName) {
    lines.push(`LEARNER: ${m.learnerName}`);
    lines.push("");
  }

  // ---- Topic ----
  lines.push("SELECTED TOPIC");
  lines.push(
    section ? `${m.topic.title} (Speakers' Circle theme: ${section.name})` : m.topic.title,
  );
  if (m.topic.brief) lines.push(m.topic.brief);
  lines.push("Thinking prompts the learner was given for this topic:");
  m.topic.prompts.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  lines.push("");

  // ---- Audience ----
  lines.push("AUDIENCE, SITUATION AND OBJECTIVE (in the learner's words)");
  lines.push(m.audience?.trim() || notSupplied("audience or situation notes"));
  lines.push("");

  // ---- Frame ----
  lines.push("THE LEARNER'S FRAME");
  if (m.frame?.trim()) {
    lines.push("Supplied by the platform, exactly as the learner saved it:");
    lines.push("<<<FRAME");
    lines.push(m.frame.trim());
    lines.push("FRAME>>>");
  } else {
    lines.push(notSupplied("a Frame"));
  }
  lines.push("");

  // ---- Notes ----
  lines.push("THE LEARNER'S MASTERFUL NOTES");
  if (m.notes?.trim()) {
    lines.push(
      "Supplied by the platform as plain text with line breaks and leading spaces preserved exactly as the learner typed them. Font, point size, line spacing and bullet glyphs are NOT preserved: assess only the structure you can see in the text, and do not comment on formatting you cannot see.",
    );
    lines.push("<<<NOTES");
    lines.push(m.notes.replace(/\s+$/, ""));
    lines.push("NOTES>>>");
  } else {
    lines.push(notSupplied("Masterful Notes"));
  }
  lines.push("");

  // ---- Previous session ----
  lines.push("PREVIOUS SESSION ON THIS TOPIC");
  if (m.previous) {
    lines.push(
      `${m.previous.when}, mode ${MODE_LABEL[m.previous.mode]}. No transcript is supplied, only your closing line from that session:`,
    );
    lines.push(m.previous.closing ? `"${m.previous.closing}"` : "(no closing line was recorded)");
    lines.push(
      "Use it only to re-establish briefly where the learner would like to resume. Do not claim to remember anything else.",
    );
  } else {
    lines.push("None recorded. This is the learner's first session on this topic.");
  }
  lines.push("");

  // ---- Timing ----
  lines.push("TIMING");
  if (m.remainingSeconds === null) {
    lines.push(
      "No reliable timer is supplied. Do not state how much time remains.",
    );
  } else {
    const mins = Math.max(0, Math.round(m.remainingSeconds / 60));
    lines.push(
      `Reliable platform timer: about ${mins} minute${mins === 1 ? "" : "s"} remaining in this session. Only mention time when the platform signals it below.`,
    );
  }
  if (m.signal === "two_minutes") {
    lines.push("");
    lines.push("PLATFORM SIGNAL: TWO-MINUTE WARNING");
    lines.push(
      `About two minutes remain. In this turn, give the two-minute message for this mode, in words close to: "${mode.warning}" Then coach the one change that matters most.`,
    );
  } else if (m.signal === "time_up") {
    lines.push("");
    lines.push("PLATFORM SIGNAL: SESSION TIME IS UP");
    lines.push(
      "The platform is ending the session now. In one or two short sentences, close with one clear next step for the learner. Do not ask a question and do not start a new coaching point.",
    );
  }

  return `${KATYA_CONTEXT}\n\n${lines.join("\n")}`;
}

/* ------------------------------------------------------------------ */
/* Who may practise                                                    */
/* ------------------------------------------------------------------ */

export type Member = {
  id: string;
  firstName: string | null;
  role: "admin" | "member";
};

/**
 * Signed in, approved and on Speakers' Circle (or an admin). Same rule as
 * hasFullAccess in lib/mock-auth.tsx, decided on the server where the
 * browser cannot argue with it.
 */
export async function requireCircleMember(): Promise<
  { member: Member; supabase: Awaited<ReturnType<typeof createClient>> } | { error: string; status: number }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,tier,status,first_name,display_name")
    .eq("id", user.id)
    .maybeSingle();

  const admin = profile?.role === "admin";
  const circle = profile?.status === "approved" && profile?.tier === "circle";
  if (!admin && !circle) {
    return { error: "Coaching sessions with Katya are part of Speakers' Circle.", status: 403 };
  }

  const firstName =
    (profile?.first_name as string | null) ??
    (profile?.display_name ? String(profile.display_name).split(" ")[0] : null);

  return {
    member: { id: user.id, firstName, role: admin ? "admin" : "member" },
    supabase,
  };
}

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

export async function loadMaterials(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topicId: string,
) {
  const topic = findTopic(topicId);
  if (!topic) return null;

  const [{ data: prep }, { data: last }] = await Promise.all([
    supabase
      .from("practice_prep")
      .select("audience,frame,notes")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .maybeSingle(),
    supabase
      .from("practice_sessions")
      .select("mode,closing,created_at")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const previous =
    last && last.mode
      ? {
          when: new Date(last.created_at as string).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          mode: last.mode as KatyaMode,
          closing: (last.closing as string | null) ?? null,
        }
      : null;

  return {
    topic,
    audience: (prep?.audience as string | null) ?? null,
    frame: (prep?.frame as string | null) ?? null,
    notes: (prep?.notes as string | null) ?? null,
    previous,
  };
}

/* ------------------------------------------------------------------ */
/* The model                                                           */
/* ------------------------------------------------------------------ */

/**
 * Text sessions run on an ordinary chat model with Barry's context as the
 * system instruction. The voice coach will use the Realtime API with the
 * same instructions; this is the cheap way to test the coaching before
 * paying for audio. Model ID lives in an environment variable because it
 * will change.
 */
export const KATYA_TEXT_MODEL = () =>
  process.env.OPENAI_TEXT_MODEL?.trim() || "gpt-5-mini";

export const hasOpenAIKey = () => Boolean(process.env.OPENAI_API_KEY?.trim());


export async function askKatya(
  instructions: string,
  turns: Turn[],
  opening: boolean,
): Promise<{ reply: string } | { error: string }> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return {
      error:
        "Katya is not connected yet. Set OPENAI_API_KEY in Vercel (and .env.local for local development) to turn her on.",
    };
  }

  const model = KATYA_TEXT_MODEL();
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: instructions },
    ...turns.map((t) => ({
      role: t.role === "coach" ? ("assistant" as const) : ("user" as const),
      content: t.text,
    })),
  ];
  if (opening) {
    messages.push({
      role: "user",
      content:
        "(The learner has just joined the session. Greet them briefly by name if you have it, run the readiness check for the chosen mode using the supplied material, and begin.)",
    });
  } else if (turns.length > 0 && turns[turns.length - 1].role === "coach") {
    // A platform signal with no learner text: the model must still reply.
    messages.push({
      role: "user",
      content: "(Platform signal only. Respond to the signal in the session materials.)",
    });
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    max_completion_tokens: 1200,
  };
  // Reasoning models spend tokens thinking before a 25-word reply; keep it
  // brisk. Older models reject the field, so only send it where it exists.
  if (/^(gpt-5|o\d)/.test(model)) body.reasoning_effort = "low";

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { error: `Could not reach OpenAI: ${(e as Error).message}` };
  }

  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (j.error?.message) detail = j.error.message;
    } catch {
      /* keep the status */
    }
    return { error: `Katya could not respond (${detail}).` };
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const reply = json.choices?.[0]?.message?.content?.trim();
  if (!reply) return { error: "Katya sent an empty reply. Try again." };
  return { reply };
}
