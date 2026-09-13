"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EVENT_COLUMNS, isUpcoming, type LiveEvent } from "@/lib/events";

/** Upcoming events, soonest first, for client components like the home page. */
export function useUpcomingEvents(limit = 2) {
  const supabase = useMemo(() => createClient(), []);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(limit)
      .then(({ data }) => {
        if (cancelled) return;
        setEvents(((data ?? []) as LiveEvent[]).filter((e) => isUpcoming(e)));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, limit]);

  return { events, loading };
}
