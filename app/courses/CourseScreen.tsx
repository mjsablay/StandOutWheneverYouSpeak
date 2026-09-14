"use client";

import Link from "next/link";
import { Check, FileText, Lock, Mic, Play } from "lucide-react";
import { Wrap, Section, Eyebrow, Btn, PageSkeleton } from "@/components/ui";
import { COURSES, FREE_PREVIEW_COUNT, type Lesson } from "@/lib/courses";
import { useAccess } from "@/lib/access";
import { useProgress } from "@/lib/progress";
import { hasQuiz } from "@/components/Quiz";
import { COACH_NAME } from "@/lib/site";

/**
 * Leadership Voice: the lesson list, and where the member left off.
 *
 * The one thing this page owes a returning member is "where was I?" — the
 * old course page always said "Start course → Be Remarkable" however many
 * lessons they had watched. Progress comes from `member_progress` through
 * useProgress, so the answer is the real one.
 *
 * Campus Voice is a line at the bottom, not a card. It has ten titles and
 * no recordings, exercises or quizzes; giving it a Start button would be
 * the same fiction as the old index's dead second card.
 */

const course = COURSES[0];
const campus = COURSES[1];

export default function CourseScreen() {
  const access = useAccess();
  const { hasWatched, hasPassed, loading: progressLoading } = useProgress(course.slug);

  if (access.loading) return <PageSkeleton />;

  const { signedIn, fullAccess } = access;
  const openCount = fullAccess ? course.lessons.length : FREE_PREVIEW_COUNT;
  const open = course.lessons.slice(0, openCount);

  const watched = signedIn ? open.filter((l) => hasWatched(l.slug)) : [];
  const next = signedIn ? open.find((l) => !hasWatched(l.slug)) : open[0];
  const started = watched.length > 0;

  // Signed out, every link has to go through sign-in — being bounced off
  // the lesson page is a worse welcome than being asked on the way in.
  const lessonHref = (lesson: Lesson) => {
    const to = `/courses/${course.slug}/lessons/${lesson.slug}`;
    return signedIn ? to : `/signin?next=${encodeURIComponent(to)}`;
  };

  const videoCount = course.lessons.filter((l) => l.video).length;

  return (
    <Section>
      <Wrap>
        {/* ---------- Header ---------- */}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-[680px]">
            <Eyebrow>{course.audience}</Eyebrow>
            <h1 className="display text-[clamp(30px,4.4vw,50px)]">{course.name}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
              {course.blurb}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-soft">
              <span>
                <strong className="text-ink">{course.lessons.length}</strong> lessons
              </span>
              <span>
                <strong className="text-ink">{videoCount}</strong> with video
              </span>
              <span>
                <strong className="text-ink">{course.level}</strong>
              </span>
            </div>
          </div>
          {signedIn && (
            <span
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${
                fullAccess
                  ? "bg-accent-soft text-accent-ink"
                  : "bg-brand-soft text-brand"
              }`}
            >
              {fullAccess ? "Speakers' Circle" : "Front Row"}
            </span>
          )}
        </div>

        {/* ---------- Where you left off ---------- */}
        {!progressLoading && (
          <div className="mb-6 grid gap-6 rounded-3xl border border-line bg-white p-7 shadow-card sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            {next ? (
              <>
                <div>
                  <div className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {started ? "Where you left off" : "Start here"}
                  </div>
                  <h2 className="display text-[clamp(22px,2.8vw,32px)]">
                    Lesson {next.number}: {next.title}
                  </h2>
                  <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
                    {next.summary}
                  </p>
                  {signedIn && (
                    <Progress done={watched.length} total={openCount} />
                  )}
                </div>
                <Btn href={lessonHref(next)} variant="brand">
                  <Play className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
                  {started ? "Resume" : "Start the course"}
                </Btn>
              </>
            ) : (
              <>
                <div>
                  <div className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-accent-ink">
                    Every lesson watched
                  </div>
                  <h2 className="display text-[clamp(22px,2.8vw,32px)]">
                    {fullAccess
                      ? "Knowing it is the first half. Practise it."
                      : "You've finished the Front Row lessons."}
                  </h2>
                  <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
                    {fullAccess
                      ? `Bring a two-to-three-minute presentation to ${COACH_NAME} and put a rep in.`
                      : `Speakers' Circle opens the remaining ${course.lessons.length - FREE_PREVIEW_COUNT} lessons and coaching with ${COACH_NAME}.`}
                  </p>
                  <Progress done={watched.length} total={openCount} />
                </div>
                <Btn href={fullAccess ? "/topics" : "/pricing"} variant="brand">
                  {fullAccess ? (
                    <>
                      <Mic className="h-4 w-4" strokeWidth={2.5} />
                      Choose a topic
                    </>
                  ) : (
                    "See Speakers' Circle"
                  )}
                </Btn>
              </>
            )}
          </div>
        )}

        {/* ---------- Upgrade ---------- */}
        {signedIn && !fullAccess && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-3xl border-2 border-accent bg-accent-soft p-6 sm:p-7">
            <div className="max-w-[600px]">
              <h2 className="mb-1 text-[19px] font-bold tracking-tight">
                You have the first {FREE_PREVIEW_COUNT} lessons
              </h2>
              <p className="text-[14.5px] text-ink-soft">
                Speakers&apos; Circle opens all {course.lessons.length}, coaching
                with {COACH_NAME} on eighty practice topics, and the member
                community, for $10 CAD a month.
              </p>
            </div>
            <Link
              href={`/checkout?next=${encodeURIComponent("/courses")}`}
              className="rounded-full bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
            >
              Unlock every lesson
            </Link>
          </div>
        )}

        {/* ---------- The lessons ---------- */}
        <div className="overflow-hidden rounded-3xl border border-line bg-white">
          {course.lessons.map((lesson, i) => {
            const locked = signedIn && !fullAccess && i >= FREE_PREVIEW_COUNT;
            const done = signedIn && hasWatched(lesson.slug);
            const quiz = hasQuiz(lesson.slug);

            const row = (
              <>
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold ${
                    done
                      ? "bg-accent text-white"
                      : locked
                        ? "bg-paper-warm text-ink-soft"
                        : "bg-brand-soft text-brand"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : lesson.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15.5px] font-semibold">
                    {lesson.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      {lesson.video ? (
                        <>
                          <Play className="h-3 w-3" strokeWidth={2.5} />
                          Video
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3" strokeWidth={2.5} />
                          Notes only
                        </>
                      )}
                    </span>
                    {quiz && (
                      <span
                        className={
                          signedIn && hasPassed(lesson.slug)
                            ? "inline-flex items-center gap-1.5 font-semibold text-accent-ink"
                            : "inline-flex items-center gap-1.5"
                        }
                      >
                        {signedIn && hasPassed(lesson.slug) && (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        )}
                        Quiz
                      </span>
                    )}
                    {lesson.practice && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mic className="h-3 w-3" strokeWidth={2.5} />
                        {COACH_NAME}
                      </span>
                    )}
                  </span>
                </span>
              </>
            );

            if (locked) {
              return (
                <div
                  key={lesson.slug}
                  className="flex items-center gap-4 border-b border-line px-5 py-4 opacity-60 last:border-0 sm:px-6"
                >
                  {row}
                  <span className="flex flex-shrink-0 items-center gap-1.5 text-[13px] text-ink-soft">
                    <Lock className="h-3.5 w-3.5" strokeWidth={2.25} />
                    Locked
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={lesson.slug}
                href={lessonHref(lesson)}
                className="flex items-center gap-4 border-b border-line px-5 py-4 transition last:border-0 hover:bg-paper-soft sm:px-6"
              >
                {row}
                <span className="flex-shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white">
                  {done ? "Again" : "Start"}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ---------- Campus Voice ---------- */}
        <div
          id="campus-voice"
          className="mt-6 scroll-mt-24 rounded-3xl border border-line bg-paper-soft p-6 sm:p-7"
        >
          <div className="mb-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            {campus.audience} · in development
          </div>
          <h2 className="mb-1.5 text-[19px] font-bold tracking-tight">
            {campus.name}
          </h2>
          <p className="max-w-[640px] text-[14.5px] leading-relaxed text-ink-soft">
            {campus.blurb} Ten lessons are outlined; none are recorded yet, so
            there is nothing to open. It will appear here when it is real.
          </p>
        </div>
      </Wrap>
    </Section>
  );
}

function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="mt-5 flex items-center gap-3 text-[13px] text-ink-soft">
      <span className="h-1.5 w-40 overflow-hidden rounded-full bg-paper-warm">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }}
        />
      </span>
      {done} of {total} watched
    </div>
  );
}
