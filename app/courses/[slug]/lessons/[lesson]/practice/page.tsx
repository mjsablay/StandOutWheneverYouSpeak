"use client";

import { useParams } from "next/navigation";
import PracticePanel from "@/components/PracticePanel";
import { getLesson, RUBRIC } from "@/lib/courses";

export default function LessonPracticeScreen() {
  const { slug, lesson: lessonSlug } = useParams<{
    slug: string;
    lesson: string;
  }>();

  const data = getLesson(slug, lessonSlug);
  if (!data) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <PracticePanel lesson={data.lesson} locked={false} />

      <div className="rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 text-[15px] font-bold">
          How the coach scores you
        </h3>
        <p className="mb-4 text-[13.5px] text-ink-soft">
          Barry&apos;s Speak with Impact rubric — four categories, 1–5 each,
          20 total.
        </p>
        <ul className="space-y-3.5">
          {RUBRIC.map((c, i) => (
            <li key={c.id}>
              <div className="text-[14px] font-bold">
                {["I", "II", "III", "IV"][i]}. {c.name}
              </div>
              <ul className="mt-1 space-y-0.5">
                {c.looksFor.map((l) => (
                  <li key={l} className="text-[13px] text-ink-soft">
                    · {l}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <a
          href="/materials/speak-with-impact-coaching-rubric.pdf"
          download
          className="mt-5 inline-block text-[13.5px] font-semibold text-brand hover:underline"
        >
          Download the full rubric ↓
        </a>
      </div>
    </div>
  );
}
