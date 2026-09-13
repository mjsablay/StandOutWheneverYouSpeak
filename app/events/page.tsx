import type { Metadata } from "next";
import { Wrap, Section, SectionHead, TierBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import {
  EVENT_COLUMNS,
  badgeTier,
  dateParts,
  isUpcoming,
  timeLabel,
  type LiveEvent,
} from "@/lib/events";

export const metadata: Metadata = {
  title: "Events — Stand Out Whenever You Speak",
  description:
    "Live workshops, peer practice nights, and open houses. Join a cohort class or drop into a free session.",
};

// Admins add events from the console, so don't cache for long.
export const revalidate = 60;

function EventDate({ iso }: { iso: string }) {
  const { month, day } = dateParts(iso);
  return (
    <div className="min-w-[64px] rounded-xl bg-brand-soft px-2 py-2.5 text-center text-brand">
      <span className="block text-xs font-bold uppercase tracking-wider">
        {month}
      </span>
      <span className="block text-2xl font-extrabold leading-tight">{day}</span>
    </div>
  );
}

function Line({ e }: { e: LiveEvent }) {
  return (
    <p className="text-sm text-ink-soft">
      {[timeLabel(e.starts_at), e.host ? `Hosted by ${e.host}` : null, e.details]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}

export default async function EventsPage() {
  let events: LiveEvent[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order("starts_at", { ascending: true });
    events = (data ?? []) as LiveEvent[];
  } catch {
    // An empty list is the honest fallback.
  }

  const now = new Date();
  const upcoming = events.filter((e) => isUpcoming(e, now));
  const past = events
    .filter((e) => !isUpcoming(e, now))
    .reverse()
    .slice(0, 6);

  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Events"
          title="Upcoming events."
          sub="Live sessions where the learning gets real. Join a cohort class, practice night, or open workshop."
        />

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <h3 className="mb-1.5 text-lg font-bold">Nothing scheduled yet</h3>
            <p className="mx-auto max-w-[460px] text-[15px] text-ink-soft">
              We&apos;re opening in small groups, and the first open house will
              be announced by email once the first cohort is in. Until then,
              the lessons and practice are all yours.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white px-6 py-5"
              >
                <EventDate iso={e.starts_at} />
                <div className="min-w-[200px] flex-1">
                  <h3 className="mb-0.5 text-lg font-bold">{e.title}</h3>
                  <Line e={e} />
                </div>
                <TierBadge tier={badgeTier(e.tier)} />
                {e.join_url ? (
                  <a
                    href={e.join_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg px-5 py-2.5 text-[14.5px] font-semibold transition ${
                      e.tier === "free"
                        ? "bg-brand text-white hover:bg-brand-dark"
                        : "bg-accent text-ink hover:bg-accent-dark"
                    }`}
                  >
                    Join event
                  </a>
                ) : (
                  <span className="text-[13.5px] text-ink-soft">
                    Link to follow by email
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="mb-4 mt-10 text-[13px] font-bold uppercase tracking-[0.1em] text-ink-soft">
              Past events
            </h2>
            <div className="flex flex-col gap-3.5">
              {past.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white px-6 py-5 opacity-60"
                >
                  <EventDate iso={e.starts_at} />
                  <div className="min-w-[200px] flex-1">
                    <h3 className="mb-0.5 text-lg font-bold">{e.title}</h3>
                    <Line e={e} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Wrap>
    </Section>
  );
}
