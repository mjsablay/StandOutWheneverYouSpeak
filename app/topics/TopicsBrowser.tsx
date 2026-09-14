"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Shuffle } from "lucide-react";
import { SectionHead } from "@/components/ui";
import CircleLocked from "@/components/CircleLocked";
import { useAccess } from "@/lib/access";
import { COACH_NAME } from "@/lib/site";
import {
  PRACTICE_STEPS,
  SELF_INTRODUCTION,
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
 * Every topic opens a workspace (/topics/[id]) where the member saves their
 * Frame and Masterful Notes and runs a session with Katya from them.
 */

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13.5px] text-ink-soft">Aim for two to three minutes. Headline first.</span>
            <Link
              href={`/topics/${topic.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-brand-dark"
            >
              Open the workspace
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
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
  if (!access.fullAccess) {
    return (
      <CircleLocked
        signedIn={access.signedIn}
        title={`${TOPIC_COUNT} topics to embrace, practise, master.`}
        body={`Knowing the techniques is the first step. Mastering them comes from putting them into practice — a focused two-to-three-minute presentation, framed with the Presentation Pyramid, delivered from Masterful Notes, and brought to ${COACH_NAME} for coaching.`}
        bullets={[
          "Eighty topics across eight themes, each with four prompts to think with",
          "A workspace for your Frame and Masterful Notes on every topic",
          `Coaching from ${COACH_NAME} on your Frame, your Notes and your Delivery`,
        ]}
      />
    );
  }

  return (
    <>
      <SectionHead
        eyebrow="Speakers' Circle"
        title={`${TOPIC_COUNT} topics. Embrace, practise, master.`}
        sub={`Choose a topic that interests you, connects with your experience, or simply makes you curious. Then frame it, make your notes, practise, and bring it to ${COACH_NAME}.`}
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

      {/* The self-introduction: where members first meet Katya */}
      <Link
        href={`/topics/${SELF_INTRODUCTION.id}`}
        className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand bg-brand-soft px-5 py-4 transition hover:bg-brand-glow/60"
      >
        <div>
          <div className="text-[12px] font-bold uppercase tracking-wider text-brand">
            Start here
          </div>
          <div className="text-[15.5px] font-semibold">{SELF_INTRODUCTION.title}</div>
          <div className="text-[13.5px] text-ink-soft">{SELF_INTRODUCTION.brief}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand">
          Open the workspace
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </Link>

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
        Every workspace holds your Frame and Masterful Notes and runs a text
        session with {COACH_NAME} from them: Coach My Frame and Review My Masterful
        Notes today. Coach My Delivery, which needs to hear you, arrives with the
        voice coach.
      </p>
    </>
  );
}
