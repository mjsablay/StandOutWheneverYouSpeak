"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Wrap, Section, Check, PageSkeleton } from "@/components/ui";
import { getCourse, FREE_PREVIEW_COUNT } from "@/lib/courses";
import { useAuth } from "@/lib/mock-auth";
import { useProgress } from "@/lib/progress";
import { hasQuiz } from "@/components/Quiz";

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading, hasFullAccess } = useAuth();
  const { hasPassed } = useProgress();

  const course = getCourse(slug);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/signin?next=${encodeURIComponent(`/courses/${slug}`)}`);
    }
  }, [loading, user, router, slug]);

  if (loading || !user) return <PageSkeleton />;

  if (!course) {
    return (
      <Section>
        <Wrap className="max-w-[520px] text-center">
          <h1 className="mb-3 text-2xl font-extrabold">Course not found</h1>
          <Link href="/courses" className="font-semibold text-brand hover:underline">
            ← Back to courses
          </Link>
        </Wrap>
      </Section>
    );
  }

  const isMember = hasFullAccess;
  const firstLesson = course.lessons[0];

  return (
    <Section>
      <Wrap>
        <Link
          href="/courses"
          className="mb-6 inline-block text-[14px] font-semibold text-brand hover:underline"
        >
          ← All courses
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[640px]">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
              {course.audience}
            </div>
            <h1 className="mb-3 text-[clamp(30px,4vw,42px)] font-extrabold tracking-tight">
              {course.name}
            </h1>
            <p className="text-[17px] text-ink-soft">{course.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-[14px] text-ink-soft">
              <span>
                <strong className="text-ink">{course.lessons.length}</strong>{" "}
                lessons
              </span>
              <span>
                <strong className="text-ink">
                  {course.lessons.filter((l) => l.video).length}
                </strong>{" "}
                videos available
              </span>
            </div>
          </div>
          <span
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
              isMember ? "bg-accent-soft text-accent-ink" : "bg-brand-soft text-brand"
            }`}
          >
            {isMember ? "Speakers' Circle" : "Front Row"}
          </span>
        </div>

        {firstLesson && (
          <div className="mb-8">
            <Link
              href={`/courses/${slug}/lessons/${firstLesson.slug}`}
              className="inline-block rounded-lg bg-brand px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-dark"
            >
              Start course → {firstLesson.title}
            </Link>
          </div>
        )}

        {!isMember && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-accent bg-accent-soft p-6">
            <div>
              <h2 className="mb-1 text-lg font-bold">
                You&apos;re previewing the first {FREE_PREVIEW_COUNT} lessons
              </h2>
              <p className="text-[14.5px] text-ink-soft">
                Unlock all {course.lessons.length} lessons, unlimited AI
                practice, and the member community for $10 CAD/month.
              </p>
            </div>
            <Link
              href={`/checkout?next=${encodeURIComponent(`/courses/${slug}`)}`}
              className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
            >
              Upgrade to unlock
            </Link>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {course.lessons.map((lesson, i) => {
            const locked = !isMember && i >= FREE_PREVIEW_COUNT;
            return (
              <Link
                key={lesson.slug}
                href={`/courses/${slug}/lessons/${lesson.slug}`}
                className={`flex items-center gap-4 border-b border-line px-6 py-4 transition last:border-0 hover:bg-paper-warm ${
                  locked ? "opacity-60" : ""
                }`}
              >
                <span className="w-9 flex-shrink-0 text-[14px] font-bold text-ink-soft">
                  {lesson.number}
                </span>
                <span className="flex-1">
                  <span className="block text-[15.5px] font-semibold">
                    {lesson.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[13px] text-ink-soft">
                    <span>{lesson.video ? "Video" : "Notes only"}</span>
                    {hasQuiz(lesson.slug) && (
                      <span
                        className={
                          hasPassed(lesson.slug)
                            ? "font-semibold text-accent-ink"
                            : ""
                        }
                      >
                        {hasPassed(lesson.slug) ? " Quiz passed" : "Quiz"}
                      </span>
                    )}
                  </span>
                </span>
                {locked ? (
                  <span className="flex-shrink-0 text-[13px] text-ink-soft">
                    Locked
                  </span>
                ) : (
                  <span className="flex-shrink-0 rounded-lg bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white">
                    Start
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-paper-warm p-6">
          <h3 className="mb-2 font-bold">Coming to each lesson</h3>
          <ul className="space-y-1.5 text-[14.5px] text-ink-soft">
            <li className="flex gap-2">
              <Check /> Downloadable workbook and example scenarios
            </li>
            <li className="flex gap-2">
              <Check /> Exercise and quiz
            </li>
            <li className="flex gap-2">
              <Check /> Voice-to-voice AI coaching session
            </li>
            <li className="flex gap-2">
              <Check /> Progress tracking and points
            </li>
          </ul>
        </div>
      </Wrap>
    </Section>
  );
}
