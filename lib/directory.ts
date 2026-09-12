"use client";

/**
 * Real member directory, replacing the five invented profiles that used to
 * populate the community, leaderboard and member pages.
 *
 * Reads the `member_directory` view, which excludes email addresses and
 * honours each member's field-visibility toggles. Members reach each other
 * through in-app messaging rather than by swapping inboxes.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type DirectoryMember = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  school: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  tier: "free" | "circle";
  points: number;
  lessons_completed: number;
  created_at: string;
};

export function useDirectory(enabled = true) {
  const supabase = useMemo(() => createClient(), []);
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("member_directory")
      .select("*")
      .order("points", { ascending: false });
    setMembers((data ?? []) as DirectoryMember[]);
    setLoading(false);
  }, [supabase, enabled]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { members, loading, reload: load };
}

export const nameOf = (m: { display_name: string | null }) =>
  m.display_name || "Member";

/** Where a member sits on the leaderboard, 1-indexed. */
export const rankOf = (members: DirectoryMember[], id: string) => {
  const i = members.findIndex((m) => m.id === id);
  return i === -1 ? null : i + 1;
};
