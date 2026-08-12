"use client";

import Link from "next/link";
import { Wrap, Section, SectionHead, Btn } from "@/components/ui";
import LogoMarquee from "@/components/LogoMarquee";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { COURSES, FREE_PREVIEW_COUNT } from "@/lib/courses";
import { UPCOMING_EVENTS, FAQS, PRELAUNCH } from "@/lib/site";

/* ============================ shared bits ============================ */

function Card({
  href,
  icon,
  title,
  body,
  cta,
  accent,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,24,31,.08)] ${
        accent ? "border-accent" : "border-line"
      }`}
    >
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="mb-1 text-[17px] font-bold">{title}</h3>
      <p className="text-[13.5px] text-ink-soft">{body}</p>
      <div className="mt-3 text-[13px] font-bold text-brand">{cta} →</div>
    </Link>
  );
}

function Greeting({ name, sub }: { name: string; sub: string }) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="mb-8">
      <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
        {part}, {name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-[17px] text-ink-soft">{sub}</p>
    </div>
  );
}

/* ============================ visitor ============================ */

function VisitorHome() {
  return (
    <>
      <header className="py-20 text-center sm:py-24">
        <Wrap>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-4 py-1.5 text-[13px] font-bold text-accent-ink">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Now accepting founding members
          </span>
          <h1 className="mx-auto mb-6 max-w-[760px] text-[clamp(40px,6vw,64px)] font-extrabold leading-[1.06] tracking-[-0.03em]">
            Stand out whenever you speak.
          </h1>
          <p className="mx-auto mb-4 max-w-[580px] text-[19px] text-ink-soft">
            Around three in four people fear public speaking. Learn the
            structure, practice with an AI coach and real peers, and perform
            when it counts.
          </p>
          <p className="mx-auto mb-9 max-w-[560px] text-[13.5px] text-ink-soft">
            <a
              href="https://nationalsocialanxietycenter.com/social-anxiety/public-speaking-anxiety/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              National Social Anxiety Center
            </a>{" "}
            — about 75% report some fear of public speaking.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Btn href="/signup" variant="accent" className="px-7 py-3.5 text-base">
              Request your place
            </Btn>
            <Btn
              href={PRELAUNCH ? "/about" : "/courses"}
              variant="ghost"
              className="px-7 py-3.5 text-base"
            >
              {PRELAUNCH ? "Meet the coaches →" : "See what's inside →"}
            </Btn>
          </div>
          <p className="mt-4 text-[13.5px] text-ink-soft">
            Free to request. We&apos;re approving members in small groups so
            every cohort gets proper attention.
          </p>
        </Wrap>
      </header>

      <LogoMarquee />

      <Section alt>
        <Wrap>
          <SectionHead
            title="One loop. Every rep compounds."
            sub="Speaking well isn't a talent — it's a cycle. What you learn shapes how you practice, and every practice changes how you perform."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["Learn", "Short, focused lessons on structure, delivery, and staying on message — built from a decade of coaching 3,000+ speakers."],
              ["Practice", "Rehearse with an AI speaking coach that pushes back, throws curveballs, and gives feedback — then practice live with peers."],
              ["Perform", "Walk into the classroom, boardroom, or interview having already been there — and earn points every step of the way."],
            ].map(([title, body], i) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-8">
                <div className="mb-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-soft text-[15px] font-bold text-brand">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-xl font-bold">{title}</h3>
                <p className="text-[15px] text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <div className="rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-10">
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight">
              Ready to be remembered?
            </h2>
            <p className="mx-auto mb-7 mt-3 max-w-[520px] text-[17px] text-[#cddcf0]">
              Request your place today. We review every request and approve
              members in small groups — you&apos;ll hear from us by email.
            </p>
            <Btn href="/signup" variant="accent" className="px-7 py-3.5 text-base">
              Request your place
            </Btn>
          </div>
        </Wrap>
      </Section>

      <Section alt>
        <Wrap>
          <SectionHead title="Frequently asked questions." center />
          <div className="mx-auto max-w-[760px]">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-2xl font-normal leading-none text-brand group-open:hidden">+</span>
                  <span className="hidden text-2xl font-normal leading-none text-brand group-open:inline">–</span>
                </summary>
                <p className="pb-6 text-[15.5px] text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </Wrap>
      </Section>
    </>
  );
}

/* ============================ pending ============================ */

function PendingHome({ name }: { name: string }) {
  return (
    <Section>
      <Wrap className="max-w-[720px]">
        <Greeting
          name={name}
          sub="Your request is with us — we approve members in small groups."
        />
        <div className="mb-6 rounded-2xl border-2 border-accent bg-accent-soft p-7">
          <div className="mb-2 text-3xl"></div>
          <h2 className="mb-1.5 text-xl font-extrabold">You&apos;re on the waitlist</h2>
          <p className="text-[15px] text-ink-soft">
            We&apos;ll email you the moment your place is ready. Nothing else to
            do for now.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRELAUNCH ? (
            <>
              <Card
                href="/about"
                icon=""
                title="Meet the coaches"
                body="Barry has taught over 3,000 people to speak with impact."
                cta="Read more"
              />
              <Card
                href="/contact"
                icon=""
                title="Have a question?"
                body="Ask us anything about the programme before you start."
                cta="Get in touch"
              />
            </>
          ) : (
            <>
              <Card href="/courses" icon="" title="Preview the courses" body="See every lesson you'll get access to." cta="Browse" />
              <Card href="/events" icon="" title="Free open houses" body="Some events are open to everyone." cta="See events" />
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

  return (
    <Section>
      <Wrap>
        <Greeting
          name={name}
          sub={
            paid
              ? "Pick up where you left off, or put in a rep with the coach."
              : "You have the first six lessons of Leadership Voice — let's use them."
          }
        />

        {/* Continue learning */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-5 p-7">
            <div>
              <div className="mb-1.5 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
                Continue learning
              </div>
              <h2 className="text-[22px] font-extrabold tracking-tight">
                {course.name}
              </h2>
              <p className="mt-1 text-[14.5px] text-ink-soft">
                Next up: {nextLesson.title} · {openLessons} of{" "}
                {course.lessons.length} lessons unlocked
              </p>
            </div>
            <Link
              href={`/courses/${course.slug}/lessons/${nextLesson.slug}`}
              className="rounded-lg bg-brand px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-dark"
            >
              Start lesson
            </Link>
          </div>
          <div className="h-1.5 w-full bg-paper-warm">
            <div
              className="h-full bg-accent"
              style={{ width: `${(openLessons / course.lessons.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            href={`/courses/${course.slug}/lessons/${nextLesson.slug}/practice`}
            icon=""
            title="Practice"
            body="Run a coaching session against Barry's rubric."
            cta="Start a rep"
            accent
          />
          <Card
            href={paid ? "/community" : "/pricing"}
            icon=""
            title="Community"
            body={paid ? "Find a practice partner this week." : "Unlock peer practice with Speakers' Circle."}
            cta={paid ? "Meet members" : "See pricing"}
          />
          <Card href="/events" icon="" title="Events" body="Live workshops and practice nights." cta="What's on" />
          <Card href="/leaderboard" icon="" title="Leaderboard" body="See where you stand this month." cta="View ranks" />
        </div>

        {/* Admin shortcut */}
        {admin && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink bg-ink p-6 text-white">
            <div>
              <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-white/70">
                Administrator
              </div>
              <p className="text-[15.5px]">
                Review waitlist requests, meeting bookings, and member access.
              </p>
            </div>
            <Link
              href="/admin"
              className="rounded-lg bg-white px-5 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-white/90"
            >
              Open admin console
            </Link>
          </div>
        )}

        {/* Upgrade nudge for free members */}
        {!paid && !admin && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border-2 border-accent bg-accent-soft p-7">
            <div className="max-w-[560px]">
              <h3 className="mb-1.5 text-lg font-extrabold">
                Unlock the rest of the course
              </h3>
              <p className="text-[14.5px] text-ink-soft">
                Speakers&apos; Circle opens every lesson, unlimited AI practice,
                the member community, and all live workshops — $10 CAD/month.
              </p>
            </div>
            <Link
              href="/pricing"
              className="rounded-lg bg-brand px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-dark"
            >
              See what&apos;s included
            </Link>
          </div>
        )}

        {/* Next event */}
        <div className="rounded-2xl border border-line bg-white p-7">
          <div className="mb-4 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
            Coming up
          </div>
          {UPCOMING_EVENTS.slice(0, 2).map((e) => (
            <div
              key={e.title}
              className="flex flex-wrap items-center gap-5 border-b border-line py-3.5 last:border-0"
            >
              <div className="min-w-[58px] rounded-lg bg-brand-soft px-2 py-2 text-center text-brand">
                <span className="block text-[11px] font-bold uppercase">{e.month}</span>
                <span className="block text-xl font-extrabold leading-tight">{e.day}</span>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-[15.5px] font-semibold">{e.title}</div>
                <div className="text-[13.5px] text-ink-soft">{e.details}</div>
              </div>
              <Link
                href="/events"
                className="text-[14px] font-semibold text-brand hover:underline"
              >
                Details
              </Link>
            </div>
          ))}
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
