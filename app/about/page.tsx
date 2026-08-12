import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Wrap, Section, Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
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
    "Barry Kuntz has taught over 3,000 people to speak with impact. Meet the founders behind Stand Out.",
};

// Content is editable from the admin console, so don't cache indefinitely.
export const revalidate = 60;

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
      <Section className="pb-8 pt-16 sm:pt-20">
        <Wrap className="max-w-[820px]">
          <h1 className="text-[clamp(34px,5.5vw,54px)] font-semibold leading-[1.1] tracking-tight">
            {hero.headline}
            <br />
            <span className="text-brand">{hero.headline_accent}</span>
          </h1>
          <p className="mt-6 max-w-[620px] text-[19px] leading-relaxed text-ink-soft">
            {hero.body}
          </p>
        </Wrap>
      </Section>

      {/* Proof */}
      {stats.length > 0 && (
        <Section alt className="py-12">
          <Wrap>
            <div className="grid gap-8 text-center sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-[38px] font-semibold leading-none tracking-tight text-brand">
                    {s.figure}
                  </div>
                  <div className="mt-2 text-[15px] text-ink-soft">{s.label}</div>
                </div>
              ))}
            </div>
          </Wrap>
        </Section>
      )}

      {/* Founders */}
      <Section>
        <Wrap>
          <h2 className="mb-10 text-[26px] font-semibold tracking-tight">
            The founders
          </h2>

          <div className="space-y-8">
            {founders.map((person) => (
              <div
                key={person.name}
                className="overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="grid gap-8 p-8 sm:p-10 md:grid-cols-[200px_1fr]">
                  <div>
                    <Avatar
                      initials={person.initials || initialsFrom(person.name)}
                      size={168}
                      variant={person.dark ? "brand" : "accent"}
                      src={person.photo_url || null}
                      position={person.photo_position}
                      alt={person.name}
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-brand">
                      {person.role}
                    </div>
                    <h3 className="text-[28px] font-semibold tracking-tight">
                      {person.name}
                    </h3>
                    {person.headline && (
                      <p className="mt-1 text-[15.5px] text-ink-soft">
                        {person.headline}
                      </p>
                    )}

                    {person.credentials?.length > 0 && (
                      <div className="my-5 flex flex-wrap gap-2">
                        {person.credentials.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-paper-warm px-3 py-1.5 text-[13px] font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="max-w-[640px] whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">
                      {person.bio}
                    </p>

                    {person.linkedin && (
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-[14.5px] font-semibold text-brand hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" strokeWidth={2} />
                        {person.name} on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Close */}
      <Section alt className="py-14">
        <Wrap className="max-w-[640px] text-center">
          <h2 className="text-[26px] font-semibold tracking-tight">
            Want to work with us?
          </h2>
          <p className="mx-auto mt-3 mb-7 max-w-[480px] text-[16px] text-ink-soft">
            Coaching for yourself, training for a team, or a speaking
            engagement — tell us what you need.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-brand px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-dark"
          >
            Get in touch
          </Link>
        </Wrap>
      </Section>
    </>
  );
}
