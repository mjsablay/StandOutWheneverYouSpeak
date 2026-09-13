"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Handshake,
  Megaphone,
  MessageSquare,
  Newspaper,
  Send,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Requesting a conversation — three short steps instead of one long form.
 *
 * The same nine fields land in meeting_requests as before; the admin console
 * still scores on intent, team size and timeframe. What changed is the
 * experience: one decision at a time, the questions that don't apply never
 * appear, and the brief assembles in front of you as you answer.
 */

const INTENTS = [
  { value: "individual_coaching", label: "Coaching for myself", hint: "One-to-one work on your own speaking", icon: User },
  { value: "team_training", label: "Training for my team", hint: "A workshop or programme for a group", icon: Users },
  { value: "speaking_engagement", label: "Book Barry to speak", hint: "Keynote or session at your event", icon: Megaphone },
  { value: "partnership", label: "Partnership", hint: "Working together commercially", icon: Handshake },
  { value: "media", label: "Media or press", hint: "Interviews and features", icon: Newspaper },
  { value: "other", label: "Something else", hint: "Tell us in your own words", icon: MessageSquare },
] as const;

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];
const TIMEFRAMES = ["This month", "Next 1–3 months", "3–6 months", "Just exploring"];
const PREFERS = ["Video call", "Phone", "In person (GTA)"];

const STEPS = ["What", "Context", "You"] as const;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand";

type Intent = (typeof INTENTS)[number]["value"];

function Pills({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(on ? "" : o)}
            aria-pressed={on}
            className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition ${
              on
                ? "border-brand bg-brand text-white"
                : "border-line bg-white hover:border-brand hover:text-brand"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2.5">
      <div className="text-[15px] font-bold">{children}</div>
      {hint && <div className="text-[13px] text-ink-soft">{hint}</div>}
    </div>
  );
}

export default function MeetingRequestForm() {
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrg] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [prefers, setPrefers] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeam = intent === "team_training" || intent === "speaking_engagement";
  const intentMeta = INTENTS.find((i) => i.value === intent);

  // The brief, assembled from what has been chosen so far.
  const brief = [intentMeta?.label, isTeam && teamSize ? teamSize : null, timeframe, prefers].filter(Boolean);

  const stepValid =
    step === 0
      ? Boolean(intent)
      : step === 1
        ? true
        : name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && message.trim().length >= 10;

  const next = () => {
    setError(null);
    if (!stepValid) {
      setError(step === 0 ? "Choose what you'd like to talk about." : "A name, a working email, and a sentence about what you need.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    if (!stepValid || !intent) return next();
    setBusy(true);
    setError(null);

    const { error } = await supabase.from("meeting_requests").insert({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim() || null,
      role_title: roleTitle.trim() || null,
      intent,
      team_size: isTeam ? teamSize || null : null,
      timeframe: timeframe || null,
      prefers: prefers || null,
      availability: availability.trim() || null,
      message: message.trim(),
    });

    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 shadow-card sm:p-10">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Send className="h-5 w-5" strokeWidth={2} />
        </span>
        <h3 className="display mb-3 text-[clamp(26px,3vw,34px)]">
          Thanks, {name.trim().split(" ")[0]}. It&apos;s with us.
        </h3>
        <p className="max-w-[480px] text-[16px] leading-relaxed text-ink-soft">
          {intentMeta?.label} — we&apos;ll read it personally and reply to{" "}
          <strong className="text-ink">{email.trim()}</strong> with a few times
          that work, usually within two business days. Nothing is booked until
          you confirm one.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-white shadow-card">
      {/* Progress */}
      <div className="border-b border-line px-6 pt-6 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="display text-[22px]">Request a conversation</h2>
          <span className="text-[13px] font-semibold text-ink-soft">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className="flex-1 text-left disabled:cursor-default"
              aria-current={i === step ? "step" : undefined}
            >
              <span
                className={`block h-1.5 rounded-full transition ${
                  i <= step ? "bg-brand" : "bg-line"
                }`}
              />
              <span
                className={`mt-2 block pb-4 text-[12.5px] font-semibold ${
                  i === step ? "text-ink" : "text-ink-soft"
                }`}
              >
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The brief so far */}
      {brief.length > 0 && step > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper-soft px-6 py-3 text-[13px] sm:px-8">
          <span className="font-bold uppercase tracking-wider text-ink-soft">Your brief</span>
          {brief.map((b) => (
            <span key={b} className="rounded-full bg-white px-3 py-1 font-semibold shadow-card">
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="p-6 sm:p-8">
        {step === 0 && (
          <fieldset>
            <Label hint="Pick the closest — you can say more later.">What would you like to talk about?</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {INTENTS.map(({ value, label, hint, icon }) => {
                const Icon = icon as LucideIcon;
                const on = intent === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setIntent(value);
                      setError(null);
                      setStep(1);
                    }}
                    aria-pressed={on}
                    className={`group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card ${
                      on ? "border-brand bg-brand-soft" : "border-line bg-white hover:border-brand"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        on ? "bg-brand text-white" : "bg-brand-soft text-brand"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold">{label}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">{hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <div className="space-y-7">
            {isTeam && (
              <div>
                <Label>How many people?</Label>
                <Pills options={TEAM_SIZES} value={teamSize} onChange={setTeamSize} />
              </div>
            )}
            <div>
              <Label>When are you hoping to start?</Label>
              <Pills options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
            </div>
            <div>
              <Label>How would you like to meet?</Label>
              <Pills options={PREFERS} value={prefers} onChange={setPrefers} />
            </div>
            <div>
              <Label hint="Optional — it helps us suggest times that land.">Times that usually work for you</Label>
              <input
                maxLength={300}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={field}
                placeholder="Weekday mornings, or Tuesday and Thursday afternoons"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Your name</Label>
                <input
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <Label>Email</Label>
                <input
                  type="email"
                  required
                  maxLength={120}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label hint="Optional">Organisation</Label>
                <input
                  maxLength={100}
                  autoComplete="organization"
                  value={organization}
                  onChange={(e) => setOrg(e.target.value)}
                  className={field}
                />
              </div>
              <div>
                <Label hint="Optional">Your role</Label>
                <input
                  maxLength={80}
                  autoComplete="organization-title"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className={field}
                />
              </div>
            </div>
            <div>
              <Label hint="A sentence or two on the situation and what a good outcome looks like.">
                What would you like to get out of it?
              </Label>
              <textarea
                required
                rows={4}
                minLength={10}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${field} resize-y`}
              />
              <div className="mt-1.5 text-right text-[12.5px] text-ink-soft">
                {message.length} / 1000
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-5 text-[14px] font-medium text-brand">{error}</p>}

        {/* Footer controls — step one advances on its own when a tile is chosen */}
        {step > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14.5px] font-semibold text-ink-soft transition hover:bg-paper-soft hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-dark"
              >
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send request"}
                {!busy && <Send className="h-4 w-4" strokeWidth={2.5} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
