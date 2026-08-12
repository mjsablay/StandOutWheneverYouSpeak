import type { Metadata } from "next";
import { Wrap, Section, Avatar } from "@/components/ui";
import { TEAM } from "@/lib/site";
import MeetingRequestForm from "./MeetingRequestForm";

export const metadata: Metadata = {
  title: "Contact — Stand Out Whenever You Speak",
  description:
    "Request a conversation about coaching, team training, or a speaking engagement.",
};



export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <Section className="pb-10">
        <Wrap className="max-w-[820px] text-center">
          <span className="mb-5 inline-block text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
            Contact
          </span>
          <h1 className="mb-4 text-[clamp(32px,5vw,48px)] font-extrabold leading-tight tracking-tight">
            Let&apos;s talk about your speaking.
          </h1>
          <p className="mx-auto max-w-[520px] text-[18px] text-ink-soft">
            Tell us what you need and we&apos;ll come back with times that
            suit. We reply within two business days.
          </p>
        </Wrap>
      </Section>

      {/* Form + team */}
      <Section>
        <Wrap>
          <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <MeetingRequestForm />

            <div className="space-y-5">
              <div className="rounded-2xl border border-line bg-white p-7">
                <h3 className="mb-5 text-[17px] font-bold">Who you&apos;ll meet</h3>
                <div className="space-y-5">
                  {TEAM.map((p) => (
                    <div key={p.name} className="flex gap-4">
                      <Avatar
                        initials={p.initials}
                        size={52}
                        variant={p.dark ? "brand" : "accent"}
                      />
                      <div>
                        <div className="text-[15.5px] font-bold">{p.name}</div>
                        <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-brand">
                          {p.role}
                        </div>
                        <p className="text-[13.5px] text-ink-soft">
                          {p.contactBlurb}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
