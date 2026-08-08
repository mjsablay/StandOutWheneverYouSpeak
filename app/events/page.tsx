import type { Metadata } from "next";
import { Wrap, Section, SectionHead, Btn, TierBadge } from "@/components/ui";
import { UPCOMING_EVENTS, PAST_EVENTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events — Stand Out Whenever You Speak",
  description:
    "Live workshops, peer practice nights, and open houses. Join a cohort class or drop into a free session.",
};

function EventDate({ month, day }: { month: string; day: string }) {
  return (
    <div className="min-w-[64px] rounded-xl bg-brand-soft px-2 py-2.5 text-center text-brand">
      <span className="block text-xs font-bold uppercase tracking-wider">
        {month}
      </span>
      <span className="block text-2xl font-extrabold leading-tight">{day}</span>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Events"
          title="Upcoming events."
          sub="Live sessions where the learning gets real. Join a cohort class, practice night, or open workshop."
        />

        <div className="flex flex-col gap-3.5">
          {UPCOMING_EVENTS.map((e) => (
            <div
              key={e.title}
              className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white px-6 py-5"
            >
              <EventDate month={e.month} day={e.day} />
              <div className="flex-1 min-w-[200px]">
                <h3 className="mb-0.5 text-lg font-bold">{e.title}</h3>
                <p className="text-sm text-ink-soft">{e.details}</p>
              </div>
              <TierBadge tier={e.tier} />
              <Btn
                href="/pricing"
                variant={e.tier === "free" ? "brand" : "accent"}
              >
                Join event
              </Btn>
            </div>
          ))}
        </div>

        <h2 className="mb-4 mt-10 text-[13px] font-bold uppercase tracking-[0.1em] text-ink-soft">
          Past events
        </h2>
        <div className="flex flex-col gap-3.5">
          {PAST_EVENTS.map((e) => (
            <div
              key={e.title}
              className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white px-6 py-5 opacity-60"
            >
              <EventDate month={e.month} day={e.day} />
              <div className="flex-1 min-w-[200px]">
                <h3 className="mb-0.5 text-lg font-bold">{e.title}</h3>
                <p className="text-sm text-ink-soft">{e.details}</p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-paper-warm px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-ink-soft">
                Recording
              </span>
            </div>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}
