import type { Metadata } from "next";
import { Wrap, Section, SectionHead, Avatar } from "@/components/ui";
import { TEAM } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About Us — Stand Out Whenever You Speak",
  description:
    "Barry Kuntz has taught over 3,000 people to speak with impact. Meet the team behind Stand Out.",
};

type TeamPhoto = {
  display_name: string | null;
  avatar_url: string | null;
  avatar_position: string | null;
};

export default async function AboutPage() {
  // Photos come from the founders' own profiles, so updating your picture
  // in Edit Profile updates this page too. Public, read-only view.
  let photos: TeamPhoto[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("team_profiles")
      .select("display_name,avatar_url,avatar_position");
    photos = (data ?? []) as TeamPhoto[];
  } catch {
    // If the lookup fails the page still renders with initials.
  }

  const photoFor = (name: string) =>
    photos.find(
      (p) =>
        p.display_name &&
        (p.display_name.toLowerCase() === name.toLowerCase() ||
          name.toLowerCase().startsWith(p.display_name.toLowerCase()) ||
          p.display_name.toLowerCase().startsWith(name.toLowerCase())),
    );

  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="About us"
          title="About us."
          sub="A coach who's taught thousands to stand out, and a builder making that coaching available to everyone."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {TEAM.map((person) => {
            const photo = photoFor(person.name);
            return (
              <div
                key={person.name}
                className="rounded-2xl border border-line bg-white p-8"
              >
                <div className="mb-5">
                  <Avatar
                    initials={person.initials}
                    size={84}
                    variant={person.dark ? "brand" : "accent"}
                    src={photo?.avatar_url}
                    position={photo?.avatar_position}
                    alt={person.name}
                  />
                </div>
                <h3 className="mb-0.5 text-[22px] font-bold">{person.name}</h3>
                <div className="mb-3.5 text-[13.5px] font-bold uppercase tracking-wider text-brand">
                  {person.role}
                </div>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {person.bio}
                </p>
              </div>
            );
          })}
        </div>
      </Wrap>
    </Section>
  );
}
