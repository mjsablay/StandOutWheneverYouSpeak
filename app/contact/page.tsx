import type { Metadata } from "next";
import { Wrap, Section, SectionHead, Btn, Avatar } from "@/components/ui";
import { TEAM } from "@/lib/site";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — Stand Out Whenever You Speak",
  description:
    "Book a call with Barry Kuntz or Michael Jordan Sablay, or send us a message.",
};

export default function ContactPage() {
  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Contact"
          title="Let's talk."
          sub="Book a time directly on our calendars, or send a note and we'll get back to you."
        />

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {TEAM.map((person) => (
            <div
              key={person.name}
              className="flex flex-col rounded-2xl border border-line bg-white p-8"
            >
              <div className="mb-4">
                <Avatar
                  initials={person.initials}
                  size={72}
                  variant={person.dark ? "brand" : "accent"}
                />
              </div>
              <h3 className="mb-0.5 text-xl font-bold">{person.name}</h3>
              <div className="mb-3 text-[13.5px] font-bold uppercase tracking-wider text-brand">
                {person.role}
              </div>
              <p className="mb-5 text-[14.5px] text-ink-soft">
                {person.contactBlurb}
              </p>
              <div className="mt-auto flex flex-col gap-3">
                <Btn
                  href={person.calendly}
                  variant="accent"
                  external
                  className="text-center"
                >
                  📅 Book a call on Calendly
                </Btn>
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="text-center text-sm font-semibold text-brand hover:underline"
                  >
                    {person.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-5 text-[26px] font-extrabold tracking-tight">
          Send a message
        </h2>
        <ContactForm />
      </Wrap>
    </Section>
  );
}
