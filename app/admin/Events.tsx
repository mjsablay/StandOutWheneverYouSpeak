"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  EVENT_COLUMNS,
  dateParts,
  isUpcoming,
  timeLabel,
  type EventTier,
  type LiveEvent,
} from "@/lib/events";

/**
 * Where events get scheduled. Whatever is entered here is what members see
 * on /events and on their home page — there is no other source.
 */

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[14.5px] outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand";

type Draft = {
  title: string;
  starts_at: string; // datetime-local value, in the admin's own time zone
  details: string;
  host: string;
  join_url: string;
  tier: EventTier;
};

const EMPTY: Draft = {
  title: "",
  starts_at: "",
  details: "",
  host: "Barry Kuntz",
  join_url: "",
  tier: "free",
};

export default function Events() {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order("starts_at", { ascending: true });
    setEvents((data ?? []) as LiveEvent[]);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setNote(null);
    if (!draft.title.trim() || !draft.starts_at) {
      setNote("A title and a date are the minimum.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("events").insert({
      title: draft.title.trim(),
      starts_at: new Date(draft.starts_at).toISOString(),
      details: draft.details.trim() || null,
      host: draft.host.trim() || null,
      join_url: draft.join_url.trim() || null,
      tier: draft.tier,
    });
    setBusy(false);
    if (error) return setNote(error.message);
    setDraft(EMPTY);
    setOpen(false);
    setNote("Added. It's live on the events page now.");
    await load();
  };

  const remove = async (id: string) => {
    setBusy(true);
    const { error } = await supabase.from("events").delete().eq("id", id);
    setBusy(false);
    if (error) return setNote(error.message);
    setEvents((list) => list.filter((x) => x.id !== id));
  };

  const upcoming = events.filter((e) => isUpcoming(e));
  const past = events.filter((e) => !isUpcoming(e));

  return (
    <div className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">Events</h2>
          <p className="mt-1 text-[14px] text-ink-soft">
            {upcoming.length === 0
              ? "Nothing scheduled. Members see an honest empty state until something is."
              : `${upcoming.length} upcoming. Members see exactly this list.`}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-dark"
        >
          <CalendarPlus className="h-4 w-4" strokeWidth={2} />
          {open ? "Close" : "Schedule an event"}
        </button>
      </div>

      {note && (
        <div className="mb-4 rounded-xl border border-line bg-paper-warm p-3.5 text-[14px]">
          {note}
        </div>
      )}

      {open && (
        <form
          onSubmit={add}
          className="mb-5 grid gap-4 rounded-2xl border border-brand bg-white p-6 sm:grid-cols-2"
        >
          <label className="sm:col-span-2 text-[13px] font-semibold">
            Title
            <input
              className={`${field} mt-1.5`}
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Open House — What It Takes to Speak Like a Pro"
            />
          </label>
          <label className="text-[13px] font-semibold">
            When
            <input
              type="datetime-local"
              className={`${field} mt-1.5`}
              value={draft.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
            />
            <span className="mt-1 block text-[12.5px] font-normal text-ink-soft">
              Entered in your time zone; shown to members as Eastern.
            </span>
          </label>
          <label className="text-[13px] font-semibold">
            Who can join
            <select
              className={`${field} mt-1.5`}
              value={draft.tier}
              onChange={(e) => set("tier", e.target.value as EventTier)}
            >
              <option value="free">Everyone — free</option>
              <option value="circle">Speakers&apos; Circle members</option>
            </select>
          </label>
          <label className="text-[13px] font-semibold">
            Host
            <input
              className={`${field} mt-1.5`}
              value={draft.host}
              onChange={(e) => set("host", e.target.value)}
            />
          </label>
          <label className="text-[13px] font-semibold">
            Join link (Zoom, Meet…)
            <input
              className={`${field} mt-1.5`}
              value={draft.join_url}
              onChange={(e) => set("join_url", e.target.value)}
              placeholder="https://zoom.us/j/…"
            />
          </label>
          <label className="sm:col-span-2 text-[13px] font-semibold">
            One line of detail
            <input
              className={`${field} mt-1.5`}
              value={draft.details}
              onChange={(e) => set("details", e.target.value)}
              placeholder="Small-group breakout rooms · bring a two-minute piece"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? "Saving…" : "Add to the events page"}
            </button>
          </div>
        </form>
      )}

      {events.length > 0 && (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {[...upcoming, ...past].map((e) => {
            const { month, day } = dateParts(e.starts_at);
            const gone = !isUpcoming(e);
            return (
              <div
                key={e.id}
                className={`flex flex-wrap items-center gap-4 px-5 py-3.5 ${gone ? "opacity-60" : ""}`}
              >
                <div className="min-w-[52px] rounded-lg bg-brand-soft px-2 py-1.5 text-center text-brand">
                  <span className="block text-[10.5px] font-bold uppercase">{month}</span>
                  <span className="block text-lg font-extrabold leading-tight">{day}</span>
                </div>
                <div className="min-w-[200px] flex-1">
                  <div className="text-[15px] font-semibold">{e.title}</div>
                  <div className="text-[13px] text-ink-soft">
                    {timeLabel(e.starts_at)} · {e.tier === "free" ? "Free" : "Speakers' Circle"}
                    {gone ? " · past" : ""}
                  </div>
                </div>
                <button
                  onClick={() => remove(e.id)}
                  disabled={busy}
                  aria-label={`Remove ${e.title}`}
                  className="rounded-lg border border-line p-2 text-ink-soft hover:bg-paper-warm disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
