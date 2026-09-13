import type { Metadata } from "next";
import { CalendarCheck, Clock, MailCheck } from "lucide-react";
import { Wrap, Section, Eyebrow, Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_KEYS, type Founder } from "@/lib/content";
import { TEAM } from "@/lib/site";
import MeetingRequestForm from "./MeetingRequestForm";

export const metadata: Metadata = {
  title: "Contact — Stand Out Whenever You Speak",
  description:
    "Request a conversation about coaching, team training, or a speaking engagement.",
};

export const revalidate = 60;

const NEXT_STEPS = [
  { icon: MailCheck, title: "We read it", body: "Every request is read by Barry or Michael — no auto-replies." },
  { icon: Clock, title: "Within two business days", body: "You get a personal reply with a few times that work." },
  { icon: CalendarCheck, title: "You confirm", body: "Nothing is booked until you say yes to a time." },
];

export default async function ContactPage() {
  // Photos and headlines come from the same content the About page uses.
  let founders: Founder[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", CONTENT_KEYS.aboutFounders)
      .maybeSingle();
    if (data?.value) founders = data.value as Founder[];
  } catch {
    // Falls back to initials below.
  }

  const people = TEAM.map((p) => {
    const f = founders.find((x) => x.name === p.name);
    return { ...p, photo: f?.photo_url || null, position: f?.photo_position || null };
  });

  return (
    <>
      <header className="hero-glow relative overflow-hidden pb-6 pt-20 sm:pt-28">
        <Wrap className="max-w-[820px] text-center">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="display text-[clamp(38px,6vw,68px)]">
            Let&apos;s talk about your speaking.
          </h1>
          <p className="mx-auto mt-6 max-w-[520px] text-[19px] leading-relaxed text-ink-soft">
            Three quick steps. Tell us what you need and we&apos;ll come back
            with times that suit.
          </p>
        </Wrap>
      </header>

      <Section className="pt-10 sm:pt-12">
        <Wrap>
          <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <MeetingRequestForm />

            <div className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-line bg-white p-6 shadow-card">
                <div className="mb-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  Who you&apos;ll meet
                </div>
                <div className="space-y-5">
                  {people.map((p) => (
                    <div key={p.name} className="flex gap-4">
                      <Avatar
                        initials={p.initials}
                        size={56}
                        variant={p.dark ? "brand" : "accent"}
                        src={p.photo}
                        position={p.position}
                        alt={p.name}
                      />
                      <div>
                        <div className="text-[15.5px] font-bold leading-tight">{p.name}</div>
                        <div className="mb-1 text-[12px] font-bold uppercase tracking-wider text-brand">
                          {p.role}
                        </div>
                        <p className="text-[13.5px] leading-relaxed text-ink-soft">
                          {p.contactBlurb}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-paper-soft p-6">
                <div className="mb-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  What happens next
                </div>
                <ol className="space-y-4">
                  {NEXT_STEPS.map(({ icon: Icon, title, body }) => (
                    <li key={title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-card">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div>
                        <div className="text-[14.5px] font-bold">{title}</div>
                        <div className="text-[13.5px] text-ink-soft">{body}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
