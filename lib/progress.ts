"use client";

/**
 * Demo progress tracking — quiz passes stored in localStorage.
 * Replaced by the `lesson_progress` table in Supabase, where it can't be
 * edited by the learner. Same function names, so the swap is contained.
 */

import { useCallback, useSyncExternalStore } from "react";

const KEY = "standout.demo.progress";
const EVENT = "standout:progress";

export type Progress = Record<string, { score: number; passedAt: string }>;

let cachedRaw: string | null = null;
let cached: Progress = {};

function getSnapshot(): Progress {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = raw ? (JSON.parse(raw) as Progress) : {};
    } catch {
      cached = {};
    }
  }
  return cached;
}

const getServerSnapshot = (): Progress => ({});

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const noopSubscribe = () => () => {};

export function useProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const recordPass = useCallback((lessonSlug: string, score: number) => {
    const next: Progress = {
      ...getSnapshot(),
      [lessonSlug]: { score, passedAt: new Date().toISOString() },
    };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return {
    progress: hydrated ? progress : {},
    hydrated,
    hasPassed: (slug: string) => (hydrated ? Boolean(progress[slug]) : false),
    recordPass,
    reset,
  };
}
