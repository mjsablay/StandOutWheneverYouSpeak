"use client";

/**
 * A member's preparation for one Speakers' Circle topic, and their sessions
 * on it. Rows live in practice_prep and practice_sessions with row-level
 * security keeping each member to their own; the server reads the same
 * rows when it hands Katya her session materials (lib/katya-session.ts).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/mock-auth";
import type { KatyaMode } from "@/lib/katya";

export type Prep = {
  audience: string;
  frame: string;
  notes: string;
  updated_at: string | null;
};

const EMPTY: Prep = { audience: "", frame: "", notes: "", updated_at: null };

export function usePrep(topicId: string) {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [prep, setPrep] = useState<Prep>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setPrep(EMPTY);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("practice_prep")
      .select("audience,frame,notes,updated_at")
      .eq("user_id", user.id)
      .eq("topic_id", topicId)
      .maybeSingle();
    setPrep({
      audience: (data?.audience as string | null) ?? "",
      frame: (data?.frame as string | null) ?? "",
      notes: (data?.notes as string | null) ?? "",
      updated_at: (data?.updated_at as string | null) ?? null,
    });
    setLoading(false);
  }, [supabase, user, topicId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  /** Saves the three fields as they are. Empty strings are stored as null. */
  const save = useCallback(
    async (next: Pick<Prep, "audience" | "frame" | "notes">) => {
      if (!user) {
        setError("Not signed in.");
        return { error: "Not signed in." };
      }
      setSaving(true);
      setError(null);
      const { data, error } = await supabase
        .from("practice_prep")
        .upsert(
          {
            user_id: user.id,
            topic_id: topicId,
            audience: next.audience.trim() || null,
            frame: next.frame.replace(/\s+$/, "") || null,
            notes: next.notes.replace(/\s+$/, "") || null,
          },
          { onConflict: "user_id,topic_id" },
        )
        .select("updated_at")
        .maybeSingle();
      setSaving(false);
      if (error) {
        setError(error.message);
        return { error: error.message };
      }
      setPrep({ ...next, updated_at: (data?.updated_at as string | null) ?? new Date().toISOString() });
      return {};
    },
    [supabase, user, topicId],
  );

  return { prep, loading, saving, error, save, reload: load };
}

export type SessionRow = {
  id: string;
  mode: KatyaMode | null;
  channel: "text" | "voice";
  duration_seconds: number | null;
  created_at: string;
  closing: string | null;
  ended_reason: string | null;
};

export function useTopicSessions(topicId: string) {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("practice_sessions")
      .select("id,mode,channel,duration_seconds,created_at,closing,ended_reason")
      .eq("user_id", user.id)
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false })
      .limit(20);
    setRows((data ?? []) as SessionRow[]);
    setLoading(false);
  }, [supabase, user, topicId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { rows, loading, reload: load };
}
