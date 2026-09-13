"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wrap, Section, SectionHead, Eyebrow, Btn, Check, Avatar } from "@/components/ui";
import LogoMarquee from "@/components/LogoMarquee";
import VideoPlayer from "@/components/VideoPlayer";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  MessageCircle,
  Mic,
  Play,
  Quote,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { COURSES, FREE_PREVIEW_COUNT, RUBRIC_MAX, SCORED_RUBRIC, videoUrl } from "@/lib/courses";
import { TOPIC_COUNT } from "@/lib/topics";
import { FAQS, PRELAUNCH, COACH_NAME } from "@/lib/site";
import { useUpcomingEvents } from "@/lib/use-events";
import { dateParts, timeLabel } from "@/lib/events";

/** Barry's headshot, in the public avatars bucket. Shown in the hero and the founder band. */
const FOUNDER_PHOTO =
  "https://rnkihywxdvhpefgxuzeg.supabase.co/storage/v1/object/public/avatars/founders/barry-kuntz-2026.jpg";

/* ============================ shared bits ============================ */

function Card({
  href,
  icon: Icon,
  title,
  body,
  cta,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-3xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lift ${
        accent ? "border-accent" : "border-line"
      }`}
    >
      <span
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${
          accent ? "bg-accent-soft text-accent-ink" : "bg-brand-soft text-brand"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <h3 className="mb-1 text-[17px] font-bold">{title}</h3>
      <p className="text-[14px] leading-relaxed text-ink-soft">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.5} />
      </span>
    </Link>
  );
}

function Greeting({
  name,
  sub,
  tag,
}: {
  name: string;
  sub: string;
  tag?: string;
}) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="mb-10">
      {tag && <Eyebrow>{tag}</Eyebrow>}
      <h1 className="display text-[clamp(32px,4.6vw,52px)]">
        {part}, {name.split(" ")[0]}.
      </h1>
      <p className="mt-3 text-[18px] text-ink-soft">{sub}</p>
    </div>
  );
}

/**
 * A still of a coaching session — the product, drawn in HTML rather than
 * screenshotted, so it stays true as the real thing changes. Scores use the
 * real rubric: three audible categories, fifteen points.
 */
function CoachMock({ compact = false }: { compact?: boolean }) {
  const scores: Record<string, number> = { structure: 5, delivery: 4, "on-message": 4 };
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return (
    <div
      className={`rounded-3xl border border-line bg-white shadow-card ${compact ? "p-5" : "p-6 sm:p-7"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar initials="K" size={30} variant="dark" />
          <div>
            <div className="text-[13.5px] font-bold leading-tight">{COACH_NAME}</div>
            <div className="text-[11.5px] text-ink-soft">Speak with Impact coach</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Listening
        </span>
      </div>

      <div className="space-y-2.5">
        <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-paper-soft px-4 py-2.5 text-[13.5px] leading-snug">
          Headline first. What&apos;s the one thing you want the room to walk away with?
        </p>
        <p className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-[13.5px] leading-snug text-white">
          The Q3 number is down — and that&apos;s the best news we&apos;ve had all year.
        </p>
      </div>

      <div className="my-4 flex h-8 items-end justify-center gap-1" aria-hidden>
        {[14, 24, 18, 30, 22, 12, 26, 20, 16, 28, 18, 10].map((h, i) => (
          <span
            key={i}
            className="wave-bar w-1.5 rounded-full bg-brand"
            style={{ height: h, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-paper-soft p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-ink-soft">
            Last session
          </span>
          <span className="text-[13px] font-bold">
            {total}
            <span className="text-ink-soft">/{RUBRIC_MAX}</span>
            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-ink">
              Very Good
            </span>
          </span>
        </div>
        <div className="space-y-2">
          {SCORED_RUBRIC.map((c) => (
            <div key={c.id} className="flex items-center gap-3 text-[12.5px]">
              <span className="w-[150px] shrink-0 truncate font-medium">{c.name}</span>
              <span className="flex flex-1 gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`h-1.5 flex-1 rounded-full ${n <= (scores[c.id] ?? 0) ? "bg-brand" : "bg-line"}`}
                  />
                ))}
              </span>
              <span className="w-4 text-right font-bold text-ink-soft">{scores[c.id]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The free first lesson, playable from the home page. The recording lives in
 * the public lesson-videos bucket, so a visitor can watch it without an
 * account — that is the point of a free first lesson.
 */
function LessonPreviewTile({ lesson }: { lesson: (typeof COURSES)[0]["lessons"][0] }) {
  const [open, setOpen] = useState(false);
  const src = videoUrl(lesson.video);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative overflow-hidden rounded-3xl border border-line bg-ink text-left shadow-card"
        aria-label={`Watch lesson ${lesson.number}: ${lesson.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FOUNDER_PHOTO}
          alt=""
          className="aspect-[4/3] w-full object-cover object-[50%_28%] opacity-90 transition group-hover:scale-[1.02]"
        />
        <span className="absolute left-1/2 top-[38%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-lift transition group-hover:scale-105">
          <Play className="ml-0.5 h-5 w-5" strokeWidth={2.5} fill="currentColor" />
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5 text-white">
          <span className="block text-[11.5px] font-bold uppercase tracking-wider text-white/70">
            Watch the first lesson · free · 2 min
          </span>
          <span className="block text-[17px] font-bold">
            Lesson {lesson.number}: {lesson.title}
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={lesson.title}
        >
          <div className="w-full max-w-[960px]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between text-white">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-white/70">
                  Lesson {lesson.number} · Leadership Voice
                </div>
                <div className="text-[18px] font-bold">{lesson.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 p-2 transition hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <VideoPlayer src={src} title={lesson.title} autoPlay />
            <p className="mt-4 text-center text-[14px] text-white/80">
              Liked it? The next five are free too.{" "}
              <Link href="/request" className="font-semibold text-white underline underline-offset-2">
                Request your place
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================ visitor ============================ */

function VisitorHome() {
  const leadership = COURSES[0];

  return (
    <>
      {/* Hero */}
      <header className="hero-glow relative overflow-hidden pb-10 pt-20 sm:pt-28">
        <Wrap className="text-center">
          <Eyebrow>
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Now accepting founding members
          </Eyebrow>
          <h1 className="display mx-auto mb-6 max-w-[860px] text-[clamp(46px,7.4vw,86px)]">
            Stand out whenever you speak.
          </h1>
          <p className="mx-auto mb-9 max-w-[560px] text-[19px] leading-relaxed text-ink-soft">
            Learn Barry Kuntz&apos;s method, practise with {COACH_NAME}, and
            perform when it counts.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Btn href="/request" variant="brand" className="px-7 py-3.5 text-[16px]">
              Request your place
            </Btn>
            <Btn
              href={PRELAUNCH ? "/about" : "/courses"}
              variant="white"
              className="px-7 py-3.5 text-[16px]"
            >
              {PRELAUNCH ? "Meet the coaches" : "See what's inside"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Btn>
          </div>
          <p className="mt-5 text-[13.5px] text-ink-soft">
            Free to request. Members are approved in small groups so every
            cohort gets proper attention.
          </p>
        </Wrap>

        {/* Three things that are true: the free first lesson, playable; how
            Katya coaches, in Barry's own loop; what Front Row includes. */}
        <Wrap className="mt-16">
          <div className="grid gap-4 md:grid-cols-3">
            <LessonPreviewTile lesson={leadership.lessons[0]} />

            <div className="flex flex-col rounded-3xl border border-line bg-white p-6 text-left shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar initials="K" size={30} variant="dark" />
                  <div>
                    <div className="text-[13.5px] font-bold leading-tight">{COACH_NAME}</div>
                    <div className="text-[11.5px] text-ink-soft">Your AI practice coach</div>
                  </div>
                </div>
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                  Lesson 5B
                </span>
              </div>
              <p className="mb-4 text-[14px] leading-relaxed text-ink-soft">
                You meet her with your 60-second self-introduction. Then the loop
                Barry teaches:
              </p>
              <ol className="mb-5 space-y-2">
                {["Deliver", "Feedback", "Retry", "Improve"].map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-[14.5px]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11.5px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="font-semibold">{step}</span>
                    {i === 1 && (
                      <span className="text-[12.5px] text-ink-soft">
                        one strength, two things to fix
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-auto text-[12.5px] text-ink-soft">
                Scored on structure, delivery and staying on message — out of {RUBRIC_MAX}.
              </p>
            </div>

            <div className="flex flex-col rounded-3xl border border-line bg-paper-soft p-6 text-left shadow-card">
              <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wider text-ink-soft">
                Front Row · free
              </div>
              <div className="display mb-4 text-[26px]">The first six lessons, and {COACH_NAME}.</div>
              <ul className="mb-5 space-y-2 text-[14px]">
                {leadership.lessons.slice(0, FREE_PREVIEW_COUNT).map((l) => (
                  <li key={l.slug} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    <span className="font-medium">{l.title}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto text-[12.5px] text-ink-soft">
                Speakers&apos; Circle adds every lesson, {TOPIC_COUNT} practice topics, and live workshops.
              </p>
            </div>
          </div>
        </Wrap>
      </header>

      <LogoMarquee />

      {/* The method */}
      <Section>
        <Wrap>
          <SectionHead
            center
            eyebrow="The method"
            title="One loop. Every rep compounds."
            sub="Speaking well isn't a talent — it's a cycle. What you learn shapes how you practise, and every practice changes how you perform."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [BookOpen, "Learn", "Short, focused lessons on structure, delivery and staying on message — built from 17 years of coaching 3,500+ leaders."],
              [Mic, "Practise", `Bring a two-minute piece to ${COACH_NAME}. She listens, pushes back like a real audience, and scores you against Barry's rubric.`],
              [Trophy, "Perform", "Walk into the boardroom, the classroom or the interview having already been there — and earn points every step of the way."],
            ].map(([Icon, title, body]) => {
              const I = Icon as LucideIcon;
              return (
                <div key={title as string} className="rounded-3xl border border-line bg-white p-8 shadow-card">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <I className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mb-2 text-[21px] font-bold">{title as string}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-soft">{body as string}</p>
                </div>
              );
            })}
          </div>
        </Wrap>
      </Section>

      {/* Katya */}
      <Section alt>
        <Wrap>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <Eyebrow>{COACH_NAME}, your AI coach</Eyebrow>
              <h2 className="display mb-5 text-[clamp(32px,4.6vw,52px)]">
                A coach who listens, pushes back, and scores you honestly.
              </h2>
              <p className="mb-6 text-[17px] leading-relaxed text-ink-soft">
                You meet {COACH_NAME}{" "}
                at the end of Lesson 5B with your 60-second self-introduction. In Speakers&apos; Circle you bring
                her a presentation on any of eighty topics, and she coaches you
                the way Barry would — one strength, then the two things to fix.
              </p>
              <ul className="mb-8 space-y-3 text-[15.5px]">
                {[
                  "Interrupts and questions like a real audience",
                  "Scores structure, delivery and staying on message out of 15",
                  "Remembers nothing you'd rather she didn't — every rep is a fresh start",
                ].map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check /> {f}
                  </li>
                ))}
              </ul>
              <Btn href="/request" variant="brand">
                Request your place
              </Btn>
            </div>
            <CoachMock />
          </div>
        </Wrap>
      </Section>

      {/* Courses */}
      <Section>
        <Wrap>
          <SectionHead
            center
            eyebrow="Courses"
            title="Two courses. One skill."
            sub="Being remembered for what you say — at work, or on campus."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {COURSES.map((c) => {
              const withVideo = c.lessons.filter((l) => l.video).length;
              return (
                <div
                  key={c.slug}
                  className={`relative overflow-hidden rounded-3xl border border-line p-8 shadow-card sm:p-10 ${
                    c.comingSoon ? "bg-paper-soft" : "bg-brand text-white"
                  }`}
                >
                  <div
                    className={`mb-4 text-[12.5px] font-bold uppercase tracking-[0.1em] ${
                      c.comingSoon ? "text-ink-soft" : "text-white/70"
                    }`}
                  >
                    {c.audience}
                  </div>
                  <h3 className="display mb-3 text-[32px]">{c.name}</h3>
                  <p
                    className={`mb-7 max-w-[420px] text-[15.5px] leading-relaxed ${
                      c.comingSoon ? "text-ink-soft" : "text-white/85"
                    }`}
                  >
                    {c.blurb}
                  </p>
                  <div
                    className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] font-medium ${
                      c.comingSoon ? "text-ink-soft" : "text-white/80"
                    }`}
                  >
                    <span>{c.lessons.length} lessons</span>
                    {withVideo > 0 && <span>{withVideo} with video</span>}
                    <span>{c.level}</span>
                    {c.comingSoon && (
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand">
                        Coming soon
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Wrap>
      </Section>

      {/* Founder */}
      <Section alt className="py-16 sm:py-20">
        <Wrap>
          <div className="mx-auto flex max-w-[860px] flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
            <Avatar initials="BK" size={132} variant="dark" src={FOUNDER_PHOTO} alt="Barry Kuntz" position="50% 20%" />
            <div>
              <Quote className="mb-3 h-6 w-6 text-brand" strokeWidth={2} />
              <p className="display text-[clamp(22px,2.8vw,30px)] leading-[1.25] tracking-[-0.02em]">
                Speaking with impact is a skill you learn, not a talent you&apos;re born with.
              </p>
              <p className="mt-4 text-[14.5px] text-ink-soft">
                <strong className="text-ink">Barry Kuntz</strong> · Founder &amp; Head Coach ·{" "}
                <Link href="/about" className="font-semibold text-brand hover:underline">
                  Meet the founders
                </Link>
              </p>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* FAQ */}
      <Section>
        <Wrap>
          <SectionHead center eyebrow="Questions" title="Good to know before you ask." />
          <div className="mx-auto max-w-[800px] rounded-3xl border border-line bg-white px-6 shadow-card sm:px-8">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group border-b border-line last:border-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16.5px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-soft text-brand transition group-open:rotate-45">
                    <span className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <p className="pb-6 text-[15px] leading-relaxed text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* CTA */}
      <Section className="pt-0">
        <Wrap>
          <div className="relative overflow-hidden rounded-[32px] bg-brand px-6 py-16 text-center text-white sm:px-10 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
            />
            <h2 className="display relative text-[clamp(32px,4.6vw,52px)]">
              Ready to be remembered?
            </h2>
            <p className="relative mx-auto mb-8 mt-4 max-w-[520px] text-[17px] text-white/80">
              Request your place today. We read every request and approve
              members in small groups — you&apos;ll hear from us by email.
            </p>
            <Btn href="/request" variant="accent" className="relative px-7 py-3.5 text-[16px]">
              Request your place
            </Btn>
          </div>
        </Wrap>
      </Section>
    </>
  );
}

/* ============================ pending ============================ */

function PendingHome({ name }: { name: string }) {
  const steps = [
    ["Requested", "We have your request.", true],
    ["Reviewing", "Barry and Michael read every one.", false],
    ["Invited", "You'll get an email the moment your place is ready.", false],
  ] as const;

  return (
    <Section>
      <Wrap className="max-w-[760px]">
        <Greeting
          name={name}
          tag="Waitlist"
          sub="Your request is with us — members are approved in small groups."
        />

        <div className="mb-6 rounded-3xl border border-line bg-white p-7 shadow-card sm:p-8">
          <ol className="grid gap-5 sm:grid-cols-3">
            {steps.map(([title, body, done], i) => (
              <li key={title} className="flex gap-3">
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} />
                ) : i === 1 ? (
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-brand" />
                  </span>
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-line" strokeWidth={2.5} />
                )}
                <div>
                  <div className="text-[15px] font-bold">{title}</div>
                  <div className="text-[13.5px] text-ink-soft">{body}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {PRELAUNCH ? (
            <>
              <Card
                href="/about"
                icon={Users}
                title="Meet the coaches"
                body="Barry has coached more than 3,500 leaders to speak with impact."
                cta="Read more"
              />
              <Card
                href="/contact"
                icon={MessageCircle}
                title="Have a question?"
                body="Ask us anything about the programme before you start."
                cta="Get in touch"
              />
            </>
          ) : (
            <>
              <Card href="/courses" icon={BookOpen} title="Preview the courses" body="See every lesson you'll get access to." cta="Browse" />
              <Card href="/events" icon={CalendarDays} title="Free open houses" body="Some events are open to everyone." cta="See events" />
            </>
          )}
        </div>
      </Wrap>
    </Section>
  );
}

/* ============================ member ============================ */

function MemberHome({
  name,
  paid,
  admin,
}: {
  name: string;
  paid: boolean;
  admin: boolean;
}) {
  const course = COURSES[0];
  const nextLesson = course.lessons[0];
  const openLessons = paid ? course.lessons.length : FREE_PREVIEW_COUNT;
  const { events: upcoming, loading: eventsLoading } = useUpcomingEvents(2);

  return (
    <Section className="pt-14 sm:pt-20">
      <Wrap>
        <Greeting
          name={name}
          tag={admin ? "Administrator" : paid ? "Speakers' Circle" : "Front Row"}
          sub={
            paid
              ? `Pick up where you left off, or put in a rep with ${COACH_NAME}.`
              : "You have the first six lessons of Leadership Voice — let's use them."
          }
        />

        {/* Continue learning */}
        <div className="mb-5 grid gap-6 rounded-3xl border border-line bg-white p-7 shadow-card sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Continue learning · {course.name}
            </div>
            <h2 className="display text-[clamp(24px,3vw,34px)]">
              Lesson {nextLesson.number}: {nextLesson.title}
            </h2>
            <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
              {nextLesson.summary}
            </p>
            <div className="mt-5 flex items-center gap-3 text-[13px] text-ink-soft">
              <span className="h-1.5 w-40 overflow-hidden rounded-full bg-paper-warm">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${(openLessons / course.lessons.length) * 100}%` }}
                />
              </span>
              {openLessons} of {course.lessons.length} lessons unlocked
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Btn href={`/courses/${course.slug}/lessons/${nextLesson.slug}`} variant="brand">
              <Play className="h-4 w-4" strokeWidth={2.5} fill="currentColor" />
              Start lesson
            </Btn>
            <Btn href={`/courses/${course.slug}`} variant="white">
              All lessons
            </Btn>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            href={paid ? "/topics" : `/courses/${course.slug}/lessons/${nextLesson.slug}/practice`}
            icon={Mic}
            title="Practise"
            body={paid ? `Eighty topics. Frame one, make your notes, bring it to ${COACH_NAME}.` : `Run a coaching session with ${COACH_NAME} against Barry's rubric.`}
            cta={paid ? "Choose a topic" : "Start a rep"}
            accent
          />
          <Card
            href={paid ? "/community" : "/pricing"}
            icon={Users}
            title="Community"
            body={paid ? "Find a practice partner this week." : "Unlock peer practice with Speakers' Circle."}
            cta={paid ? "Meet members" : "See pricing"}
          />
          <Card href="/events" icon={CalendarDays} title="Events" body="Live workshops and practice nights." cta="What's on" />
          <Card href="/leaderboard" icon={Trophy} title="Leaderboard" body="See where you stand this month." cta="View ranks" />
        </div>

        {/* Admin shortcut */}
        {admin && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink p-6 text-white sm:p-7">
            <div>
              <div className="mb-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white/60">
                Administrator
              </div>
              <p className="text-[15.5px]">
                Requests to join, accounts, events, and the About page.
              </p>
            </div>
            <Btn href="/admin" variant="white">
              Open admin console
            </Btn>
          </div>
        )}

        {/* Upgrade nudge for free members */}
        {!paid && !admin && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-brand p-7 text-white sm:p-8">
            <div className="max-w-[560px]">
              <h3 className="display mb-2 text-[24px]">Unlock the rest of the course</h3>
              <p className="text-[15px] text-white/80">
                Speakers&apos; Circle opens every lesson, practice with {COACH_NAME},
                the member community, and all live workshops — $10 CAD/month.
              </p>
            </div>
            <Btn href="/pricing" variant="accent">
              See what&apos;s included
            </Btn>
          </div>
        )}

        {/* Next event */}
        <div className="rounded-3xl border border-line bg-white p-7 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Coming up
            </div>
            <Link href="/events" className="text-[13.5px] font-semibold text-brand hover:underline">
              All events
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-2 text-[14.5px] text-ink-soft">
              {eventsLoading
                ? "Checking the calendar…"
                : "Nothing scheduled yet — the first open house will be announced by email."}
            </p>
          ) : (
            upcoming.map((e) => {
              const { month, day } = dateParts(e.starts_at);
              return (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center gap-5 border-b border-line py-3.5 last:border-0"
                >
                  <div className="min-w-[58px] rounded-xl bg-brand-soft px-2 py-2 text-center text-brand">
                    <span className="block text-[11px] font-bold uppercase">{month}</span>
                    <span className="block text-xl font-extrabold leading-tight">{day}</span>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <div className="text-[15.5px] font-semibold">{e.title}</div>
                    <div className="text-[13.5px] text-ink-soft">
                      {[timeLabel(e.starts_at), e.details].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <Link href="/events" className="text-[14px] font-semibold text-brand hover:underline">
                    Details
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </Wrap>
    </Section>
  );
}

/* ============================ router ============================ */

export default function HomeScreens() {
  const { user } = useAuth();
  const { audience, loading } = useAccess();

  if (loading) return <div className="min-h-[70vh]" />;

  const name = user?.name || "there";

  switch (audience) {
    case "visitor":
      return <VisitorHome />;
    case "pending":
      return <PendingHome name={name} />;
    case "free":
      return <MemberHome name={name} paid={false} admin={false} />;
    case "circle":
      return <MemberHome name={name} paid admin={false} />;
    case "admin":
      return <MemberHome name={name} paid admin />;
  }
}
