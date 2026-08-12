import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Wrap, Section, Avatar } from "@/components/ui";
import { TEAM } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About — Stand Out Whenever You Speak",
  description:
    "Barry Kuntz has taught over 3,000 people to speak with impact. Meet the founders behind Stand Out.",
};

type TeamProfile = {
  display_name: string | null;
  avatar_url: string | null;
  avatar_position: string | null;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
};

export default async function AboutPage() {
  // Photos, headlines, bios and links come from each founder's own profile,
  // so updating your profile updates this page.
  let profiles: TeamProfile[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("team_profiles")
      .select("display_name,avatar_url,avatar_position,headline,bio,linkedin_url");
    profiles = (data ?? []) as TeamProfile[];
  } catch {
    // Page still renders from the static fallback.
  }

  const profileFor = (name: string) =>
    profiles.find((p) => {
      if (!p.display_name) return false;
      const a = p.display_name.toLowerCase();
      const b = name.toLowerCase();
      return a === b || a.startsWith(b) || b.startsWith(a);
    });

  return (
    <>
      {/* Statement */}
      <Section className="pb-8 pt-16 sm:pt-20">
        <Wrap className="max-w-[820px]">
          <h1 className="text-[clamp(34px,5.5vw,54px)] font-semibold leading-[1.1] tracking-tight">
            Speaking well isn&apos;t a talent.
            <br />
            <span className="text-brand">It&apos;s a method you can learn.</span>
          </h1>
          <p className="mt-6 max-w-[620px] text-[19px] leading-relaxed text-ink-soft">
            Stand Out exists because that method already works — it has for
            thousands of people, in boardrooms and lecture halls across the
            country. We&apos;re making it something you can practise any day of
            the week, not only when there&apos;s a room to stand in front of.
          </p>
        </Wrap>
      </Section>

      {/* Proof */}
      <Section alt className="py-12">
        <Wrap>
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              ["3,000+", "people coached"],
              ["10 years", "of teaching this method"],
              ["35", "organisations trained"],
            ].map(([figure, label]) => (
              <div key={label}>
                <div className="text-[38px] font-semibold leading-none tracking-tight text-brand">
                  {figure}
                </div>
                <div className="mt-2 text-[15px] text-ink-soft">{label}</div>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Founders */}
      <Section>
        <Wrap>
          <h2 className="mb-10 text-[26px] font-semibold tracking-tight">
            The founders
          </h2>

          <div className="space-y-8">
            {TEAM.map((person) => {
              const p = profileFor(person.name);
              const bio = p?.bio || person.bio;
              const headline = p?.headline || person.headline;
              const linkedin = p?.linkedin_url;

              return (
                <div
                  key={person.name}
                  className="overflow-hidden rounded-2xl border border-line bg-white"
                >
                  <div className="grid gap-8 p-8 sm:p-10 md:grid-cols-[200px_1fr]">
                    {/* Portrait */}
                    <div>
                      <Avatar
                        initials={person.initials}
                        size={168}
                        variant={person.dark ? "brand" : "accent"}
                        src={p?.avatar_url}
                        position={p?.avatar_position}
                        alt={person.name}
                      />
                    </div>

                    {/* Detail */}
                    <div>
                      <div className="mb-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-brand">
                        {person.role}
                      </div>
                      <h3 className="text-[28px] font-semibold tracking-tight">
                        {person.name}
                      </h3>
                      {headline && (
                        <p className="mt-1 text-[15.5px] text-ink-soft">
                          {headline}
                        </p>
                      )}

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

                      <p className="max-w-[640px] text-[16px] leading-relaxed text-ink-soft">
                        {bio}
                      </p>

                      {linkedin && (
                        <a
                          href={linkedin}
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
              );
            })}
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
