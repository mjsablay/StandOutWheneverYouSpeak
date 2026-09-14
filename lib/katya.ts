/**
 * Katya, the Speak with Impact Practice Coach, as Barry specified her.
 *
 * Source: his context prompt of 1 September 2026 and the covering email of
 * 6 September ("Speakers' Circle: How We're Using Katya as our Coach").
 * The full prompt is in lib/katya-context.ts (server-only); this file is the
 * part of the specification the interface needs, and it is safe to ship to
 * the browser.
 *
 * The one-line version of the whole document:
 *
 *   Katya does not create presentations for the learner. The learner owns
 *   the message; Katya coaches the thinking, preparation and delivery.
 *   Practise, receive one focused coaching point, retry, improve.
 *
 * Three things follow that the rest of the code must respect:
 *
 *   1. Three modes, entered in any order. The learner picks Frame, Notes
 *      or Delivery and Katya checks she has what that mode needs.
 *   2. One thing at a time. A strength, one priority improvement, a retry.
 *      Never a list of corrections, and no scores unless asked.
 *   3. Never pretend. She only assesses what the platform can reliably give
 *      her — a Frame she was handed, Notes as text, audio she can hear.
 *      Eye contact is "Not assessed" until a camera-based version exists.
 */

export type KatyaMode = "frame" | "notes" | "delivery";

/** What the member can prepare on the platform ahead of a session. */
export type PrepField = "audience" | "frame" | "notes";

/** Bump when Barry sends a new version of the context prompt. */
export const KATYA_CONTEXT_VERSION = "1 September 2026";

export type KatyaModeSpec = {
  id: KatyaMode;
  name: string;
  /** One word, for tabs and badges. */
  short: string;
  purpose: string;
  /** Barry's recommended live cap. Real speaking situations are time-boxed. */
  minutes: number;
  /** Primary rubric category, by RUBRIC id in lib/courses.ts. */
  rubric: "structure" | "on-message" | "delivery";
  /** Preparation the mode works best with. Missing items limit the coaching, never block it. */
  wants: readonly PrepField[];
  /** What Katya can still do when the preferred material is missing. */
  without: string;
  /** The two-minute warning, in Barry's words. */
  warning: string;
  /** Delivery needs to be heard. Until the voice coach ships, it is not offered in text. */
  voiceOnly: boolean;
};

export const KATYA_MODES: readonly KatyaModeSpec[] = [
  {
    id: "frame",
    name: "Coach My Frame",
    short: "Frame",
    purpose:
      "Strengthen the thinking, relevance and structure behind your message: Headline first, then What, Why and How.",
    minutes: 7,
    rubric: "structure",
    wants: ["audience", "frame"],
    without:
      "Without a Frame on file, Katya asks for your Headline and coaches one element at a time. Come with an attempt, not a blank page.",
    warning:
      "We have about two minutes left. Let's fix the one part of your Frame that matters most.",
    voiceOnly: false,
  },
  {
    id: "notes",
    name: "Review My Masterful Notes",
    short: "Notes",
    purpose:
      "Make sure your notes are easy to speak from and preserve the message you intend.",
    minutes: 6,
    rubric: "on-message",
    wants: ["frame", "notes"],
    without:
      "Without the Frame, Katya can review how usable the Notes are but cannot verify they preserve your message. Without the Notes, she'll suggest Prompt #2 and a return visit.",
    warning:
      "We have about two minutes left. Let's make the one change that will make your notes easier to use.",
    voiceOnly: false,
  },
  {
    id: "delivery",
    name: "Coach My Delivery",
    short: "Delivery",
    purpose:
      "Deliver the message as you would to the real audience, get one focused coaching point, and try it again.",
    minutes: 10,
    rubric: "delivery",
    wants: ["frame", "notes"],
    without:
      "Without the Frame and Notes, Katya coaches only what she can reliably hear and does not judge the content.",
    warning:
      "We have about two minutes left. Let's focus on the one Delivery change that will lift your next attempt.",
    voiceOnly: true,
  },
];

export const modeById = (id: string): KatyaModeSpec | null =>
  KATYA_MODES.find((m) => m.id === id) ?? null;

/** The coaching loop, in Barry's order. */
export const COACHING_LOOP = [
  "Ask",
  "Listen",
  "Recognize",
  "Diagnose",
  "Coach",
  "Retry",
  "Reinforce",
] as const;

/**
 * The scale Katya uses when, and only when, a learner asks for a score.
 * 0 is not a low mark: it means the criterion could not be reliably assessed.
 */
export const KATYA_SCALE = [
  { score: 5, label: "Excellent" },
  { score: 4, label: "Very Good" },
  { score: 3, label: "Good" },
  { score: 2, label: "Fair" },
  { score: 1, label: "Poor" },
  { score: 0, label: "Not assessed" },
] as const;

/**
 * The two preparation prompts learners use offline before a session. The
 * prompt text itself is Barry's and arrives as downloads with the
 * Speakers' Circle toolkit; the platform describes what each produces.
 */
export const PREP_PROMPTS = [
  {
    number: 1,
    name: "Frame your presentation",
    does: "Use the Presentation Pyramid to organise the message: Headline, then What, Why and How, the Evidence each needs, and a Close.",
    produces: "frame" as const,
  },
  {
    number: 2,
    name: "Turn your Presentation Pyramid into Masterful Notes",
    does: "Convert the completed Pyramid into speaking notes built for natural delivery: one spoken idea per line, a bullet on every line, connected ideas indented.",
    produces: "notes" as const,
  },
] as const;

/** The operating principle, as Barry put it. */
export const KATYA_PRINCIPLE =
  "Use the preparation tools to build it. Use Katya to test it. Use practice to master it.";

/** What a member can expect from a session, for the interface to say plainly. */
export const KATYA_PROMISES = [
  "Start where you need help: your Frame, your Masterful Notes, or your Delivery.",
  "One coaching idea per turn, so it lands before the next.",
  "A strength, one priority improvement, then you try it again.",
  "Scores against Barry's rubric only when you ask, and never for anything she can't reliably assess.",
] as const;

/** Labels for what the member has prepared. */
export const PREP_LABELS: Record<PrepField, string> = {
  audience: "Audience and situation",
  frame: "Frame",
  notes: "Masterful Notes",
};
