"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, LogIn, ScanLine, CircleHelp, Bot, RefreshCw } from "lucide-react";
import { Avatar } from "@/components/ui";
import { initialsOf } from "@/lib/mock-auth";
import {
  useWaitlist,
  isRealPerson,
  PROVIDER_LABEL,
  VERIFICATION_LABEL,
  VERIFICATION_MEANING,
  VERIFICATION_ORDER,
  type Verification,
  type WaitlistRow,
} from "@/lib/waitlist";

/**
 * Waitlist triage.
 *
 * Sorted by how much evidence there is that the account belongs to a person,
 * because that — not the signup date — is what decides who to approve.
 */

const ICON: Record<Verification, typeof ShieldCheck> = {
  oauth: ShieldCheck,
  signed_in: LogIn,
  link_opened: ScanLine,
  unverified: CircleHelp,
};

const STYLE: Record<Verification, string> = {
  oauth: "border-accent bg-accent-soft text-accent-ink",
  signed_in: "border-accent bg-accent-soft text-accent-ink",
  link_opened: "border-line bg-paper-warm text-ink-soft",
  unverified: "border-line bg-paper-warm text-ink-soft",
};

const dateOf = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

function Row({
  row,
  busy,
  onApprove,
  onDecline,
}: {
  row: WaitlistRow;
  busy: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const Icon = ICON[row.verification];

  return (
    <div className="flex flex-wrap items-center gap-4 px-6 py-4">
      <Avatar
        initials={initialsOf(row.display_name || row.email)}
        size={40}
        src={row.avatar_url}
      />

      <div className="min-w-[200px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold">
            {row.display_name || row.email.split("@")[0]}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLE[row.verification]}`}
          >
            <Icon className="h-3 w-3" strokeWidth={2.5} />
            {VERIFICATION_LABEL[row.verification]}
          </span>
        </div>
        <div className="mt-0.5 text-[13.5px] text-ink-soft">{row.email}</div>

        {row.automation_signals.length > 0 && (
          <div className="mt-1.5 flex items-start gap-1.5 text-[12.5px] text-ink-soft">
            <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{row.automation_signals.join(" · ")}</span>
          </div>
        )}
      </div>

      <div className="min-w-[150px] text-[13px] text-ink-soft">
        <div>{PROVIDER_LABEL[row.provider] ?? row.provider}</div>
        <div>Requested {dateOf(row.signed_up_at)}</div>
        <div>
          {row.last_sign_in_at
            ? `Last here ${dateOf(row.last_sign_in_at)}`
            : "Never signed in"}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={busy}
          className="rounded-lg bg-brand px-3.5 py-1.5 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          Approve
        </button>
        <button
          onClick={onDecline}
          disabled={busy}
          className="rounded-lg border border-line px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:bg-paper-warm disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

export default function Waitlist({
  isAdmin,
  adminId,
  onChange,
}: {
  isAdmin: boolean;
  adminId: string;
  onChange: () => void;
}) {
  const { rows, loading, error, reload, setStatus } = useWaitlist(isAdmin);
  const [filter, setFilter] = useState<Verification | "all">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const pending = useMemo(
    () => rows.filter((r) => r.status === "pending"),
    [rows],
  );

  const counts = useMemo(() => {
    const c = { oauth: 0, signed_in: 0, link_opened: 0, unverified: 0 };
    pending.forEach((r) => (c[r.verification] += 1));
    return c;
  }, [pending]);

  const people = counts.oauth + counts.signed_in;
  const unproven = counts.link_opened + counts.unverified;

  const visible = useMemo(() => {
    const list =
      filter === "all" ? pending : pending.filter((r) => r.verification === filter);
    return [...list].sort(
      (a, b) =>
        VERIFICATION_ORDER.indexOf(a.verification) -
          VERIFICATION_ORDER.indexOf(b.verification) ||
        b.signed_up_at.localeCompare(a.signed_up_at),
    );
  }, [pending, filter]);

  const act = async (ids: string[], status: "approved" | "declined") => {
    setBusy(ids[0] ?? "bulk");
    setActionError(null);
    const res = await setStatus(ids, status, adminId);
    if (res.error) setActionError(res.error);
    else onChange();
    setBusy(null);
  };

  if (!isAdmin) return null;

  return (
    <div className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">Waitlist</h2>
          <p className="mt-1 text-[14px] text-ink-soft">
            {loading
              ? "Checking who's real…"
              : pending.length === 0
                ? "Nobody waiting — the queue is clear."
                : `${pending.length} waiting. ${people} ${people === 1 ? "has" : "have"} shown evidence of being a person; ${unproven} ${unproven === 1 ? "has" : "have"} not.`}
          </p>
        </div>
        <button
          onClick={() => reload()}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-1.5 text-[13.5px] font-semibold hover:bg-paper-warm"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Refresh
        </button>
      </div>

      {/* What each level actually means — the whole point of this screen. */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {VERIFICATION_ORDER.map((v) => {
          const Icon = ICON[v];
          const active = filter === v;
          return (
            <button
              key={v}
              onClick={() => setFilter(active ? "all" : v)}
              className={`rounded-2xl border p-4 text-left transition ${
                active ? "border-brand bg-brand-soft" : "border-line bg-white hover:bg-paper-warm"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-ink-soft" strokeWidth={2} />
                <span className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft">
                  {VERIFICATION_LABEL[v]}
                </span>
              </div>
              <div className="text-[26px] font-semibold leading-none">
                {counts[v]}
              </div>
              <p className="mt-2 text-[12.5px] leading-snug text-ink-soft">
                {VERIFICATION_MEANING[v]}
              </p>
            </button>
          );
        })}
      </div>

      {unproven > 0 && (
        <div className="mb-5 rounded-2xl border border-line bg-paper-warm p-5">
          <h3 className="mb-1.5 text-[15px] font-semibold">
            Clear the unproven accounts
          </h3>
          <p className="mb-4 text-[14px] text-ink-soft">
            Declining moves {unproven} account
            {unproven === 1 ? "" : "s"} out of the queue. Nothing is deleted and
            nobody is emailed — if one of them ever signs in properly you can
            approve them then.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() =>
                act(
                  pending.filter((r) => r.verification === "unverified").map((r) => r.id),
                  "declined",
                )
              }
              disabled={busy !== null || counts.unverified === 0}
              className="rounded-lg bg-brand px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
            >
              Decline the {counts.unverified} with nothing confirmed
            </button>
            <button
              onClick={() =>
                act(
                  pending.filter((r) => !isRealPerson(r.verification)).map((r) => r.id),
                  "declined",
                )
              }
              disabled={busy !== null || unproven === 0}
              className="rounded-lg border border-line bg-white px-4 py-2 text-[14px] font-semibold transition hover:bg-white/60 disabled:opacity-60"
            >
              Decline all {unproven} unproven
            </button>
          </div>
        </div>
      )}

      {(error || actionError) && (
        <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
          {error || actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {loading ? (
          <div className="p-10 text-center text-[15px] text-ink-soft">
            Loading waitlist…
          </div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-[15px] text-ink-soft">
            {pending.length === 0
              ? "Nobody waiting."
              : "Nobody in that group."}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {visible.slice(0, 50).map((r) => (
              <Row
                key={r.id}
                row={r}
                busy={busy !== null}
                onApprove={() => act([r.id], "approved")}
                onDecline={() => act([r.id], "declined")}
              />
            ))}
          </div>
        )}
      </div>

      {visible.length > 50 && (
        <p className="mt-3 text-[13px] text-ink-soft">
          Showing the first 50 of {visible.length}. Use the cards above to
          narrow the list, or clear them in bulk.
        </p>
      )}
    </div>
  );
}
