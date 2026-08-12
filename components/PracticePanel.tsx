"use client";

/**
 * AI practice panel — currently a scripted walkthrough, not a live agent.
 *
 * It exists to lock in the SHAPE of the coaching experience before any model
 * is connected: brief → speak → scored feedback against Barry's rubric.
 *
 * To make it real, replace runDemo() with:
 *   1. A WebRTC session against the OpenAI Realtime API (voice in / voice out)
 *   2. `lesson.practice.prompt` + COACHING_RULE + RUBRIC as system instructions
 *   3. A scoring call at session end returning { structure, delivery,
 *      eyeContact, onMessage, strength, improvements[] }
 * The UI below already renders exactly that shape.
 */

import { useState } from "react";
import { RUBRIC, scoreBand, type Lesson } from "@/lib/courses";

type Scores = Record<string, number>;

const DEMO: {
  scores: Scores;
  strength: string;
  structureFix: string;
  deliveryFix: string;
} = {
  scores: {
    structure: 4,
    delivery: 3,
    "eye-contact": 3,
    "on-message": 4,
  },
  strength:
    "Your headline landed in the first eight seconds — I knew exactly what you wanted before you explained why.",
  structureFix:
    "Your second point carried three ideas at once. Split it, or drop the weakest — the middle sagged because of it.",
  deliveryFix:
    "You filled every gap with 'so' and 'right'. Replace those with a silent beat; the pause does more work than the word.",
};

export default function PracticePanel({
  lesson,
  locked,
}: {
  lesson: Lesson;
  locked: boolean;
}) {
  const [stage, setStage] = useState<"idle" | "live" | "done">("idle");

  if (!lesson.practice) {
    return (
      <div className="rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 font-bold">AI practice</h3>
        <p className="text-[14.5px] text-ink-soft">
          A coaching scenario for this lesson is in development.
        </p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="rounded-2xl border-2 border-accent bg-accent-soft p-6">
        <h3 className="mb-1.5 font-bold">AI practice</h3>
        <p className="text-[14.5px] text-ink-soft">
          Unlimited AI coaching sessions are part of Speakers&apos; Circle.
        </p>
      </div>
    );
  }

  const total = Object.values(DEMO.scores).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-brand bg-white p-6 sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Practice with your AI coach</h3>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand">
          Preview
        </span>
      </div>

      <div className="mb-5 rounded-xl bg-paper-warm p-4">
        <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
          Your brief
        </div>
        <p className="text-[15px]">{lesson.practice.brief}</p>
      </div>

      {stage === "idle" && (
        <>
          <p className="mb-5 text-[14.5px] text-ink-soft">
            The coach listens, pushes back like a real audience, and scores you
            against the Speak with Impact rubric — structure, delivery, eye
            contact, and staying on message.
          </p>
          <button
            onClick={() => setStage("live")}
            className="rounded-lg bg-brand px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-dark"
          >
            Start practice session
          </button>
        </>
      )}

      {stage === "live" && (
        <div className="text-center">
          <div className="mb-4 flex items-end justify-center gap-1.5" aria-hidden>
            {[16, 30, 22, 38, 26, 18, 32].map((h, i) => (
              <span
                key={i}
                className="w-2 animate-pulse rounded-full bg-brand"
                style={{ height: h, animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
          <p className="mb-1 text-[15px] font-semibold">Coach is listening…</p>
          <p className="mb-5 text-[13.5px] text-ink-soft">
            In the live version this is a spoken back-and-forth — the coach
            interrupts, questions, and reacts in real time.
          </p>
          <button
            onClick={() => setStage("done")}
            className="rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-accent-dark"
          >
            End session &amp; get feedback
          </button>
        </div>
      )}

      {stage === "done" && (
        <div>
          <div className="mb-5 flex items-baseline gap-3">
            <span className="text-[40px] font-extrabold leading-none">
              {total}
              <span className="text-xl text-ink-soft">/20</span>
            </span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[13px] font-bold text-accent-ink">
              {scoreBand(total)}
            </span>
          </div>

          <div className="mb-5 space-y-2.5">
            {RUBRIC.map((c) => {
              const s = DEMO.scores[c.id] ?? 0;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-[150px] flex-shrink-0 text-[13.5px] font-semibold">
                    {c.name}
                  </span>
                  <span className="flex gap-1" aria-label={`${s} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`h-2.5 w-6 rounded-full ${
                          n <= s ? "bg-brand" : "bg-paper-warm"
                        }`}
                      />
                    ))}
                  </span>
                  <span className="text-[13px] font-bold text-ink-soft">
                    {s}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border-l-4 border-accent bg-accent-soft p-4">
              <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-accent-ink">
                Strength
              </div>
              <p className="text-[14.5px]">{DEMO.strength}</p>
            </div>
            <div className="rounded-xl border-l-4 border-brand bg-brand-soft p-4">
              <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-brand">
                Priority improvement — structure
              </div>
              <p className="text-[14.5px]">{DEMO.structureFix}</p>
            </div>
            <div className="rounded-xl border-l-4 border-brand bg-brand-soft p-4">
              <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-brand">
                Priority improvement — delivery
              </div>
              <p className="text-[14.5px]">{DEMO.deliveryFix}</p>
            </div>
          </div>

          <button
            onClick={() => setStage("idle")}
            className="mt-5 rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
          >
            Practise again
          </button>
        </div>
      )}
    </div>
  );
}
