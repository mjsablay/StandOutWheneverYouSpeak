"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Wrap, Section, PageSkeleton } from "@/components/ui";
import { getLesson, FREE_PREVIEW_COUNT } from "@/lib/courses";
import { hasQuiz } from "@/components/Quiz";
import { useAuth } from "@/lib/mock-auth";
import { useProgress } from "@/lib/progress";

/**
 * Shared frame for the four lesson screens: video, quiz, workbook, practice.
 * Handles auth, tier gating, the tab bar, and lesson-to-lesson navigation so
 * each screen only has to render its own content.
 */
export default function LessonShell({ children }: { children: ReactNode }) {
  const { slug, lesson: lessonSlug } = useParams<{
    slug: string;
    lesson: string;
  }>();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, hasFullAccess } = useAuth();
  const { hasPassed } = useProgress();

  const data = getLesson(slug, lessonSlug);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(
        `/signin?next=${encodeURIComponent(`/courses/${slug}/lessons/${lessonSlug}`)}`,
      );
    }
  }, [loading, user, router, slug, lessonSlug]);

  if (loading || !user) return <PageSkeleton />;

  if (!data) {
    return (
      <Section>
        <Wrap className="max-w-[520px] text-center">
          <h1 className="mb-3 text-2xl font-extrabold">Lesson not found</h1>
          <Link
            href={`/courses/${slug}`}
            className="font-semibold text-brand hover:underline"
          >
            ← Back to the course
          </Link>
        </Wrap>
      </Section>
    );
  }

  const { course, lesson, prev, next, index } = data;
  const base = `/courses/${slug}/lessons/${lessonSlug}`;
  const locked = !hasFullAccess && index >= FREE_PREVIEW_COUNT;
  const gated = hasQuiz(lesson.slug);
  const nextBlocked = gated && !hasPassed(lesson.slug);

  /* ---------- Locked behind Speakers' Circle ---------- */
  if (locked) {
    return (
      <Section>
        <Wrap className="max-w-[640px]">
          <Link
            href={`/courses/${slug}`}
            className="mb-6 inline-block text-[14px] font-semibold text-brand hover:underline"
          >
            ← {course.name}
          </Link>
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-10 text-center">
            <h1 className="mb-2 text-2xl font-extrabold">
              Lesson {lesson.number}: {lesson.title}
            </h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              Lessons 1–6 are free. Unlock all {course.lessons.length} lessons,
              unlimited AI practice, and the member community for $10 CAD/month.
            </p>
            <Link
              href={`/checkout?next=${encodeURIComponent(base)}`}
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Upgrade to unlock
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const tabs = [
    { href: base, label: "Video", icon: "", show: true },
    {
      href: `${base}/quiz`,
      label: "Quiz",
      icon: "",
      show: gated,
      done: hasPassed(lesson.slug),
    },
    {
      href: `${base}/workbook`,
      label: "Workbook",
      icon: "",
      show: Boolean(lesson.materials?.length),
    },
    {
      href: `${base}/practice`,
      label: "AI Coach",
      icon: "",
      show: Boolean(lesson.practice),
    },
  ].filter((t) => t.show);

  return (
    <Section>
      <Wrap className="max-w-[920px]">
        <Link
          href={`/courses/${slug}`}
          className="mb-5 inline-block text-[14px] font-semibold text-brand hover:underline"
        >
          ← {course.name}
        </Link>

        <div className="mb-6">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            Lesson {lesson.number} of {course.lessons.length}
          </div>
          <h1 className="text-[clamp(26px,4vw,38px)] font-extrabold tracking-tight">
            {lesson.title}
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-7 flex flex-wrap gap-1.5 border-b border-line">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`-mb-px flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-3 text-[14.5px] font-semibold transition ${
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <span aria-hidden>{t.icon}</span>
                {t.label}
                {t.done && <span className="text-accent-ink"></span>}
              </Link>
            );
          })}
        </div>

        {children}

        {/* Lesson-to-lesson navigation */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
          {prev ? (
            <Link
              href={`/courses/${slug}/lessons/${prev.slug}`}
              className="group max-w-[45%]"
            >
              <div className="text-[12.5px] uppercase tracking-wider text-ink-soft">
                Previous
              </div>
              <div className="text-[15px] font-semibold group-hover:text-brand">
                ← {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next && !nextBlocked ? (
            <Link
              href={`/courses/${slug}/lessons/${next.slug}`}
              className="group max-w-[45%] text-right"
            >
              <div className="text-[12.5px] uppercase tracking-wider text-ink-soft">
                Next
              </div>
              <div className="text-[15px] font-semibold group-hover:text-brand">
                {next.title} →
              </div>
            </Link>
          ) : next ? (
            <div className="max-w-[45%] text-right opacity-55">
              <div className="text-[12.5px] uppercase tracking-wider text-ink-soft">
                Next — pass the quiz to unlock
              </div>
              <div className="text-[15px] font-semibold">{next.title}</div>
            </div>
          ) : (
            <span />
          )}
        </div>
      </Wrap>
    </Section>
  );
}
