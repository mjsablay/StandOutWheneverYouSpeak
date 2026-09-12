"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Wrap, Section } from "@/components/ui";
import Turnstile, { captchaEnabled } from "@/components/Turnstile";
import {
  CONTEXTS,
  COURSE_INTERESTS,
  SPEAKING_FREQUENCIES,
  LIMITS,
  validateRequest,
  type WaitlistRequestInput,
} from "@/lib/waitlist-request";

/**
 * Requesting a place.
 *
 * This used to be the signup form: an email box that created a real account
 * and sent a magic link to whatever was typed in. Now it collects the answers
 * Tori actually decides on, and creates nothing at all until she invites you.
 *
 * The questions do double duty. They tell her who is asking, and they are the
 * part a script can't fake convincingly — a bot can post an address, but the
 * answer to "what do you want to get better at" gives it away.
 */

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[15px] text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-brand";
const labelCls = "mb-1.5 block text-[13px] font-semibold";
const hintCls = "mt-1.5 text-[13px] text-ink-soft";
const errCls = "mt-1.5 text-[13px] font-medium text-brand";

type Form = Partial<WaitlistRequestInput>;

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={errCls}>{error}</p>
      ) : hint ? (
        <p className={hintCls}>{hint}</p>
      ) : null}
    </div>
  );
}

export default function RequestPage() {
  const [form, setForm] = useState<Form>({});
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"sent" | "already" | null>(null);
  const [captcha, setCaptcha] = useState<string | null>(null);

  const onToken = useCallback((t: string | null) => setCaptcha(t), []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (done) {
    return (
      <Section>
        <Wrap className="max-w-[620px]">
          <div className="rounded-2xl border-2 border-accent bg-accent-soft p-8 sm:p-10">
            <h1 className="mb-3 text-[28px] font-extrabold tracking-tight">
              {done === "already"
                ? "You're already on the list"
                : "Thanks — you're on the list"}
            </h1>
            <p className="mb-4 text-[16px] text-ink-soft">
              {done === "already"
                ? "We already have a request from that address, so there's nothing more to do. Your place is held."
                : "Barry and Michael read every request. We're opening in small groups so each one gets proper attention, which means there may be a wait."}
            </p>
            <p className="mb-7 text-[16px] text-ink-soft">
              When there&apos;s a place for you, we&apos;ll email an invitation
              — that&apos;s the only message you&apos;ll get from us until then.
              Setting up your account takes a few seconds from that link.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
              >
                Meet the coaches
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border border-line bg-white px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-warm"
              >
                Book a call instead
              </Link>
            </div>
          </div>
        </Wrap>
      </Section>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const found = validateRequest(form);
    setProblems(found);
    if (Object.keys(found).length > 0) {
      document
        .getElementById(Object.keys(found)[0])
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setBusy(true);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, captchaToken: captcha }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      alreadyRequested?: boolean;
      error?: string;
      problems?: Record<string, string>;
    };
    setBusy(false);

    if (json.alreadyRequested) return setDone("already");
    if (json.ok) return setDone("sent");
    if (json.problems) return setProblems(json.problems);
    setError(json.error ?? "Something went wrong. Please try again.");
  };

  return (
    <Section>
      <Wrap className="max-w-[620px]">
        <div className="rounded-2xl border border-line bg-white p-8 sm:p-10">
          <h1 className="mb-2 text-[28px] font-extrabold tracking-tight">
            Request your place
          </h1>
          <p className="mb-8 text-[15px] text-ink-soft">
            We&apos;re approving members in small groups so every cohort gets
            proper attention. Tell us a little about yourself and we&apos;ll be
            in touch when there&apos;s a place. It takes about a minute, and
            there&apos;s no account to create yet.
          </p>

          <form onSubmit={submit} noValidate>
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-ink-soft">
              About you
            </h2>

            <div className="grid gap-x-4 sm:grid-cols-2">
              <Field id="first_name" label="First name" error={problems.first_name}>
                <input
                  id="first_name"
                  className={field}
                  maxLength={LIMITS.firstName}
                  autoComplete="given-name"
                  value={form.first_name ?? ""}
                  onChange={(e) => set("first_name", e.target.value)}
                />
              </Field>
              <Field id="last_name" label="Last name" error={problems.last_name}>
                <input
                  id="last_name"
                  className={field}
                  maxLength={LIMITS.lastName}
                  autoComplete="family-name"
                  value={form.last_name ?? ""}
                  onChange={(e) => set("last_name", e.target.value)}
                />
              </Field>
            </div>

            <Field
              id="email"
              label="Email"
              hint="Where we'll send your invitation. Nothing else — no newsletter."
              error={problems.email}
            >
              <input
                id="email"
                type="email"
                className={field}
                maxLength={LIMITS.email}
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>

            <Field
              id="context"
              label="Which best describes you?"
              error={problems.context}
            >
              <select
                id="context"
                className={field}
                value={form.context ?? ""}
                onChange={(e) =>
                  set("context", e.target.value as WaitlistRequestInput["context"])
                }
              >
                <option value="">Choose one</option>
                {CONTEXTS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-x-4 sm:grid-cols-2">
              <Field id="organisation" label="School or company (optional)">
                <input
                  id="organisation"
                  className={field}
                  maxLength={LIMITS.organisation}
                  autoComplete="organization"
                  value={form.organisation ?? ""}
                  onChange={(e) => set("organisation", e.target.value)}
                />
              </Field>
              <Field id="role_title" label="Your role (optional)">
                <input
                  id="role_title"
                  className={field}
                  maxLength={LIMITS.roleTitle}
                  autoComplete="organization-title"
                  value={form.role_title ?? ""}
                  onChange={(e) => set("role_title", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-x-4 sm:grid-cols-2">
              <Field id="location" label="Where you're based (optional)">
                <input
                  id="location"
                  className={field}
                  maxLength={LIMITS.location}
                  placeholder="Toronto, ON"
                  value={form.location ?? ""}
                  onChange={(e) => set("location", e.target.value)}
                />
              </Field>
              <Field id="linkedin_url" label="LinkedIn (optional)">
                <input
                  id="linkedin_url"
                  className={field}
                  maxLength={LIMITS.linkedin}
                  placeholder="linkedin.com/in/you"
                  value={form.linkedin_url ?? ""}
                  onChange={(e) => set("linkedin_url", e.target.value)}
                />
              </Field>
            </div>

            <h2 className="mb-4 mt-8 border-t border-line pt-8 text-[13px] font-bold uppercase tracking-wider text-ink-soft">
              What you want from it
            </h2>

            <Field
              id="course_interest"
              label="Which course interests you?"
              error={problems.course_interest}
            >
              <select
                id="course_interest"
                className={field}
                value={form.course_interest ?? ""}
                onChange={(e) =>
                  set(
                    "course_interest",
                    e.target.value as WaitlistRequestInput["course_interest"],
                  )
                }
              >
                <option value="">Choose one</option>
                {COURSE_INTERESTS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="speaking_frequency"
              label="How often do you speak in front of people? (optional)"
            >
              <select
                id="speaking_frequency"
                className={field}
                value={form.speaking_frequency ?? ""}
                onChange={(e) =>
                  set(
                    "speaking_frequency",
                    (e.target.value ||
                      null) as WaitlistRequestInput["speaking_frequency"],
                  )
                }
              >
                <option value="">Prefer not to say</option>
                {SPEAKING_FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="goal"
              label="What do you want to get better at?"
              hint="A sentence or two. This is the part we actually read."
              error={problems.goal}
            >
              <textarea
                id="goal"
                rows={4}
                className={`${field} resize-y`}
                maxLength={LIMITS.goal}
                placeholder="I freeze when someone interrupts me mid-point, and I have a conference talk in March."
                value={form.goal ?? ""}
                onChange={(e) => set("goal", e.target.value)}
              />
            </Field>

            <Field id="referral" label="How did you hear about us? (optional)">
              <input
                id="referral"
                className={field}
                maxLength={LIMITS.referral}
                value={form.referral ?? ""}
                onChange={(e) => set("referral", e.target.value)}
              />
            </Field>

            <Turnstile onToken={onToken} />

            {error && (
              <p className="mb-4 text-[14px] font-medium text-brand">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy || (captchaEnabled() && !captcha)}
              className="w-full rounded-lg bg-accent px-5 py-3.5 text-[15.5px] font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-60"
            >
              {busy ? "Sending…" : "Request my place"}
            </button>

            <p className="mt-4 text-center text-[13px] text-ink-soft">
              Already been invited?{" "}
              <Link href="/signin" className="font-semibold text-brand hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </Wrap>
    </Section>
  );
}
