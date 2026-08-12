"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { getLesson, videoUrl } from "@/lib/courses";
import { hasQuiz } from "@/components/Quiz";
import { useProgress } from "@/lib/progress";

export default function LessonVideoScreen() {
  const { slug, lesson: lessonSlug } = useParams<{
    slug: string;
    lesson: string;
  }>();
  const { hasPassed } = useProgress();
  const [done, setDone] = useState(false);

  const data = getLesson(slug, lessonSlug);
  if (!data) return null;

  const { lesson } = data;
  const base = `/courses/${slug}/lessons/${lessonSlug}`;
  const gated = hasQuiz(lesson.slug);
  const passed = hasPassed(lesson.slug);

  return (
    <>
      <VideoPlayer src={videoUrl(lesson.video)} title={lesson.title} />

      <div className="mt-8">
        <h2 className="mb-2.5 text-lg font-bold">About this lesson</h2>
        <p className="max-w-[720px] text-[15.5px] leading-relaxed text-ink-soft">
          {lesson.summary}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDone((v) => !v)}
            className={`rounded-lg px-5 py-2.5 text-[14.5px] font-semibold transition ${
              done
                ? "bg-accent text-ink hover:bg-accent-dark"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {done ? "Watched · +50 points" : "Mark video as watched"}
          </button>

          {gated && (
            <Link
              href={`${base}/quiz`}
              className="rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
            >
              {passed ? "Review the quiz →" : "Take the quiz →"}
            </Link>
          )}

          {lesson.practice && (
            <Link
              href={`${base}/practice`}
              className="rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
            >
              Practise with the AI coach →
            </Link>
          )}
        </div>

        {gated && !passed && (
          <p className="mt-4 text-[14px] text-ink-soft">
            Pass the quiz at 80% to unlock the next lesson.
          </p>
        )}
      </div>
    </>
  );
}
