/**
 * Live events — workshops, practice nights, open houses.
 *
 * These come from the `events` table, which admins edit in the console.
 * They used to be three hard-coded entries in lib/site.ts with dates in July
 * and August, still labelled "upcoming" in September, plus two "past events"
 * whose recordings never existed. A new member's first click on Events
 * landed on fiction. Now the page shows what is actually scheduled, and
 * says so plainly when nothing is.
 */

export type EventTier = "free" | "circle";

export type LiveEvent = {
  id: string;
  title: string;
  details: string | null;
  host: string | null;
  join_url: string | null;
  starts_at: string;
  tier: EventTier;
};

export const EVENT_COLUMNS = "id,title,details,host,join_url,starts_at,tier";

/** Barry and the members are in Ontario; times are shown in Eastern. */
export const EVENT_TIME_ZONE = "America/Toronto";

export const isUpcoming = (e: LiveEvent, now = new Date()) =>
  new Date(e.starts_at).getTime() >= now.getTime();

/** "Sep" / "24" for the date tile. */
export const dateParts = (iso: string) => {
  const d = new Date(iso);
  return {
    month: d.toLocaleString("en-CA", { month: "short", timeZone: EVENT_TIME_ZONE }),
    day: d.toLocaleString("en-CA", { day: "2-digit", timeZone: EVENT_TIME_ZONE }),
  };
};

/** "7:00 PM ET" */
export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }) + " ET";

/** The TierBadge component speaks in "free" | "member". */
export const badgeTier = (t: EventTier): "free" | "member" =>
  t === "free" ? "free" : "member";
