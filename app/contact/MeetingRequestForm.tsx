"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Meeting request form — replaces Calendly.
 *
 * Rather than handing out open calendar slots, this captures what the person
 * wants and how urgent it is, so requests can be reviewed and prioritised
 * before any time is committed. Those answers are also the qualification
 * signals an AI triage step will score later.
 */

const INTENTS = [
  {
    value: "individual_coaching",
    label: "Coaching for myself",
    hint: "One-to-one work on your own speaking",
  },
  {
    value: "team_training",
    label: "Training for my team",
    hint: "A workshop or programme for a group",
  },
  {
    value: "speaking_engagement",
    label: "Book Barry to speak",
    hint: "Keynote or session at your event",
  },
  {
    value: "partnership",
    label: "Partnership",
    hint: "Working together commercially",
  },
  { value: "media", label: "Media or press", hint: "Interviews and features" },
  { value: "other", label: "Something else", hint: "Tell us below" },
] as const;

const TEAM_SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];
const TIMEFRAMES = ["This month", "Next 1–3 months", "3–6 months", "Just exploring"];
const PREFERS = ["Video call", "Phone", "In person (GTA)"];

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[14.5px] text-ink outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand";

type Intent = (typeof INTENTS)[number]["value"];

export default function MeetingRequestForm() {
  const supabase = useMemo(() => createClient(), []);

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

  if (sent) {
    return (
      <div className="rounded-2xl border-2 border-accent bg-accent-soft p-8 text-center sm:p-10">
        <div className="mb-3 text-4xl">✅</div>
        <h3 className="mb-2 text-2xl font-extrabold">Request received</h3>
        <p className="mx-auto max-w-[440px] text-[15.5px] text-ink-soft">
          Thanks {name.split(" ")[0]}. We read every request personally and
          reply with a few times that work — usually within two business days.
        </p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent) return setError("Please choose what you'd like to talk about.");
    setBusy(true);
    setError(null);

    const { error } = await supabase.from("meeting_requests").insert({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim() || null,
      role_title: roleTitle.trim() || null,
      intent,
      team_size: teamSize || null,
      timeframe: timeframe || null,
      prefers: prefers || null,
      availability: availability.trim() || null,
      message: message.trim(),
    });

    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-7 sm:p-8">
      <h3 className="mb-1 text-[20px] font-extrabold tracking-tight">
        Request a conversation
      </h3>
      <p className="mb-6 text-[14.5px] text-ink-soft">
        Tell us what you need and we&apos;ll come back with times that suit.
      </p>

      {/* Intent */}
      <fieldset className="mb-6">
        <legend className="mb-2.5 text-[13px] font-semibold">
          What would you like to talk about?
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {INTENTS.map((i) => (
            <button
              key={i.value}
              type="button"
              onClick={() => setIntent(i.value)}
              className={`rounded-xl border p-3.5 text-left transition ${
                intent === i.value
                  ? "border-brand bg-brand-soft"
                  : "border-line hover:border-brand"
              }`}
            >
              <span className="block text-[14.5px] font-semibold">{i.label}</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-soft">
                {i.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Who */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mr-name" className="mb-1.5 block text-[13px] font-semibold">
            Your name
          </label>
          <input
            id="mr-name"
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Aisha Khan"
          />
        </div>
        <div>
          <label htmlFor="mr-email" className="mb-1.5 block text-[13px] font-semibold">
            Email
          </label>
          <input
            id="mr-email"
            type="email"
            required
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mr-org" className="mb-1.5 block text-[13px] font-semibold">
            Organisation{" "}
            <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input
            id="mr-org"
            maxLength={100}
            value={organization}
            onChange={(e) => setOrg(e.target.value)}
            className={field}
            placeholder="RBC"
          />
        </div>
        <div>
          <label htmlFor="mr-role" className="mb-1.5 block text-[13px] font-semibold">
            Your role{" "}
            <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input
            id="mr-role"
            maxLength={80}
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className={field}
            placeholder="L&D Manager"
          />
        </div>
      </div>

      {/* Qualification — only when it's relevant */}
      {isTeam && (
        <div className="mb-4">
          <label htmlFor="mr-size" className="mb-1.5 block text-[13px] font-semibold">
            How many people?
          </label>
          <select
            id="mr-size"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className={field}
          >
            <option value="">Select</option>
            {TEAM_SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mr-when" className="mb-1.5 block text-[13px] font-semibold">
            When are you hoping to start?
          </label>
          <select
            id="mr-when"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className={field}
          >
            <option value="">Select</option>
            {TIMEFRAMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mr-how" className="mb-1.5 block text-[13px] font-semibold">
            How would you like to meet?
          </label>
          <select
            id="mr-how"
            value={prefers}
            onChange={(e) => setPrefers(e.target.value)}
            className={field}
          >
            <option value="">Select</option>
            {PREFERS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="mr-avail" className="mb-1.5 block text-[13px] font-semibold">
          Times that usually work for you{" "}
          <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="mr-avail"
          maxLength={300}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className={field}
          placeholder="Weekday mornings, or Tuesday/Thursday afternoons"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="mr-msg" className="mb-1.5 block text-[13px] font-semibold">
          What would you like to get out of it?
        </label>
        <textarea
          id="mr-msg"
          required
          rows={4}
          minLength={10}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${field} resize-y`}
          placeholder="A sentence or two on the situation and what a good outcome looks like."
        />
        <div className="mt-1.5 text-right text-[12.5px] text-ink-soft">
          {message.length} / 1000
        </div>
      </div>

      {error && (
        <p className="mb-4 text-[14px] font-medium text-brand">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-accent px-6 py-3.5 text-[15.5px] font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send request"}
      </button>
      <p className="mt-3 text-center text-[13px] text-ink-soft">
        We reply with proposed times — nothing is booked until you confirm.
      </p>
    </form>
  );
}
