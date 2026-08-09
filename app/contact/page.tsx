import type { Metadata } from "next";
import { Wrap, Section, Avatar } from "@/components/ui";
import { TEAM } from "@/lib/site";
import MeetingRequestForm from "./MeetingRequestForm";

export const metadata: Metadata = {
  title: "Contact — Stand Out Whenever You Speak",
  description:
    "Request a conversation about coaching, team training, or a speaking engagement.",
};

const STEPS = [
  {
    n: 1,
    title: "Tell us what you need",
    body: "A few questions so we understand the situation before we meet.",
  },
  {
    n: 2,
    title: "We review it personally",
    body: "Every request is read by Barry or Michael — no automated triage.",
  },
  {
    n: 3,
    title: "We propose times",
    body: "You'll get options that fit your availability, usually within two business days.",
  },
];

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
          <p className="mx-auto max-w-[560px] text-[18px] text-ink-soft">
            Whether it&apos;s coaching for yourself, training for a team, or
            booking Barry to speak — tell us what you need and we&apos;ll find
            a time.
          </p>
        </Wrap>
      </Section>

      {/* How it works */}
      <Section alt className="py-14">
        <Wrap>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mb-1.5 text-[16px] font-bold">{s.title}</h3>
                <p className="text-[14px] text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
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

              <div className="rounded-2xl border border-line bg-paper-warm p-7">
                <h3 className="mb-2.5 text-[16px] font-bold">
                  Already a member?
                </h3>
                <p className="mb-4 text-[14px] text-ink-soft">
                  For anything about your account, lessons, or the community,
                  message us from inside the platform — it reaches us faster and
                  we&apos;ll already have your details.
                </p>
                <a
                  href="/signin"
                  className="text-[14px] font-semibold text-brand hover:underline"
                >
                  Sign in →
                </a>
              </div>

              <div className="rounded-2xl border border-line bg-white p-7">
                <h3 className="mb-2.5 text-[16px] font-bold">Response times</h3>
                <p className="text-[14px] text-ink-soft">
                  We aim to reply within two business days. Corporate and team
                  training enquiries are usually answered sooner.
                </p>
              </div>
            </div>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
