"use client";

/**
 * The Katya tab on a lesson.
 *
 * Coaching happens in a Speakers' Circle topic workspace, where the member's
 * Frame and Masterful Notes are saved and Katya starts from them. This panel
 * carries the lesson's brief across and says how a session works. It used to
 * be a scripted demo with invented scores; Barry's context prompt rules out
 * both the interruptions it promised and the routine scoring.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COACH_NAME } from "@/lib/site";
import { KATYA_MODES, KATYA_PROMISES } from "@/lib/katya";
import { SELF_INTRODUCTION } from "@/lib/topics";
import type { Lesson } from "@/lib/courses";

export default function PracticePanel({
  lesson,
  locked,
}: {
  lesson: Lesson;
  locked: boolean;
}) {
  if (!lesson.practice) {
    return (
      <div className="rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 font-bold">Practise with {COACH_NAME}</h3>
        <p className="text-[14.5px] text-ink-soft">
          A coaching brief for this lesson is in development.
        </p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="rounded-2xl border-2 border-accent bg-accent-soft p-6">
        <h3 className="mb-1.5 font-bold">Practise with {COACH_NAME}</h3>
        <p className="mb-4 text-[14.5px] text-ink-soft">
          Coaching sessions with {COACH_NAME} are part of Speakers&apos; Circle.
        </p>
        <Link
          href="/pricing"
          className="inline-block rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-dark"
        >
          See Speakers&apos; Circle
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand bg-white p-6 sm:p-7">
      <h3 className="mb-4 text-lg font-bold">Practise with {COACH_NAME}</h3>

      <div className="mb-5 rounded-xl bg-paper-warm p-4">
        <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
          Your brief
        </div>
        <p className="text-[15px]">{lesson.practice.brief}</p>
      </div>

      <p className="mb-4 text-[14.5px] leading-relaxed text-ink-soft">
        Take this into a topic workspace. Save your Frame and Masterful Notes,
        then choose where you want help:
      </p>
      <ul className="mb-5 space-y-1.5 text-[14px]">
        {KATYA_MODES.map((m) => (
          <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-semibold">{m.name}</span>
            <span className="text-[12.5px] text-ink-soft">
              {m.voiceOnly ? "with the voice coach" : `up to ${m.minutes} min`}
            </span>
          </li>
        ))}
      </ul>
      <ul className="mb-6 space-y-1.5 text-[13.5px] text-ink-soft">
        {KATYA_PROMISES.slice(1).map((p) => (
          <li key={p}>· {p}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/topics/${SELF_INTRODUCTION.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-dark"
        >
          Your self-introduction
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </Link>
        <Link
          href="/topics"
          className="inline-flex items-center rounded-lg border border-line bg-white px-4 py-2.5 text-[14px] font-semibold hover:bg-paper-warm"
        >
          All eighty topics
        </Link>
      </div>
    </div>
  );
}
