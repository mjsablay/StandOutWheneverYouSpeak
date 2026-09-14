"use client";

/**
 * One topic, end to end: the prompts to think with, the member's own Frame
 * and Masterful Notes, and a session with Katya that starts from what they
 * saved. Barry's operating principle, in three panels:
 *
 *   USE THE PREPARATION TOOLS TO BUILD IT.   (left: the prep)
 *   USE KATYA TO TEST IT.                     (right: the session)
 *   USE PRACTICE TO MASTER IT.                (the sessions list below)
 */

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Layers,
  ListTree,
  Mic,
  Minus,
  Save,
  type LucideIcon,
} from "lucide-react";
import { Wrap, Section, Eyebrow, PageSkeleton } from "@/components/ui";
import CircleLocked from "@/components/CircleLocked";
import KatyaSession from "@/components/KatyaSession";
import { useAccess } from "@/lib/access";
import { COACH_NAME } from "@/lib/site";
import {
  KATYA_MODES,
  KATYA_PRINCIPLE,
  KATYA_PROMISES,
  PREP_LABELS,
  PREP_PROMPTS,
  type KatyaModeSpec,
  type PrepField,
} from "@/lib/katya";
import { usePrep, useTopicSessions, type Prep } from "@/lib/prep";
import type { Topic } from "@/lib/topics";

const MODE_ICON: Record<KatyaModeSpec["id"], LucideIcon> = {
  frame: Layers,
  notes: ListTree,
  delivery: Mic,
};

type Draft = Pick<Prep, "audience" | "frame" | "notes">;

const fmtDuration = (s: number | null) =>
  s === null ? "" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });

export default function TopicWorkspace({
  topic,
  sectionName,
}: {
  topic: Topic;
  sectionName: string | null;
}) {
  const access = useAccess();
  const { prep, loading, saving, error, save } = usePrep(topic.id);
  const sessions = useTopicSessions(topic.id);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [active, setActive] = useState<KatyaModeSpec | null>(null);
  const [run, setRun] = useState(0);

  if (access.loading) return <PageSkeleton />;
  if (!access.fullAccess) {
    return (
      <Section>
        <Wrap>
          <CircleLocked
            signedIn={access.signedIn}
            title={topic.title}
            body={`Speakers' Circle members frame this topic with the Presentation Pyramid, turn it into Masterful Notes, and bring it to ${COACH_NAME} for coaching.`}
            bullets={[
              "Eighty topics across eight themes, each with four prompts to think with",
              "A workspace for your Frame and Masterful Notes on every topic",
              `Coaching from ${COACH_NAME} on your Frame, your Notes and your Delivery`,
            ]}
          />
        </Wrap>
      </Section>
    );
  }

  const current: Draft = draft ?? prep;
  const dirty =
    draft !== null &&
    (draft.audience !== prep.audience ||
      draft.frame !== prep.frame ||
      draft.notes !== prep.notes);

  const update = (field: PrepField, value: string) =>
    setDraft({ ...current, [field]: value });

  const commit = async () => {
    if (!dirty || !draft) return true;
    const r = await save(draft);
    if (!r.error) setDraft(null);
    return !r.error;
  };

  const has = (f: PrepField) => Boolean(prep[f].trim());

  const start = async (mode: KatyaModeSpec) => {
    const ok = await commit();
    if (!ok) return;
    setRun((n) => n + 1);
    setActive(mode);
  };

  const savedLabel = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : prep.updated_at
        ? `Saved ${fmtDate(prep.updated_at)}`
        : "Nothing saved yet";

  return (
    <Section>
      <Wrap>
        <Link
          href="/topics"
          className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          All topics
        </Link>

        <div className="mb-10 max-w-[760px]">
          <Eyebrow>Speakers&apos; Circle{sectionName ? ` · ${sectionName}` : ""}</Eyebrow>
          <h1 className="display text-[clamp(28px,4.2vw,46px)]">{topic.title}</h1>
          {topic.brief && (
            <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">{topic.brief}</p>
          )}
          <div className="mt-6 rounded-2xl border border-line bg-paper-warm p-5">
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-soft">
              Prompts to think with — use any that help
            </div>
            <ol className="space-y-1.5 text-[14.5px]">
              {topic.prompts.map((p, i) => (
                <li key={p} className="flex gap-3">
                  <span className="w-4 shrink-0 text-ink-soft">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[13px] text-ink-soft">
              Aim for two to three minutes. Headline first.
            </p>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* ---------- Preparation ---------- */}
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">Your preparation</h2>
              <span className="text-[12.5px] text-ink-soft">{savedLabel}</span>
            </div>
            <p className="mb-6 text-[14px] leading-relaxed text-ink-soft">
              Build these offline with Barry&apos;s two prompts, then paste them here.
              {" "}{COACH_NAME} reads what you save, so she never asks you to repeat it and
              never guesses at what you meant.
            </p>

            {loading ? (
              <div className="h-40 animate-pulse rounded-xl bg-paper-warm" />
            ) : (
              <div className="space-y-6">
                <Field
                  label={PREP_LABELS.audience}
                  hint="Who is listening, what the situation is, and what you want them to know, believe or do. One or two lines."
                  value={current.audience}
                  onChange={(v) => update("audience", v)}
                  onBlur={commit}
                  rows={2}
                  placeholder="The leadership team, at the end of a quarterly review. I want them to approve a three-month pilot."
                  maxLength={400}
                />
                <Field
                  label={PREP_LABELS.frame}
                  hint={`Prompt #${PREP_PROMPTS[0].number} — ${PREP_PROMPTS[0].name}. ${PREP_PROMPTS[0].does}`}
                  value={current.frame}
                  onChange={(v) => update("frame", v)}
                  onBlur={commit}
                  rows={9}
                  placeholder={
                    "Headline: …\n\nWhat: …\nWhy: …\nHow: …\n\nEvidence: …\n\nClose: …"
                  }
                  maxLength={8000}
                />
                <Field
                  label={PREP_LABELS.notes}
                  hint={`Prompt #${PREP_PROMPTS[1].number} — ${PREP_PROMPTS[1].name}. ${PREP_PROMPTS[1].does} Indentation is kept exactly as you type it.`}
                  value={current.notes}
                  onChange={(v) => update("notes", v)}
                  onBlur={commit}
                  rows={12}
                  mono
                  placeholder={
                    "• The one thing to remember\n    • why it matters to you\n        • the moment it became clear\n\n• What I'm asking for"
                  }
                  maxLength={12000}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => void commit()}
                    disabled={!dirty || saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" strokeWidth={2.25} />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  {error && <span className="text-[13px] text-ink-soft">Couldn&apos;t save: {error}</span>}
                </div>
              </div>
            )}
          </div>

          {/* ---------- Katya ---------- */}
          <div className="space-y-6">
            {active ? (
              <KatyaSession
                key={`${active.id}-${run}`}
                topicId={topic.id}
                mode={active}
                onEnded={sessions.reload}
                onClose={() => setActive(null)}
              />
            ) : (
              <div className="rounded-2xl border border-brand bg-white p-6 sm:p-7">
                <h2 className="mb-1 text-lg font-bold">Practise with {COACH_NAME}</h2>
                <p className="mb-5 text-[14px] leading-relaxed text-ink-soft">
                  {KATYA_PRINCIPLE} Start wherever you need help; she checks she has what
                  that mode needs before coaching begins.
                </p>

                <div className="space-y-3">
                  {KATYA_MODES.map((m) => {
                    const Icon = MODE_ICON[m.id];
                    return (
                      <div
                        key={m.id}
                        className={`rounded-xl border p-4 ${
                          m.voiceOnly ? "border-line bg-paper-warm" : "border-line bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                            <Icon className="h-4 w-4" strokeWidth={2.25} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                              <h3 className="text-[15.5px] font-bold">{m.name}</h3>
                              <span className="text-[12.5px] text-ink-soft">
                                up to {m.minutes} min
                              </span>
                            </div>
                            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">
                              {m.purpose}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {m.wants.map((f) => (
                                <span
                                  key={f}
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${
                                    has(f)
                                      ? "bg-accent-soft text-accent-ink"
                                      : "bg-paper-warm text-ink-soft"
                                  }`}
                                >
                                  {has(f) ? (
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  ) : (
                                    <Minus className="h-3 w-3" strokeWidth={3} />
                                  )}
                                  {PREP_LABELS[f]} {has(f) ? "on file" : "not yet"}
                                </span>
                              ))}
                            </div>
                            {!m.wants.every(has) && !m.voiceOnly && (
                              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                                {m.without}
                              </p>
                            )}
                            <div className="mt-3">
                              {m.voiceOnly ? (
                                <span className="text-[12.5px] font-semibold text-ink-soft">
                                  Voice only — arrives with the voice coach.
                                </span>
                              ) : (
                                <button
                                  onClick={() => void start(m)}
                                  disabled={saving}
                                  className="rounded-lg bg-brand px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                                >
                                  Start{dirty ? " (saves your changes first)" : ""}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ul className="mt-6 space-y-2 border-t border-line pt-5 text-[13.5px] text-ink-soft">
                  {KATYA_PROMISES.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12.5px] text-ink-soft">
                  Text session. {COACH_NAME} coaches what you type; the voice version, with
                  Push to Talk and delivery coaching, follows the same script.
                </p>
              </div>
            )}

            {/* ---------- Sessions ---------- */}
            <div className="rounded-2xl border border-line bg-paper-warm p-6">
              <h2 className="mb-1 text-[15px] font-bold">Your sessions on this topic</h2>
              {sessions.loading ? (
                <div className="h-10 animate-pulse rounded-lg bg-white" />
              ) : sessions.rows.length === 0 ? (
                <p className="text-[13.5px] text-ink-soft">
                  None yet. Success is not &ldquo;I received feedback.&rdquo; It is &ldquo;I
                  improved my next attempt.&rdquo;
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {sessions.rows.map((s) => {
                    const m = KATYA_MODES.find((x) => x.id === s.mode);
                    return (
                      <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[13.5px]">
                          <span className="font-semibold">{m?.name ?? "Session"}</span>
                          <span className="text-ink-soft">
                            {fmtDate(s.created_at)}
                            {s.duration_seconds !== null ? ` · ${fmtDuration(s.duration_seconds)}` : ""}
                            {s.ended_reason === "time_up" ? " · time's up" : ""}
                          </span>
                        </div>
                        {s.closing && (
                          <p className="mt-1 line-clamp-2 text-[13px] italic text-ink-soft">
                            &ldquo;{s.closing}&rdquo;
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Wrap>
    </Section>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  onBlur,
  rows,
  placeholder,
  maxLength,
  mono = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void | Promise<unknown>;
  rows: number;
  placeholder: string;
  maxLength: number;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[14px] font-bold">{label}</span>
      <span className="mb-2 block text-[12.5px] leading-relaxed text-ink-soft">{hint}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => void onBlur()}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        spellCheck={!mono}
        className={`w-full resize-y rounded-xl border border-line bg-white px-3.5 py-2.5 leading-relaxed outline-none placeholder:text-ink-soft/60 focus:border-brand ${
          mono ? "font-mono text-[13px] whitespace-pre" : "text-[14.5px]"
        }`}
      />
    </label>
  );
}
