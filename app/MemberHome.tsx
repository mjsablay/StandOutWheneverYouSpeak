"use client";

/**
 * The home page for anyone who is through the door: free (Front Row),
 * paid (Speakers' Circle), or admin.
 *
 * The course is the page. What came before opened with a "Continue learning"
 * card hard-coded to `lessons[0]`, so it said "Start lesson: Be Remarkable"
 * forever — to a member on lesson nine as much as to one who had just
 * arrived — under a progress bar that measured how many lessons their tier
 * *unlocked* rather than how many they had done, so it never moved either.
 * Then four equal cards gave Events and the Leaderboard the same weight as
 * the thing they came for.
 *
 * Now: where you actually are, the lessons immediately ahead of you, and
 * everything else in one line at the bottom.
 *
 * It deliberately stops short of the full syllabus. /courses is the course
 * itself (app/courses/CourseScreen.tsx) and lists all fifteen lessons with
 * the same per-row state; repeating that here made "Course page →" lead to
 * a screen the member had just read. Home answers "where am I and what is
 * next"; the course page answers "what is the whole thing".
 */

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Lock,
  Play,
  Shield,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Wrap, Section, Eyebrow, Btn } from "@/components/ui";
import { hasQuiz } from "@/components/Quiz";
import { COURSES, FREE_PREVIEW_COUNT, type Course, type Lesson } from "@/lib/courses";
import { COACH_NAME } from "@/lib/site";
import { useProgress } from "@/lib/progress";
import { useUpcomingEvents } from "@/lib/use-events";
import { dateParts } from "@/lib/events";

const LEADERSHIP = COURSES[0];
const CAMPUS = COURSES[1];

/** A lesson is real when Barry has supplied something to open. */
const hasContent = (l: Lesson) => Boolean(l.video) || Boolean(l.materials?.length);

type State = "done" | "quiz-due" | "next" | "open" | "locked" | "soon";

const STATE_LABEL: Record<State, string> = {
  done: "Complete",
  "quiz-due": "Quiz to go",
  next: "Next up",
  open: "",
  locked: "Speakers' Circle",
  soon: "Coming soon",
};

/* ---------------------------------------------------------------- */

function LessonRow({
  course,
  lesson,
  state,
}: {
  course: Course;
  lesson: Lesson;
  state: State;
}) {
  const href =
    state === "locked"
      ? "/pricing"
      : `/courses/${course.slug}/lessons/${lesson.slug}`;

  const tone =
    state === "done"
      ? { pill: "bg-accent-soft text-accent-ink", text: "text-accent-ink" }
      : state === "next" || state === "quiz-due"
        ? { pill: "bg-brand-soft text-brand", text: "text-brand" }
        : { pill: "bg-paper-warm text-ink-soft", text: "text-ink-soft" };

  const icon =
    state === "done" ? (
      <CheckCircle2 className="h-[18px] w-[18px] text-accent" strokeWidth={2.5} />
    ) : state === "locked" ? (
      <Lock className="h-[15px] w-[15px] text-ink-soft" strokeWidth={2.5} />
    ) : state === "next" || state === "quiz-due" ? (
      <span className="flex h-[18px] w-[18px] items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-brand" />
      </span>
    ) : (
      <Circle className="h-[18px] w-[18px] text-line" strokeWidth={2.5} />
    );

  const row = (
    <>
      <span className="mt-0.5 flex w-[18px] shrink-0 justify-center sm:mt-0">{icon}</span>
      <span className="mt-[1px] w-[42px] shrink-0 text-[12.5px] font-bold tabular-nums text-ink-soft sm:mt-0">
        {lesson.number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold leading-snug">{lesson.title}</span>
        {/* Narrow screens have no room for the pill beside a wrapped title. */}
        {STATE_LABEL[state] && (
          <span className={`mt-0.5 block text-[12px] font-bold sm:hidden ${tone.text}`}>
            {STATE_LABEL[state]}
          </span>
        )}
      </span>
      {STATE_LABEL[state] && (
        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold sm:inline-flex ${tone.pill}`}
        >
          {STATE_LABEL[state]}
        </span>
      )}
      <ChevronRight
        className={`mt-0.5 h-4 w-4 shrink-0 sm:mt-0 ${state === "soon" ? "text-transparent" : "text-ink-soft"}`}
        strokeWidth={2.5}
      />
    </>
  );

  const shell =
    "flex items-start gap-3.5 border-b border-line px-5 py-3.5 last:border-0 sm:items-center sm:px-6";

  if (state === "soon") {
    return <div className={`${shell} opacity-55`}>{row}</div>;
  }

  return (
    <Link href={href} className={`${shell} transition hover:bg-paper-soft`}>
      {row}
    </Link>
  );
}

/* ---------------------------------------------------------------- */

function Tile({
  href,
  icon: Icon,
  label,
  note,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-2xl border border-line bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-bold">{label}</span>
        <span className="block truncate text-[13px] text-ink-soft">{note}</span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-ink-soft transition group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
    </Link>
  );
}

/* ---------------------------------------------------------------- */

export default function MemberHome({
  name,
  paid,
  admin,
}: {
  name: string;
  paid: boolean;
  admin: boolean;
}) {
  const { hasWatched, hasPassed, loading } = useProgress(LEADERSHIP.slug);
  const { events: upcoming, loading: eventsLoading } = useUpcomingEvents(1);

  /* ---- Where the member actually is ---- */

  // Only lessons with something to open count towards anything. 07A2 and
  // 07A3–07A6 are in the blueprint but Barry hasn't sent the content, so
  // they are listed and marked, never counted or offered as "next".
  const real = LEADERSHIP.lessons.filter(hasContent);
  const open = real.filter(
    (l) => paid || LEADERSHIP.lessons.indexOf(l) < FREE_PREVIEW_COUNT,
  );

  const finished = (l: Lesson) => hasWatched(l.slug) && (!hasQuiz(l.slug) || hasPassed(l.slug));

  const watchedCount = open.filter((l) => hasWatched(l.slug)).length;
  const passedCount = open.filter((l) => hasQuiz(l.slug) && hasPassed(l.slug)).length;
  const quizCount = open.filter((l) => hasQuiz(l.slug)).length;

  const next = open.find((l) => !finished(l)) ?? null;
  const done = next === null;
  const started = watchedCount > 0;
  // Watched it but the quiz still gates the next lesson.
  const quizDue = next !== null && hasWatched(next.slug);

  const pct = open.length === 0 ? 0 : Math.round((watchedCount / open.length) * 100);

  const stateOf = (l: Lesson): State => {
    if (!hasContent(l)) return "soon";
    if (!paid && LEADERSHIP.lessons.indexOf(l) >= FREE_PREVIEW_COUNT) return "locked";
    if (finished(l)) return "done";
    if (next && l.slug === next.slug) return quizDue ? "quiz-due" : "next";
    return "open";
  };

  // The current lesson and the three after it. The rest of the syllabus is
  // one link away on /courses, which exists to show all of it.
  const ahead = open.filter((l) => !finished(l)).slice(0, 4);

  const nextHref = next
    ? `/courses/${LEADERSHIP.slug}/lessons/${next.slug}${quizDue ? "/quiz" : ""}`
    : `/courses/${LEADERSHIP.slug}`;

  return (
    <Section className="pt-12 sm:pt-16">
      <Wrap>
        {/* ---------- Greeting ---------- */}
        <div className="mb-8">
          <Eyebrow>{admin ? "Administrator" : paid ? "Speakers' Circle" : "Front Row"}</Eyebrow>
          <h1 className="display text-[clamp(30px,4.2vw,46px)]">
            Welcome back, {name.split(" ")[0]}.
          </h1>
        </div>

        {/* ---------- Where you are ---------- */}
        {loading ? (
          <div className="mb-10 h-[196px] animate-pulse rounded-3xl bg-paper-soft" />
        ) : (
          <div className="mb-10 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="grid gap-7 p-7 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="min-w-0">
                <div className="mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  {done
                    ? `You've finished · ${LEADERSHIP.name}`
                    : started
                      ? `Continue · ${LEADERSHIP.name}`
                      : `Start here · ${LEADERSHIP.name}`}
                </div>

                {done ? (
                  <>
                    <h2 className="display text-[clamp(23px,2.8vw,32px)]">
                      Every lesson open to you is done.
                    </h2>
                    <p className="mt-2.5 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
                      {paid
                        ? `The course is behind you. The practice isn't — pick a topic and bring it to ${COACH_NAME}.`
                        : "You've watched all seven Front Row lessons. The rest of the course is in Speakers' Circle."}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="display text-[clamp(23px,2.8vw,32px)]">
                      Lesson {next!.number}: {next!.title}
                    </h2>
                    <p className="mt-2.5 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
                      {quizDue
                        ? "You've watched this one. Pass its quiz to open the next lesson."
                        : next!.summary}
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {done ? (
                  <Btn href={paid ? "/topics" : "/pricing"} variant="brand">
                    {paid ? "Choose a practice topic" : "See Speakers' Circle"}
                  </Btn>
                ) : (
                  <Btn href={nextHref} variant="brand">
                    {quizDue ? (
                      "Take the quiz"
                    ) : (
                      <>
                        <Play className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
                        {started ? "Resume lesson" : "Start lesson"}
                      </>
                    )}
                  </Btn>
                )}
              </div>
            </div>

            {/* Real progress, in the only units that mean anything */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-line bg-paper-soft px-7 py-4 text-[13.5px] text-ink-soft sm:px-8">
              <span className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span>
                <strong className="text-ink">
                  {watchedCount} of {open.length}
                </strong>{" "}
                lessons watched
              </span>
              {quizCount > 0 && (
                <span>
                  <strong className="text-ink">
                    {passedCount} of {quizCount}
                  </strong>{" "}
                  quizzes passed
                </span>
              )}
              {!paid && (
                <span>
                  <strong className="text-ink">{real.length - open.length} more</strong>{" "}
                  in Speakers&apos; Circle
                </span>
              )}
            </div>
          </div>
        )}

        {/* ---------- The lessons immediately ahead ---------- */}
        {ahead.length > 0 && (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="display text-[clamp(24px,3vw,34px)]">
                  Up next in {LEADERSHIP.name}
                </h2>
                <p className="mt-1.5 text-[15px] text-ink-soft">{LEADERSHIP.blurb}</p>
              </div>
              <Link
                href="/courses"
                className="text-[14px] font-semibold text-brand hover:underline"
              >
                All {LEADERSHIP.lessons.length} lessons →
              </Link>
            </div>

            <div className="mb-10 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
              {ahead.map((l) => (
                <LessonRow key={l.slug} course={LEADERSHIP} lesson={l} state={stateOf(l)} />
              ))}
            </div>
          </>
        )}

        {/* ---------- Upgrade, once they've seen what's locked ---------- */}
        {!paid && !admin && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-brand p-7 text-white sm:p-8">
            <div className="max-w-[560px]">
              <h3 className="display mb-2 text-[24px]">
                {real.length - open.length} more lessons, and {COACH_NAME}.
              </h3>
              <p className="text-[15px] leading-relaxed text-white/80">
                Speakers&apos; Circle opens the rest of Leadership Voice, eighty practice
                topics with coaching from {COACH_NAME}, the member community and every
                live workshop — $10 CAD a month.
              </p>
            </div>
            <Btn href="/pricing" variant="accent">
              See what&apos;s included
            </Btn>
          </div>
        )}

        {/* ---------- Practice, for members who have it ---------- */}
        {paid && (
          <div className="mb-10 grid gap-7 rounded-3xl border border-accent bg-accent-soft p-7 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-accent-ink">
                Speakers&apos; Circle practice
              </div>
              <h3 className="display text-[clamp(22px,2.6vw,30px)]">
                Knowing it isn&apos;t the same as being able to do it.
              </h3>
              <ul className="mt-4 grid gap-2 text-[14.5px] sm:grid-cols-2">
                {[
                  "Eighty topics, each with four prompts",
                  "A workspace for your Frame and Masterful Notes",
                  `${COACH_NAME} coaches your Frame or your Notes`,
                  "One strength, one improvement, then you go again",
                ].map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check
                      className="mt-0.5 h-[17px] w-[17px] shrink-0 text-accent-ink"
                      strokeWidth={2.5}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Btn href="/topics" variant="brand">
              Choose a topic
            </Btn>
          </div>
        )}

        {/* ---------- Campus Voice ---------- */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-paper-soft px-7 py-6">
          <div className="max-w-[620px]">
            <div className="mb-1 flex flex-wrap items-center gap-2.5">
              <h3 className="text-[19px] font-bold tracking-tight">{CAMPUS.name}</h3>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand">
                Coming soon
              </span>
            </div>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              {CAMPUS.lessons.length} lessons for students. {CAMPUS.blurb}
            </p>
          </div>
          <Link
            href="/courses#campus-voice"
            className="text-[14px] font-semibold text-brand hover:underline"
          >
            See the outline →
          </Link>
        </div>

        {/* ---------- Everything else ---------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Tile
            href="/events"
            icon={CalendarDays}
            label="Events"
            note={
              eventsLoading
                ? "Checking the calendar…"
                : upcoming.length > 0
                  ? `${dateParts(upcoming[0].starts_at).month} ${dateParts(upcoming[0].starts_at).day} · ${upcoming[0].title}`
                  : "Nothing scheduled yet"
            }
          />
          <Tile
            href={paid ? "/community" : "/pricing"}
            icon={Users}
            label="Community"
            note={paid ? "Find a practice partner" : "Opens with Speakers' Circle"}
          />
          <Tile
            href="/leaderboard"
            icon={Trophy}
            label="Leaderboard"
            note="Where you stand this month"
          />
          {admin && (
            <Tile
              href="/admin"
              icon={Shield}
              label="Admin console"
              note="Requests, members and events"
            />
          )}
        </div>
      </Wrap>
    </Section>
  );
}
