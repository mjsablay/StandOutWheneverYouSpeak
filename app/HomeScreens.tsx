"use client";

import Link from "next/link";
import { useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import MemberHome from "@/app/MemberHome";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { COURSES, RUBRIC_MAX, SCORED_RUBRIC, videoUrl } from "@/lib/courses";
import { FAQS, PRELAUNCH, COACH_NAME } from "@/lib/site";

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
  return (
    <div className="mb-10">
      {tag && <Eyebrow>{tag}</Eyebrow>}
      <h1 className="display text-[clamp(32px,4.6vw,52px)]">
        Hello, {name.split(" ")[0]}.
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
 * The free first lesson, playable from the home page. The poster is the
 * recording's own title card (public/lesson-1-poster.jpg, a frame from the
 * file), and the recording streams from the public bucket, so a visitor can
 * watch it without an account — which is the point of a free first lesson.
 */
function LessonPreview({ lesson }: { lesson: (typeof COURSES)[0]["lessons"][0] }) {
  const [playing, setPlaying] = useState(false);
  const src = videoUrl(lesson.video);

  return (
    <figure className="mx-auto max-w-[960px]">
      <div className="overflow-hidden rounded-[28px] border border-line bg-ink shadow-lift">
        {playing ? (
          <VideoPlayer src={src} title={lesson.title} autoPlay />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative block w-full text-left"
            aria-label={`Play lesson ${lesson.number}: ${lesson.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lesson-1-poster.jpg"
              alt=""
              className="aspect-video w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-ink shadow-lift transition group-hover:scale-105">
                <Play className="ml-1 h-7 w-7" strokeWidth={2.5} fill="currentColor" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/85 to-transparent p-6 text-white">
              <span>
                <span className="block text-[11.5px] font-bold uppercase tracking-wider text-white/70">
                  Lesson {lesson.number} · {COURSES[0].name}
                </span>
                <span className="block text-[20px] font-bold">{lesson.title}</span>
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[12.5px] font-semibold backdrop-blur">
                Free · 1:55
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-4 text-center text-[14.5px] text-ink-soft">
        The first lesson of Leadership Voice, free to watch. Fourteen more,
        eighty practice topics and {COACH_NAME} are behind the door.
      </figcaption>
    </figure>
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

        {/* The product itself: the free first lesson, playable here. */}
        <Wrap className="mt-14">
          <LessonPreview lesson={leadership.lessons[0]} />
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
              [Mic, "Practise", `Bring a two-to-three-minute piece to ${COACH_NAME}. She names one strength, one thing to change, and has you try it again.`],
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
                A coach who listens, asks one question, and has you go again.
              </h2>
              <p className="mb-6 text-[17px] leading-relaxed text-ink-soft">
                You meet {COACH_NAME}{" "}
                at the end of Lesson 5B with your 60-second self-introduction. In Speakers&apos; Circle you bring
                her a presentation on any of eighty topics, and she coaches you
                the way Barry would — one strength, one priority improvement, then another attempt.
              </p>
              <ul className="mb-8 space-y-3 text-[15.5px]">
                {[
                  "Start where you need help: your Frame, your Masterful Notes, or your Delivery",
                  "One coaching idea per turn, so it lands before the next",
                  "Scores against Barry's rubric only when you ask, and never for what she can't reliably assess",
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
