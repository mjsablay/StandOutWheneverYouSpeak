import type { Metadata } from "next";
import Link from "next/link";
import { Eye, ExternalLink, Layers, Target, Volume2 } from "lucide-react";
import { Wrap, Section, SectionHead, Eyebrow, Btn } from "@/components/ui";
import LogoMarquee from "@/components/LogoMarquee";
import { createClient } from "@/lib/supabase/server";
import { RUBRIC } from "@/lib/courses";
import {
  CONTENT_KEYS,
  FALLBACK_HERO,
  FALLBACK_STATS,
  initialsFrom,
  type AboutHero,
  type AboutStat,
  type Founder,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "About — Stand Out Whenever You Speak",
  description:
    "Barry Kuntz has coached more than 3,500 leaders to speak with impact. Meet the founders behind Stand Out.",
};

// Content is editable from the admin console, so don't cache indefinitely.
export const revalidate = 60;

const RUBRIC_ICONS = [Layers, Volume2, Eye, Target] as const;

function FounderTile({ person, flip }: { person: Founder; flip: boolean }) {
  const photo = person.photo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={person.photo_url}
      alt={person.name}
      className="h-full w-full object-cover"
      style={{ objectPosition: person.photo_position || "50% 50%" }}
    />
  ) : (
    <div
      className={`flex h-full w-full items-center justify-center ${
        person.dark ? "bg-brand text-white" : "bg-accent text-ink"
      }`}
    >
      <span className="display text-[72px]">
        {person.initials || initialsFrom(person.name)}
      </span>
    </div>
  );

  // The alternating tile flips the photo to the right — and `order` alone
  // does not do that. Grid places items into tracks in order, so ordering the
  // photo second dropped it into the *wide* track and squeezed the bio into
  // the narrow one: Barry's portrait rendered 328px across, Michael's 582px.
  // Swapping the track sizes with the order keeps the photo column the same
  // size in both tiles.
  return (
    <div
      className={`grid overflow-hidden rounded-[28px] border border-line bg-white shadow-card md:items-center ${
        flip
          ? "md:grid-cols-[1.45fr_minmax(280px,0.85fr)]"
          : "md:grid-cols-[minmax(280px,0.85fr)_1.45fr]"
      }`}
    >
      <div className={`p-3 md:p-4 ${flip ? "md:order-2" : ""}`}>
        <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-paper-soft">
          {photo}
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 sm:p-10">
        <div className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.1em] text-brand">
          {person.role}
        </div>
        <h3 className="display text-[clamp(28px,3.4vw,38px)]">{person.name}</h3>
        {person.headline && (
          <p className="mt-2 text-[15.5px] text-ink-soft">{person.headline}</p>
        )}
        {person.credentials?.length > 0 && (
          <div className="my-5 flex flex-wrap gap-2">
            {person.credentials.map((c) => (
              <span
                key={c}
                className="rounded-full bg-paper-soft px-3 py-1.5 text-[13px] font-semibold"
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <p className="max-w-[560px] whitespace-pre-line text-[15.5px] leading-relaxed text-ink-soft">
          {person.bio}
        </p>
        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-line px-4 py-2 text-[14px] font-semibold transition hover:bg-paper-soft"
          >
            <ExternalLink className="h-4 w-4 text-brand" strokeWidth={2} />
            {person.name.split(" ")[0]} on LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

export default async function AboutPage() {
  let hero: AboutHero = FALLBACK_HERO;
  let stats: AboutStat[] = FALLBACK_STATS;
  let founders: Founder[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_content").select("key,value");

    const byKey = Object.fromEntries(
      (data ?? []).map((r) => [r.key as string, r.value]),
    );

    if (byKey[CONTENT_KEYS.aboutHero]) hero = byKey[CONTENT_KEYS.aboutHero];
    if (byKey[CONTENT_KEYS.aboutStats]) stats = byKey[CONTENT_KEYS.aboutStats];
    if (byKey[CONTENT_KEYS.aboutFounders])
      founders = byKey[CONTENT_KEYS.aboutFounders];
  } catch {
    // Falls back to the constants above.
  }

  return (
    <>
      {/* Statement */}
      <header className="hero-glow relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-28">
        <Wrap className="max-w-[900px] text-center">
          <Eyebrow>About</Eyebrow>
          <h1 className="display text-[clamp(38px,6vw,72px)]">
            {hero.headline}
            <br />
            <span className="text-brand">{hero.headline_accent}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-[620px] text-[19px] leading-relaxed text-ink-soft">
            {hero.body}
          </p>
        </Wrap>

        {/* Proof */}
        {stats.length > 0 && (
          <Wrap className="mt-14">
            <div className="grid gap-4 rounded-[28px] border border-line bg-white p-2 shadow-card sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl px-6 py-7 text-center">
                  <div className="display text-[clamp(38px,5vw,56px)] text-brand">
                    {s.figure}
                  </div>
                  <div className="mt-1 text-[14.5px] text-ink-soft">{s.label}</div>
                </div>
              ))}
            </div>
          </Wrap>
        )}
      </header>

      {/* The method */}
      <Section>
        <Wrap>
          <SectionHead
            center
            eyebrow="The method"
            title="Four things Barry listens for."
            sub="Speak with Impact is a rubric, not a mood. Every lesson, every practice session and every score comes back to these four."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {RUBRIC.map((c, i) => {
              const Icon = RUBRIC_ICONS[i] ?? Layers;
              return (
                <div key={c.id} className="rounded-3xl border border-line bg-white p-7 shadow-card">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mb-3 text-[19px] font-bold leading-snug">{c.name}</h3>
                  <ul className="space-y-1.5 text-[14px] text-ink-soft">
                    {c.looksFor.map((l) => (
                      <li key={l} className="flex gap-2">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Wrap>
      </Section>

      {/* Founders */}
      <Section alt>
        <Wrap>
          <SectionHead
            eyebrow="The founders"
            title="A coach with the method. A builder who needed it."
            sub="Barry supplies seventeen years of coaching; Michael turns it into something you can practise on a Tuesday night."
          />
          <div className="space-y-6">
            {founders.map((person, i) => (
              <FounderTile key={person.name} person={person} flip={i % 2 === 1} />
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Where the method has been */}
      <div className="border-y border-line">
        <LogoMarquee />
      </div>

      {/* Close */}
      <Section>
        <Wrap>
          <div className="relative overflow-hidden rounded-[32px] bg-brand px-6 py-16 text-center text-white sm:px-10 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
            />
            <h2 className="display relative text-[clamp(32px,4.6vw,52px)]">
              Want to work with us?
            </h2>
            <p className="relative mx-auto mb-8 mt-4 max-w-[500px] text-[17px] text-white/80">
              Coaching for yourself, training for a team, or a speaking
              engagement — tell us what you need and we&apos;ll come back with times.
            </p>
            <div className="relative flex flex-wrap justify-center gap-3">
              <Btn href="/contact" variant="accent" className="px-7 py-3.5 text-[16px]">
                Start a conversation
              </Btn>
              <Link
                href="/request"
                className="inline-flex items-center rounded-full border border-white/30 px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-white/10"
              >
                Request a place
              </Link>
            </div>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
