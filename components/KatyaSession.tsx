"use client";

/**
 * A live text session with Katya, run the way Barry's context prompt asks:
 * the mode is chosen before she speaks, she opens with a readiness check,
 * one idea per turn, a reliable timer with a two-minute warning, and a
 * closing next step when time is up. Every session is saved on end.
 *
 * Voice replaces the typed turn with Push to Talk and nothing else changes
 * here in shape — which is the point of shipping text first.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Send, Square } from "lucide-react";
import { Avatar } from "@/components/ui";
import { COACH_NAME } from "@/lib/site";
import type { KatyaModeSpec } from "@/lib/katya";

type Turn = { role: "coach" | "learner"; text: string };
type Signal = "two_minutes" | "time_up";
type EndReason = "learner" | "time_up" | "error";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

const post = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // A session that has expired is redirected to the sign-in page, which
  // arrives as a 200 of HTML. Treat anything that is not JSON as an error.
  if (!res.headers.get("content-type")?.includes("application/json")) {
    return {
      ok: false,
      status: res.status,
      json: { error: "You've been signed out. Sign in again to continue." },
    };
  }
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, json };
};

export default function KatyaSession({
  topicId,
  mode,
  onEnded,
  onClose,
}: {
  topicId: string;
  mode: KatyaModeSpec;
  /** The session has been saved (or could not be); refresh any list of sessions. */
  onEnded: () => void;
  /** Back to the mode picker. */
  onClose: () => void;
}) {
  const cap = mode.minutes * 60;

  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(cap);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [draft, setDraft] = useState("");
  const [ended, setEnded] = useState<{
    reason: EndReason;
    seconds: number;
    saved: string;
  } | null>(null);

  // Mirrors for the timer and in-flight requests, which must not see stale
  // state.
  const turnsRef = useRef<Turn[]>([]);
  const busyRef = useRef(false);
  const endedRef = useRef(false);
  const openedRef = useRef(false);
  const warnedRef = useRef(false);
  const timeUpRef = useRef(false);
  const pendingSignal = useRef<Signal | null>(null);
  // Set when the session mounts, not during render (the clock is impure).
  const startedAt = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const elapsed = () =>
    startedAt.current === null ? 0 : Math.floor((Date.now() - startedAt.current) / 1000);

  const setBusyBoth = (b: boolean) => {
    busyRef.current = b;
    setBusy(b);
  };
  const pushTurn = (t: Turn) => {
    turnsRef.current = [...turnsRef.current, t];
    setTurns(turnsRef.current);
  };

  const finish = useCallback(
    async (reason: EndReason) => {
      if (endedRef.current) return;
      endedRef.current = true;
      const seconds = Math.min(elapsed(), cap);
      let saved: string;
      if (!turnsRef.current.some((t) => t.role === "learner")) {
        saved = "Nothing to save: you didn't take a turn.";
      } else {
        try {
          const r = await post("/api/katya/end", {
            topicId,
            mode: mode.id,
            turns: turnsRef.current,
            durationSeconds: seconds,
            endedReason: reason,
          });
          saved = r.ok
            ? "Saved to your sessions on this topic."
            : `Not saved: ${String(r.json.error ?? r.status)}`;
        } catch (e) {
          saved = `Not saved: ${(e as Error).message}`;
        }
      }
      setEnded({ reason, seconds, saved });
      onEnded();
    },
    [cap, topicId, mode.id, onEnded],
  );

  const request = useCallback(
    async (learnerText: string | null, signal: Signal | null) => {
      if (endedRef.current || busyRef.current) return;
      setBusyBoth(true);
      setError(null);
      if (learnerText) pushTurn({ role: "learner", text: learnerText });
      const sig = signal ?? pendingSignal.current;
      pendingSignal.current = null;

      try {
        const r = await post("/api/katya/turn", {
          topicId,
          mode: mode.id,
          turns: turnsRef.current,
          remainingSeconds: Math.max(0, cap - elapsed()),
          signal: sig,
        });
        if (!r.ok) {
          if (r.json.needsKey) setNeedsKey(true);
          setError(String(r.json.error ?? `Katya could not respond (${r.status}).`));
        } else {
          pushTurn({ role: "coach", text: String(r.json.reply ?? "") });
        }
        if (sig === "time_up") await finish("time_up");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusyBoth(false);
      }
      // A signal that arrived while this turn was in flight is picked up by
      // the next timer tick, which also keeps this callback from calling
      // itself.
    },
    [cap, topicId, mode.id, finish],
  );

  // Katya speaks first; then the clock runs.
  useEffect(() => {
    if (!openedRef.current) {
      openedRef.current = true;
      startedAt.current = Date.now();
      void Promise.resolve().then(() => request(null, null));
    }
    const id = setInterval(() => {
      if (endedRef.current) return;
      const left = Math.max(0, cap - elapsed());
      setRemaining(left);
      if (pendingSignal.current && !busyRef.current) {
        const next = pendingSignal.current;
        pendingSignal.current = null;
        void request(null, next);
        return;
      }
      if (left <= 120 && !warnedRef.current) {
        warnedRef.current = true;
        if (busyRef.current) pendingSignal.current = "two_minutes";
        else void request(null, "two_minutes");
      }
      if (left === 0 && !timeUpRef.current) {
        timeUpRef.current = true;
        if (busyRef.current) pendingSignal.current = "time_up";
        else void request(null, "time_up");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cap, request]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns.length, busy]);

  const send = () => {
    const text = draft.trim();
    if (!text || busy || ended || remaining === 0) return;
    setDraft("");
    void request(text, null);
  };

  if (needsKey) {
    return (
      <div className="rounded-2xl border border-line bg-paper-warm p-6">
        <h3 className="mb-1.5 font-bold">{COACH_NAME} isn&apos;t connected yet</h3>
        <p className="mb-4 text-[14.5px] text-ink-soft">{error}</p>
        <button
          onClick={onClose}
          className="rounded-lg border border-line bg-white px-4 py-2 text-[14px] font-semibold hover:bg-paper-soft"
        >
          Back
        </button>
      </div>
    );
  }

  const low = remaining <= 120 && !ended;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar initials="K" size={30} variant="dark" />
          <div>
            <div className="text-[13.5px] font-bold leading-tight">{COACH_NAME}</div>
            <div className="text-[11.5px] text-ink-soft">{mode.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-bold tabular-nums ${
              low ? "bg-accent-soft text-accent-ink" : "bg-paper-warm text-ink-soft"
            }`}
            aria-live={low ? "polite" : "off"}
          >
            <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
            {ended ? fmt(ended.seconds) : fmt(remaining)}
          </span>
          {!ended && (
            <button
              onClick={() => void finish("learner")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold hover:bg-paper-warm"
            >
              <Square className="h-3 w-3" strokeWidth={2.5} />
              End session
            </button>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div className="max-h-[440px] min-h-[220px] space-y-3 overflow-y-auto px-5 py-5">
        {turns.map((t, i) =>
          t.role === "coach" ? (
            <p
              key={i}
              className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-paper-soft px-4 py-2.5 text-[14.5px] leading-snug"
            >
              {t.text}
            </p>
          ) : (
            <p
              key={i}
              className="ml-auto max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-brand px-4 py-2.5 text-[14.5px] leading-snug text-white"
            >
              {t.text}
            </p>
          ),
        )}
        {busy && (
          <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-paper-soft px-4 py-2.5 text-[13.5px] text-ink-soft">
            <span className="animate-pulse">{COACH_NAME} is thinking…</span>
          </p>
        )}
        {error && !ended && (
          <p className="rounded-xl border border-line bg-paper-warm px-4 py-2.5 text-[13.5px] text-ink-soft">
            {error} Your last message is still in the transcript; send again to retry.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer or summary */}
      {ended ? (
        <div className="border-t border-line bg-paper-warm px-5 py-4">
          <div className="mb-1 text-[12.5px] font-bold uppercase tracking-wider text-ink-soft">
            {ended.reason === "time_up" ? "Time's up" : "Session ended"} · {fmt(ended.seconds)}
          </div>
          <p className="mb-3 text-[14px] text-ink-soft">{ended.saved}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white hover:bg-brand-dark"
          >
            Practise again
          </button>
        </div>
      ) : (
        <div className="border-t border-line px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={
                remaining === 0
                  ? "Time is up."
                  : "Your turn. Enter to send, Shift+Enter for a new line."
              }
              disabled={remaining === 0}
              className="min-h-[52px] flex-1 resize-y rounded-xl border border-line px-3.5 py-2.5 text-[14.5px] outline-none focus:border-brand disabled:bg-paper-warm"
            />
            <button
              onClick={send}
              disabled={busy || !draft.trim() || remaining === 0}
              className="inline-flex h-[44px] items-center gap-1.5 rounded-lg bg-brand px-4 text-[14px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              <Send className="h-4 w-4" strokeWidth={2.25} />
              Send
            </button>
          </div>
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Finish the whole thought before you send; {COACH_NAME} replies once per turn.
            Up to {mode.minutes} minutes — real speaking situations are time-boxed.
          </p>
        </div>
      )}
    </div>
  );
}
