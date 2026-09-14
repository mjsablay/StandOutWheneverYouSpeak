"use client";

import { useParams } from "next/navigation";
import PracticePanel from "@/components/PracticePanel";
import { getLesson, RUBRIC } from "@/lib/courses";
import { useAccess } from "@/lib/access";
import { COACH_NAME } from "@/lib/site";

export default function LessonPracticeScreen() {
  const { slug, lesson: lessonSlug } = useParams<{
    slug: string;
    lesson: string;
  }>();
  const access = useAccess();

  const data = getLesson(slug, lessonSlug);
  if (!data) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <PracticePanel lesson={data.lesson} locked={!access.loading && !access.fullAccess} />

      <div className="rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 text-[15px] font-bold">
          How {COACH_NAME} uses the rubric
        </h3>
        <p className="mb-4 text-[13.5px] text-ink-soft">
          Barry&apos;s Speak with Impact rubric guides what she notices, what she
          reinforces, and which one improvement she picks. She scores only when
          you ask, 0 to 5 per category, and marks anything she can&apos;t
          reliably assess as &ldquo;Not assessed&rdquo;.
        </p>
        <ul className="space-y-3.5">
          {RUBRIC.map((c, i) => (
            <li key={c.id}>
              <div className="text-[14px] font-bold">
                {["I", "II", "III", "IV"][i]}. {c.name}
                {!c.scored && (
                  <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                    Not assessed
                  </span>
                )}
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
