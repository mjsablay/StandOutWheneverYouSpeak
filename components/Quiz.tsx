"use client";

import Link from "next/link";
import { useState } from "react";
import { QUIZZES, QUIZ_PASS_MARK, type QuizQuestion } from "@/lib/quizzes";
import { useProgress } from "@/lib/progress";

function isCorrect(q: QuizQuestion, picked: string[]) {
  if (picked.length !== q.answers.length) return false;
  return q.answers.every((a) => picked.includes(a));
}

export default function Quiz({
  lessonSlug,
  nextHref,
  nextTitle,
}: {
  lessonSlug: string;
  nextHref: string | null;
  nextTitle: string | null;
}) {
  const questions = QUIZZES[lessonSlug];
  const { recordPass, progress } = useProgress();
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions?.length) return null;

  const previous = progress[lessonSlug];
  const total = questions.length;
  const correctCount = questions.reduce(
    (n, q, i) => n + (isCorrect(q, answers[i] ?? []) ? 1 : 0),
    0,
  );
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= QUIZ_PASS_MARK;
  const allAnswered = questions.every((_, i) => (answers[i] ?? []).length > 0);

  const toggle = (qi: number, key: string, multi: boolean) => {
    if (submitted) return;
    setAnswers((prev) => {
      const cur = prev[qi] ?? [];
      if (!multi) return { ...prev, [qi]: [key] };
      return {
        ...prev,
        [qi]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
      };
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">Lesson quiz</h3>
          <p className="text-[14px] text-ink-soft">
            {total} questions · {QUIZ_PASS_MARK}% to pass
            {nextTitle ? " and unlock the next lesson" : ""}
          </p>
        </div>
        {previous && !submitted && (
          <span className="rounded-full bg-accent-soft px-3 py-1.5 text-[12.5px] font-bold text-accent-ink">
            Passed · {previous.score}%
          </span>
        )}
      </div>

      <ol className="space-y-7">
        {questions.map((q, qi) => {
          const picked = answers[qi] ?? [];
          const right = submitted && isCorrect(q, picked);
          return (
            <li key={qi}>
              <div className="mb-3 flex gap-2.5">
                <span className="font-bold text-ink-soft">{qi + 1}.</span>
                <div className="flex-1">
                  <p className="font-semibold">{q.q}</p>
                  {q.multi && (
                    <p className="mt-0.5 text-[13px] text-ink-soft">
                      Select all that apply
                    </p>
                  )}
                </div>
                {submitted && (
                  <span
                    className={`flex-shrink-0 text-[13px] font-bold ${
                      right ? "text-accent-ink" : "text-brand"
                    }`}
                  >
                    {right ? "Correct" : "Review"}
                  </span>
                )}
              </div>

              <div className="ml-6 space-y-2">
                {q.options.map((o) => {
                  const chosen = picked.includes(o.key);
                  const isAnswer = q.answers.includes(o.key);
                  let cls =
                    "border-line bg-white hover:border-brand hover:bg-brand-soft";
                  if (submitted) {
                    if (isAnswer)
                      cls = "border-accent bg-accent-soft";
                    else if (chosen)
                      cls = "border-brand bg-brand-soft opacity-70";
                    else cls = "border-line bg-white opacity-55";
                  } else if (chosen) {
                    cls = "border-brand bg-brand-soft";
                  }
                  return (
                    <button
                      key={o.key}
                      type="button"
                      disabled={submitted}
                      onClick={() => toggle(qi, o.key, q.multi)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] transition ${cls}`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-[11px] font-bold ${
                          q.multi ? "rounded-md" : "rounded-full"
                        } ${
                          chosen || (submitted && isAnswer)
                            ? "bg-brand text-white"
                            : "border border-line text-ink-soft"
                        }`}
                      >
                        {o.key}
                      </span>
                      <span className="flex-1">{o.text}</span>
                      {submitted && isAnswer && (
                        <span className="text-accent-ink">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Actions / result */}
      {!submitted ? (
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              setSubmitted(true);
              const s = Math.round((correctCount / total) * 100);
              if (s >= QUIZ_PASS_MARK) recordPass(lessonSlug, s);
            }}
            disabled={!allAnswered}
            className="rounded-lg bg-brand px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
          >
            Submit answers
          </button>
          {!allAnswered && (
            <span className="text-[14px] text-ink-soft">
              Answer all {total} questions to submit.
            </span>
          )}
        </div>
      ) : (
        <div
          className={`mt-7 rounded-2xl border-2 p-6 ${
            passed
              ? "border-accent bg-accent-soft"
              : "border-brand bg-brand-soft"
          }`}
        >
          <div className="mb-2 flex flex-wrap items-baseline gap-3">
            <span className="text-[34px] font-extrabold leading-none">
              {score}%
            </span>
            <span className="text-[15px] font-semibold">
              {correctCount} of {total} correct
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[12.5px] font-bold ${
                passed
                  ? "bg-accent text-ink"
                  : "bg-white text-brand"
              }`}
            >
              {passed ? "Passed" : `Not yet — ${QUIZ_PASS_MARK}% needed`}
            </span>
          </div>

          <p className="mb-5 text-[14.5px] text-ink-soft">
            {passed
              ? nextTitle
                ? "Nicely done. The next lesson is unlocked."
                : "Nicely done — that's the last quiz in this course."
              : "Review the highlighted answers above, rewatch the lesson, and try again."}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="rounded-lg border border-line bg-white px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
            >
              {passed ? "Retake quiz" : "Try again"}
            </button>
            {passed && nextHref && (
              <Link
                href={nextHref}
                className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
              >
                Continue to {nextTitle} →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { isCorrect };
export const hasQuiz = (slug: string) => Boolean(QUIZZES[slug]?.length);
