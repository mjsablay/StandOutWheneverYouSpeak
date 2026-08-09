"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "new" | "reviewing" | "approved" | "scheduled" | "declined";

type Request = {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  role_title: string | null;
  intent: string;
  team_size: string | null;
  timeframe: string | null;
  prefers: string | null;
  availability: string | null;
  message: string;
  status: Status;
  created_at: string;
};

const INTENT_LABEL: Record<string, string> = {
  individual_coaching: "Individual coaching",
  team_training: "Team training",
  speaking_engagement: "Speaking engagement",
  partnership: "Partnership",
  media: "Media",
  other: "Other",
};

/** Rough commercial weight — highest-value enquiries surface first. */
const INTENT_WEIGHT: Record<string, number> = {
  team_training: 3,
  speaking_engagement: 3,
  partnership: 2,
  individual_coaching: 1,
  media: 1,
  other: 0,
};

const SIZE_WEIGHT: Record<string, number> = {
  "200+": 3,
  "51–200": 2,
  "11–50": 2,
  "2–10": 1,
  "Just me": 0,
};

const TIME_WEIGHT: Record<string, number> = {
  "This month": 2,
  "Next 1–3 months": 1,
  "3–6 months": 0,
  "Just exploring": 0,
};

function score(r: Request) {
  return (
    (INTENT_WEIGHT[r.intent] ?? 0) +
    (SIZE_WEIGHT[r.team_size ?? ""] ?? 0) +
    (TIME_WEIGHT[r.timeframe ?? ""] ?? 0)
  );
}

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-brand text-white",
  reviewing: "bg-brand-soft text-brand",
  approved: "bg-accent-soft text-accent-ink",
  scheduled: "bg-accent text-ink",
  declined: "bg-paper-warm text-ink-soft",
};

export default function MeetingRequests() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("meeting_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as Request[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const setStatus = async (id: string, status: Status) => {
    setBusy(id);
    const { error } = await supabase
      .from("meeting_requests")
      .update({ status })
      .eq("id", id);
    if (error) setError(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    setBusy(null);
  };

  const sorted = [...rows].sort((a, b) => {
    if (a.status === "new" && b.status !== "new") return -1;
    if (b.status === "new" && a.status !== "new") return 1;
    return score(b) - score(a);
  });

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-warm px-6 py-4">
        <h2 className="font-bold">
          Meeting requests
          {newCount > 0 && (
            <span className="ml-2.5 rounded-full bg-brand px-2.5 py-0.5 text-[12px] font-bold text-white">
              {newCount} new
            </span>
          )}
        </h2>
        <span className="text-[13px] text-ink-soft">
          Sorted by opportunity — team training and near-term requests first
        </span>
      </div>

      {error && (
        <div className="border-b border-line bg-brand-soft px-6 py-3 text-[14px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-[15px] text-ink-soft">
          Loading requests…
        </div>
      ) : sorted.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mb-2 text-3xl">📭</div>
          <p className="text-[15px] text-ink-soft">
            No meeting requests yet. They&apos;ll appear here as they come in
            from the Contact page.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {sorted.map((r) => {
            const expanded = open === r.id;
            return (
              <div key={r.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setOpen(expanded ? null : r.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">{r.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[r.status]}`}
                      >
                        {r.status}
                      </span>
                      {score(r) >= 5 && (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold uppercase text-accent-ink">
                          High value
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-soft">
                      {INTENT_LABEL[r.intent] ?? r.intent}
                      {r.organization ? ` · ${r.organization}` : ""}
                      {r.team_size ? ` · ${r.team_size}` : ""}
                      {r.timeframe ? ` · ${r.timeframe}` : ""}
                    </div>
                  </button>

                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent("Your request to meet — Stand Out Whenever You Speak")}`}
                    className="rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold hover:bg-paper-warm"
                  >
                    Reply
                  </a>
                  {r.status !== "scheduled" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => setStatus(r.id, "scheduled")}
                      className="rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-ink hover:bg-accent-dark disabled:opacity-50"
                    >
                      Mark scheduled
                    </button>
                  )}
                  {r.status === "new" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => setStatus(r.id, "declined")}
                      className="rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold text-ink-soft hover:bg-paper-warm disabled:opacity-50"
                    >
                      Decline
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className="mt-4 space-y-3 rounded-xl bg-paper-warm p-5 text-[14px]">
                    <div>
                      <span className="font-semibold">Email:</span> {r.email}
                    </div>
                    {r.role_title && (
                      <div>
                        <span className="font-semibold">Role:</span>{" "}
                        {r.role_title}
                      </div>
                    )}
                    {r.prefers && (
                      <div>
                        <span className="font-semibold">Prefers:</span>{" "}
                        {r.prefers}
                      </div>
                    )}
                    {r.availability && (
                      <div>
                        <span className="font-semibold">Availability:</span>{" "}
                        {r.availability}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Message:</span>
                      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-ink-soft">
                        {r.message}
                      </p>
                    </div>
                    <div className="text-[12.5px] text-ink-soft">
                      Received {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
