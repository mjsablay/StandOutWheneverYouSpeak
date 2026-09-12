"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, ExternalLink, RefreshCw, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  contextLabel,
  courseLabel,
  frequencyLabel,
  REQUEST_STATUS_LABEL,
  type RequestStatus,
  type WaitlistRequest,
} from "@/lib/waitlist-request";

/**
 * The review queue.
 *
 * Requests are shown with the answers front and centre, because the decision
 * is made on what someone wrote, not on when they arrived. Inviting is the
 * only thing here that creates an account.
 */

const FILTERS: (RequestStatus | "all")[] = [
  "new",
  "invited",
  "joined",
  "declined",
  "all",
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  new: "bg-brand-soft text-brand",
  invited: "bg-accent-soft text-accent-ink",
  joined: "bg-accent-soft text-accent-ink",
  declined: "bg-paper-warm text-ink-soft",
};

const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const linkedinHref = (raw: string) =>
  /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="mt-0.5 text-[14px]">{value}</dd>
    </div>
  );
}

export default function Requests({ isAdmin }: { isAdmin: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<WaitlistRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("new");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("waitlist_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as WaitlistRequest[]);
    setLoading(false);
  }, [supabase, isAdmin]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { new: 0, invited: 0, joined: 0, declined: 0 };
    rows.forEach((r) => (c[r.status] += 1));
    return c;
  }, [rows]);

  const visible =
    filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const invite = async (id: string) => {
    setBusy(id);
    setError(null);
    setNeedsKey(false);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      needsServiceKey?: boolean;
    };
    setBusy(null);
    if (json.ok) {
      setRows((r) =>
        r.map((x) =>
          x.id === id
            ? { ...x, status: "invited", invited_at: new Date().toISOString() }
            : x,
        ),
      );
      return;
    }
    if (json.needsServiceKey) setNeedsKey(true);
    setError(json.error ?? "Couldn't send that invitation.");
  };

  const setStatus = async (id: string, status: RequestStatus) => {
    setBusy(id);
    setError(null);
    const { error } = await supabase
      .from("waitlist_requests")
      .update({ status })
      .eq("id", id);
    setBusy(null);
    if (error) setError(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  if (!isAdmin) return null;

  return (
    <div className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">
            Requests to join
          </h2>
          <p className="mt-1 text-[14px] text-ink-soft">
            {loading
              ? "Loading…"
              : counts.new > 0
                ? `${counts.new} waiting on you. Inviting someone creates their account and lets them straight in.`
                : "Nothing waiting. New requests land here."}
          </p>
        </div>
        <button
          onClick={() => load()}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3.5 py-1.5 text-[13.5px] font-semibold hover:bg-paper-warm"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Refresh
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-[13.5px] font-semibold transition ${
              filter === f
                ? "bg-brand text-white"
                : "border border-line bg-white hover:bg-paper-warm"
            }`}
          >
            {f === "all"
              ? "All"
              : `${REQUEST_STATUS_LABEL[f]}${counts[f] ? ` (${counts[f]})` : ""}`}
          </button>
        ))}
      </div>

      {needsKey && (
        <div className="mb-5 rounded-xl border border-line bg-paper-warm p-4 text-[14px]">
          <strong className="font-semibold">
            Invitations can&apos;t be sent from here yet.
          </strong>{" "}
          Add <code className="text-[13px]">SUPABASE_SERVICE_ROLE_KEY</code> in
          Vercel (Supabase → Project Settings → API → service_role). Until then
          you can email the person yourself and mark them invited.
        </div>
      )}

      {error && !needsKey && (
        <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-[15px] text-ink-soft">
          Loading requests…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-[15px] text-ink-soft">
          {filter === "new"
            ? "Nobody waiting — you're all caught up."
            : "Nothing in that group."}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[17px] font-semibold">
                      {r.first_name} {r.last_name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[r.status]}`}
                    >
                      {REQUEST_STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[13.5px] text-ink-soft">
                    <a
                      href={`mailto:${r.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-ink"
                    >
                      <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                      {r.email}
                    </a>
                    {r.linkedin_url && (
                      <a
                        href={linkedinHref(r.linkedin_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-ink"
                      >
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                        LinkedIn
                      </a>
                    )}
                    <span>Asked {dateOf(r.created_at)}</span>
                  </div>
                </div>

                {(r.status === "new" || r.status === "declined") && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => invite(r.id)}
                      disabled={busy !== null}
                      className="rounded-lg bg-brand px-3.5 py-1.5 text-[13.5px] font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                    >
                      {busy === r.id ? "Sending…" : "Invite"}
                    </button>
                    {r.status === "new" && (
                      <button
                        onClick={() => setStatus(r.id, "declined")}
                        disabled={busy !== null}
                        className="rounded-lg border border-line px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:bg-paper-warm disabled:opacity-60"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                )}

                {r.status === "invited" && (
                  <button
                    onClick={() => setStatus(r.id, "new")}
                    disabled={busy !== null}
                    className="rounded-lg border border-line px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:bg-paper-warm disabled:opacity-60"
                  >
                    Put back
                  </button>
                )}
              </div>

              <blockquote className="mb-4 flex gap-3 rounded-xl bg-paper-warm p-4">
                <Quote
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft"
                  strokeWidth={2}
                />
                <p className="text-[14.5px] leading-relaxed">{r.goal}</p>
              </blockquote>

              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="They are" value={contextLabel(r.context)} />
                <Detail
                  label={r.context === "student" ? "School" : "Company"}
                  value={
                    [r.role_title, r.organisation].filter(Boolean).join(" · ") ||
                    null
                  }
                />
                <Detail label="Wants" value={courseLabel(r.course_interest)} />
                <Detail
                  label="Speaks"
                  value={frequencyLabel(r.speaking_frequency)}
                />
                <Detail label="Based in" value={r.location ?? null} />
                <Detail label="Heard via" value={r.referral ?? null} />
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
