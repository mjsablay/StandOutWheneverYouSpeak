"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, Shuffle } from "lucide-react";
import { SectionHead, Btn, Check } from "@/components/ui";
import { useAccess } from "@/lib/access";
import { COACH_NAME } from "@/lib/site";
import {
  PRACTICE_STEPS,
  TOPIC_COUNT,
  TOPIC_SECTIONS,
  type Topic,
} from "@/lib/topics";

/**
 * The Speakers' Circle practice engine, as Barry drew it: choose → frame →
 * notes → practise → review → get coached. The topics and their prompts are
 * his; the page's job is to make picking one and starting feel like a
 * two-minute decision rather than a homework assignment.
 *
 * Coaching by Katya is the last step and is not live yet — the page says so
 * rather than pretending, and points at the preview of what it will be.
 */

function Locked({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="rounded-3xl bg-brand px-6 py-14 text-white sm:px-12">
      <div className="mx-auto max-w-[620px]">
        <span className="mb-5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
          Speakers&apos; Circle
        </span>
        <h1 className="mb-4 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight">
          {TOPIC_COUNT} topics to embrace, practise, master.
        </h1>
        <p className="mb-7 text-[17px] text-white/85">
          Knowing the techniques is the first step. Mastering them comes from
          putting them into practice — a focused two-to-three-minute
          presentation, framed with the Presentation Pyramid, delivered from
          Masterful Notes, and brought to {COACH_NAME} for coaching.
        </p>
        <ul className="mb-8 space-y-2 text-[15px] text-white/90">
          {[
            "Eighty topics across eight themes, each with four prompts to think with",
            "The Presentation Pyramid and Masterful Notes prompts, included",
            `Coaching and a rubric score from ${COACH_NAME} on every delivery`,
          ].map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check /> {f}
            </li>
          ))}
        </ul>
        <Btn href={signedIn ? "/pricing" : "/request"} variant="accent">
          {signedIn ? "See Speakers' Circle" : "Request a place"}
        </Btn>
      </div>
    </div>
  );
}

function TopicCard({ topic, open, onToggle }: { topic: Topic; open: boolean; onToggle: () => void }) {
  return (
    <div
      className={`rounded-2xl border bg-white transition ${
        open ? "border-brand" : "border-line hover:border-ink-soft/40"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="text-[15.5px] font-semibold leading-snug">{topic.title}</div>
          {topic.brief && (
            <div className="mt-1 text-[13.5px] text-ink-soft">{topic.brief}</div>
          )}
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-ink-soft transition ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="border-t border-line px-5 pb-5 pt-4">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-ink-soft">
            Prompts to think with — use any that help
          </div>
          <ol className="mb-5 space-y-1.5 text-[14.5px]">
            {topic.prompts.map((p, i) => (
              <li key={p} className="flex gap-3">
                <span className="w-4 shrink-0 text-ink-soft">{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-3 text-[13.5px] text-ink-soft">
            <span>Aim for two to three minutes. Headline first.</span>
            <Link
              href="/courses/leadership-voice/lessons/masterful-notes-delivered/practice"
              className="font-semibold text-brand hover:underline"
            >
              Preview coaching with {COACH_NAME} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopicsBrowser() {
  const access = useAccess();
  const [section, setSection] = useState<string>(TOPIC_SECTIONS[0].key);
  const [openId, setOpenId] = useState<string | null>(null);

  const current = useMemo(
    () => TOPIC_SECTIONS.find((s) => s.key === section) ?? TOPIC_SECTIONS[0],
    [section],
  );

  const surprise = () => {
    const all = TOPIC_SECTIONS.flatMap((s) => s.topics.map((t) => ({ t, key: s.key })));
    const pick = all[Math.floor(Math.random() * all.length)];
    setSection(pick.key);
    setOpenId(pick.t.id);
  };

  if (access.loading) return null;
  if (!access.fullAccess) return <Locked signedIn={access.signedIn} />;

  return (
    <>
      <SectionHead
        eyebrow="Speakers' Circle"
        title={`${TOPIC_COUNT} topics. Embrace, practise, master.`}
        sub="Choose a topic that interests you, connects with your experience, or simply makes you curious. Then frame it, make your notes, practise, and bring it to Katya."
      />

      {/* The process — six steps, in Barry's words */}
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-line bg-paper-warm p-5">
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-[15px] font-bold">{s.title}</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TOPIC_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setSection(s.key);
                setOpenId(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-[13.5px] font-semibold transition ${
                section === s.key
                  ? "bg-brand text-white"
                  : "border border-line bg-white hover:bg-paper-warm"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button
          onClick={surprise}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-1.5 text-[13.5px] font-semibold hover:bg-paper-warm"
        >
          <Shuffle className="h-3.5 w-3.5" strokeWidth={2} />
          Pick one for me
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {current.topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            open={openId === t.id}
            onToggle={() => setOpenId(openId === t.id ? null : t.id)}
          />
        ))}
      </div>

      <p className="mt-8 text-[13.5px] text-ink-soft">
        Coaching by {COACH_NAME} on these topics arrives with the voice coach.
        Until then, steps one to five are the work — record yourself, review
        against the rubric, and bring your best take to a practice night.
      </p>
    </>
  );
}
