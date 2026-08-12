"use client";

import { useParams } from "next/navigation";
import { getLesson } from "@/lib/courses";

const MATERIAL_META = {
  exercise: {
    icon: "",
    blurb: "Work through this alongside the lesson.",
  },
  workbook: {
    icon: "",
    blurb: "The full learner workbook for this chapter.",
  },
  quiz: {
    icon: "",
    blurb: "Printable version of the quiz questions.",
  },
  guide: {
    icon: "",
    blurb: "A reference guide to keep after the lesson.",
  },
} as const;

export default function LessonWorkbookScreen() {
  const { slug, lesson: lessonSlug } = useParams<{
    slug: string;
    lesson: string;
  }>();

  const data = getLesson(slug, lessonSlug);
  if (!data) return null;

  const materials = data.lesson.materials ?? [];

  if (!materials.length) {
    return (
      <div className="rounded-2xl border border-line bg-paper-warm p-8 text-center">
        <h2 className="mb-1 font-bold">No downloads yet</h2>
        <p className="text-[14.5px] text-ink-soft">
          Materials for this lesson are being prepared.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="mb-1.5 text-lg font-bold">Workbook &amp; exercises</h2>
        <p className="max-w-[640px] text-[15px] text-ink-soft">
          Download these to work through alongside the video. The exercises are
          where the learning actually sticks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {materials.map((m) => {
          const meta = MATERIAL_META[m.kind];
          const ext = m.file.split(".").pop()?.toUpperCase();
          return (
            <a
              key={m.file}
              href={`/materials/${m.file}`}
              download
              className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_10px_26px_rgba(20,24,31,.08)]"
            >
              <span className="text-2xl" aria-hidden>
                {meta.icon}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[16px] font-bold group-hover:text-brand">
                    {m.label}
                  </span>
                  <span className="rounded bg-paper-warm px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">
                    {ext}
                  </span>
                </span>
                <span className="mt-1 block text-[13.5px] text-ink-soft">
                  {meta.blurb}
                </span>
              </span>
              <span className="text-ink-soft group-hover:text-brand" aria-hidden>
                ↓
              </span>
            </a>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 font-bold">Coming soon</h3>
        <p className="text-[14.5px] text-ink-soft">
          Submitting completed exercises for feedback — from the AI coach, from
          peers in the community, or from Barry directly.
        </p>
      </div>
    </>
  );
}
