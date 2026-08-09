import Link from "next/link";
import { Wrap, Section, SectionHead, Btn } from "@/components/ui";
import LogoMarquee from "@/components/LogoMarquee";
import { FAQS } from "@/lib/site";

const LOOP = [
  {
    n: 1,
    title: "Learn",
    body: "Short, focused lessons on structure, delivery, and staying on message — built from a decade of coaching 3,000+ speakers.",
  },
  {
    n: 2,
    title: "Practice",
    body: "Rehearse with an AI speaking coach that pushes back, throws curveballs, and gives feedback — then practice live with peers.",
  },
  {
    n: 3,
    title: "Perform",
    body: "Walk into the classroom, boardroom, or interview having already been there — and earn points every step of the way.",
  },
];

const EXPLORE = [
  {
    href: "/courses",
    icon: "🎓",
    title: "Courses",
    body: "Leadership Voice and Campus Voice — structured, lesson-by-lesson.",
    go: "View courses",
  },
  {
    href: "/events",
    icon: "📅",
    title: "Events",
    body: "Live workshops, practice nights, and open houses to join.",
    go: "See what's on",
  },
  {
    href: "/community",
    icon: "👥",
    title: "Community",
    body: "Find practice partners and get peer feedback as a member.",
    go: "Meet the members",
  },
  {
    href: "/leaderboard",
    icon: "🏆",
    title: "Leaderboard",
    body: "Earn points for showing up. Climb the ranks and keep streaks.",
    go: "See the rankings",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
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
            <Btn
              href="/signup"
              variant="accent"
              className="px-7 py-3.5 text-base"
            >
              Request your place
            </Btn>
            <Btn
              href="/courses"
              variant="ghost"
              className="px-7 py-3.5 text-base"
            >
              See what&apos;s inside →
            </Btn>
          </div>
          <p className="mt-4 text-[13.5px] text-ink-soft">
            Free to request. We&apos;re approving members in small groups so
            every cohort gets proper attention.
          </p>
        </Wrap>
      </header>

      <LogoMarquee />

      {/* The loop */}
      <Section alt>
        <Wrap>
          <SectionHead
            title="One loop. Every rep compounds."
            sub="Speaking well isn't a talent — it's a cycle. What you learn shapes how you practice, and every practice changes how you perform."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {LOOP.map((c) => (
              <div
                key={c.n}
                className="rounded-2xl border border-line bg-white p-8"
              >
                <div className="mb-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-soft text-[15px] font-bold text-brand">
                  {c.n}
                </div>
                <h3 className="mb-2 text-xl font-bold">{c.title}</h3>
                <p className="text-[15px] text-ink-soft">{c.body}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Explore */}
      <Section>
        <Wrap>
          <SectionHead
            title="Explore Stand Out."
            sub="Everything you need to grow your voice, in one place."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPLORE.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="block rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,24,31,.08)]"
              >
                <div className="mb-3 text-2xl">{c.icon}</div>
                <h3 className="mb-1 text-[17px] font-bold">{c.title}</h3>
                <p className="text-[13.5px] text-ink-soft">{c.body}</p>
                <div className="mt-3 text-[13px] font-bold text-brand">
                  {c.go} →
                </div>
              </Link>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* CTA band */}
      <Section alt>
        <Wrap>
          <div className="rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-10">
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight">
              Ready to be remembered?
            </h2>
            <p className="mx-auto mb-7 mt-3 max-w-[520px] text-[17px] text-[#cddcf0]">
              Request your place today. We review every request and approve
              members in small groups — you&apos;ll hear from us by email.
            </p>
            <Btn
              href="/signup"
              variant="accent"
              className="px-7 py-3.5 text-base"
            >
              Request your place
            </Btn>
          </div>
        </Wrap>
      </Section>

      {/* FAQ */}
      <Section>
        <Wrap>
          <SectionHead title="Frequently asked questions." center />
          <div className="mx-auto max-w-[760px]">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-2xl font-normal leading-none text-brand group-open:hidden">
                    +
                  </span>
                  <span className="hidden text-2xl font-normal leading-none text-brand group-open:inline">
                    –
                  </span>
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
