import type { Metadata } from "next";
import { Wrap, Section, SectionHead, Avatar } from "@/components/ui";
import { TEAM } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — Stand Out Whenever You Speak",
  description:
    "Barry Kuntz has taught over 3,000 people to speak with impact. Meet the team behind Stand Out.",
};

export default function AboutPage() {
  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="About us"
          title="About us."
          sub="A coach who's taught thousands to stand out, and a builder making that coaching available to everyone."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {TEAM.map((person) => (
            <div
              key={person.name}
              className="rounded-2xl border border-line bg-white p-8"
            >
              <div className="mb-5">
                <Avatar
                  initials={person.initials}
                  size={84}
                  variant={person.dark ? "brand" : "accent"}
                />
              </div>
              <h3 className="mb-0.5 text-[22px] font-bold">{person.name}</h3>
              <div className="mb-3.5 text-[13.5px] font-bold uppercase tracking-wider text-brand">
                {person.role}
              </div>
              <p className="text-[15px] text-ink-soft">{person.bio}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}
