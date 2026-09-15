"use client";

import { useMemo, useState } from "react";
import { Bot, CircleHelp, LogIn, RefreshCw, ScanLine, Search, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui";
import { initialsOf, ROLE_LABEL, TIER_LABEL, type Role, type Status, type Tier } from "@/lib/mock-auth";
import {
  useWaitlist,
  isRealPerson,
  PROVIDER_LABEL,
  VERIFICATION_LABEL,
  VERIFICATION_MEANING,
  type Verification,
  type WaitlistRow,
} from "@/lib/waitlist";
import PrivilegeLog from "./PrivilegeLog";

/**
 * Every account, one screen. Replaces the old pair — a "members" list and a
 * separate "accounts awaiting approval" triage — with one table that carries
 * the evidence of personhood on each row, and every control an admin has:
 * approve, decline, tier, role.
 *
 * Tier is the pre-Stripe way to make someone a Speakers' Circle member. When
 * Stripe exists, its webhook becomes the only thing that should change it.
 */

const ICON: Record<Verification, typeof ShieldCheck> = {
  oauth: ShieldCheck,
  signed_in: LogIn,
  link_opened: ScanLine,
  unverified: CircleHelp,
};

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-brand-soft text-brand",
  approved: "bg-accent-soft text-accent-ink",
  declined: "bg-paper-warm text-ink-soft",
};

type Filter = "approved" | "pending" | "declined" | "all";

const dateOf = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "never";

export default function Members({ adminId }: { adminId: string }) {
  const { rows, loading, error, reload, setStatus, patch } = useWaitlist(true);
  const [filter, setFilter] = useState<Filter>("approved");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { approved: 0, pending: 0, declined: 0, all: rows.length };
    rows.forEach((r) => (c[r.status] += 1));
    return c;
  }, [rows]);

  const unprovenPending = useMemo(
    () => rows.filter((r) => r.status === "pending" && !isRealPerson(r.verification)),
    [rows],
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .filter((r) => filter === "all" || r.status === filter)
      .filter(
        (r) =>
          !needle ||
          r.email.toLowerCase().includes(needle) ||
          (r.display_name ?? "").toLowerCase().includes(needle),
      )
      .sort((a, b) => (b.last_sign_in_at ?? "").localeCompare(a.last_sign_in_at ?? "") || b.signed_up_at.localeCompare(a.signed_up_at));
  }, [rows, filter, q]);

  const act = async (fn: () => Promise<{ error?: string }>, id: string) => {
    setBusy(id);
    setNote(null);
    const res = await fn();
    if (res.error) setNote(res.error);
    setBusy(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["approved", "pending", "declined", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold capitalize transition ${
                filter === f ? "bg-brand text-white" : "border border-line bg-white hover:bg-paper-soft"
              }`}
            >
              {f} {counts[f] ? <span className="opacity-70">({counts[f]})</span> : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" strokeWidth={2} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or email"
              className="w-[220px] rounded-full border border-line bg-white py-2 pl-9 pr-3.5 text-[14px] outline-none focus:border-transparent focus:ring-2 focus:ring-brand"
            />
          </label>
          <button
            onClick={() => reload()}
            aria-label="Refresh"
            className="rounded-full border border-line bg-white p-2.5 hover:bg-paper-soft"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {filter === "pending" && unprovenPending.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper-soft p-4 text-[14px]">
          <span>
            {unprovenPending.length} of the pending accounts show no evidence of a person — no sign-in, no
            provider. Declining is a status change; nothing is deleted or emailed.
          </span>
          <button
            onClick={() => act(() => setStatus(unprovenPending.map((r) => r.id), "declined"), "bulk")}
            disabled={busy !== null}
            className="rounded-full bg-brand px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            Decline the {unprovenPending.length} unproven
          </button>
        </div>
      )}

      {(error || note) && (
        <div className="rounded-2xl border border-brand bg-brand-soft p-4 text-[14px]">{error || note}</div>
      )}

      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
        {loading ? (
          <div className="p-10 text-center text-[15px] text-ink-soft">Loading accounts…</div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-[15px] text-ink-soft">
            {q ? "No one matches that." : filter === "approved" ? "No approved members yet — invite someone from Requests." : "Nobody here."}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {visible.slice(0, 100).map((r) => (
              <Row key={r.id} row={r} busy={busy} adminId={adminId} act={act} setStatus={setStatus} patch={patch} />
            ))}
          </div>
        )}
      </div>
      {visible.length > 100 && (
        <p className="text-[13px] text-ink-soft">Showing the first 100 of {visible.length} — narrow with the search box.</p>
      )}

      {/* The audit trail for the controls above. */}
      <PrivilegeLog />
    </div>
  );
}

function Row({
  row: r,
  busy,
  adminId,
  act,
  setStatus,
  patch,
}: {
  row: WaitlistRow;
  busy: string | null;
  adminId: string;
  act: (fn: () => Promise<{ error?: string }>, id: string) => Promise<void>;
  setStatus: (ids: string[], status: Status, by?: string) => Promise<{ error?: string }>;
  patch: (id: string, changes: Partial<Pick<WaitlistRow, "tier" | "role">>) => Promise<{ error?: string }>;
}) {
  const Icon = ICON[r.verification];
  const real = isRealPerson(r.verification);
  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-4">
      <Avatar initials={initialsOf(r.display_name || r.email)} size={40} src={r.avatar_url} />

      <div className="min-w-[220px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-semibold">{r.display_name || r.email.split("@")[0]}</span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[r.status]}`}>
            {r.status}
          </span>
          {r.role === "admin" && (
            <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Admin
            </span>
          )}
        </div>
        <div className="text-[13px] text-ink-soft">{r.email}</div>
        <div
          className={`mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium ${real ? "text-accent-ink" : "text-ink-soft"}`}
          title={VERIFICATION_MEANING[r.verification]}
        >
          <Icon className="h-3 w-3" strokeWidth={2.5} />
          {VERIFICATION_LABEL[r.verification]} · {PROVIDER_LABEL[r.provider] ?? r.provider} · last here {dateOf(r.last_sign_in_at)}
          {r.automation_signals.length > 0 && (
            <span className="inline-flex items-center gap-1" title={r.automation_signals.join(" · ")}>
              · <Bot className="h-3 w-3" strokeWidth={2} /> {r.automation_signals.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {r.status !== "approved" && (
          <button
            disabled={busy !== null}
            onClick={() => act(() => setStatus([r.id], "approved", adminId), r.id)}
            className="rounded-full bg-accent px-3.5 py-1.5 text-[13.5px] font-semibold text-ink hover:bg-accent-dark disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {r.status === "pending" && (
          <button
            disabled={busy !== null}
            onClick={() => act(() => setStatus([r.id], "declined"), r.id)}
            className="rounded-full border border-line px-3.5 py-1.5 text-[13.5px] font-semibold hover:bg-paper-soft disabled:opacity-50"
          >
            Decline
          </button>
        )}
        <select
          value={r.tier}
          disabled={busy !== null}
          onChange={(e) => act(() => patch(r.id, { tier: e.target.value as Tier }), r.id)}
          aria-label="Subscription tier"
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[13.5px]"
        >
          {(["free", "circle"] as Tier[]).map((v) => (
            <option key={v} value={v}>{TIER_LABEL[v]}</option>
          ))}
        </select>
        <select
          value={r.role}
          disabled={busy !== null}
          onChange={(e) => act(() => patch(r.id, { role: e.target.value as Role }), r.id)}
          aria-label="Role"
          className="rounded-full border border-line bg-white px-3 py-1.5 text-[13.5px]"
        >
          {(["member", "admin"] as Role[]).map((v) => (
            <option key={v} value={v}>{ROLE_LABEL[v]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
