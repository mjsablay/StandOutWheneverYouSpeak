"use client";

/**
 * Lesson progress, stored in the database.
 *
 * Previously localStorage, which was wrong for three reasons: it vanished on
 * another device, the member could clear it, and — since it gated the next
 * lesson — they could edit it to unlock content they hadn't earned. Now the
 * database is the record and row-level security keeps each member to their
 * own rows.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/mock-auth";

export type LessonProgress = {
  watched: boolean;
  quiz_passed: boolean;
  best_score: number | null;
  attempts: number;
};

type ProgressMap = Record<string, LessonProgress>;

export function useProgress(courseSlug = "leadership-voice") {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setProgress({});
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("member_progress")
      .select("lesson_slug,watched,quiz_passed,best_score,attempts")
      .eq("user_id", user.id)
      .eq("course_slug", courseSlug);

    const map: ProgressMap = {};
    (data ?? []).forEach((r) => {
      map[r.lesson_slug as string] = {
        watched: r.watched as boolean,
        quiz_passed: r.quiz_passed as boolean,
        best_score: r.best_score as number | null,
        attempts: r.attempts as number,
      };
    });
    setProgress(map);
    setLoading(false);
  }, [supabase, user, courseSlug]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  /** Records a quiz attempt, keeping the best score. */
  const recordAttempt = useCallback(
    async (lessonSlug: string, score: number, passed: boolean) => {
      if (!user) return;
      const existing = progress[lessonSlug];
      const best = Math.max(score, existing?.best_score ?? 0);

      await supabase.from("member_progress").upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
          quiz_passed: passed || existing?.quiz_passed || false,
          best_score: best,
          attempts: (existing?.attempts ?? 0) + 1,
          completed_at: passed ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,course_slug,lesson_slug" },
      );
      await load();
    },
    [supabase, user, courseSlug, progress, load],
  );

  const markWatched = useCallback(
    async (lessonSlug: string, watched = true) => {
      if (!user) return;
      await supabase.from("member_progress").upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
          watched,
        },
        { onConflict: "user_id,course_slug,lesson_slug" },
      );
      await load();
    },
    [supabase, user, courseSlug, load],
  );

  return {
    progress,
    loading,
    hasPassed: (slug: string) => Boolean(progress[slug]?.quiz_passed),
    hasWatched: (slug: string) => Boolean(progress[slug]?.watched),
    scoreFor: (slug: string) => progress[slug]?.best_score ?? null,
    recordAttempt,
    markWatched,
  };
}
