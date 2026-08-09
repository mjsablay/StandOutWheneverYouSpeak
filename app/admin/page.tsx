"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrap, Section, Avatar, PageSkeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import MeetingRequests from "./MeetingRequests";
import {
  useAuth,
  initialsOf,
  ROLE_LABEL,
  TIER_LABEL,
  type Role,
  type Tier,
  type Status,
} from "@/lib/mock-auth";

type MemberRow = {
  id: string;
  email: string;
  display_name: string | null;
  company: string | null;
  school: string | null;
  role: Role;
  tier: Tier;
  status: Status;
  created_at: string;
};

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-brand-soft text-brand",
  approved: "bg-accent-soft text-accent-ink",
  declined: "bg-paper-warm text-ink-soft",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<MemberRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("pending");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id,email,display_name,company,school,role,tier,status,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as MemberRow[]);
    setFetching(false);
  }, [supabase]);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin?next=/admin");
  }, [loading, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    // Fetch in a microtask so the state updates land outside the effect body.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, load]);

  if (loading || !user) return <PageSkeleton />;

  if (!isAdmin) {
    return (
      <Section>
        <Wrap className="max-w-[560px]">
          <div className="rounded-2xl border border-line bg-white p-10 text-center">
            <div className="mb-3 text-4xl">🔐</div>
            <h1 className="mb-2 text-2xl font-extrabold">Administrators only</h1>
            <p className="mb-6 text-[15px] text-ink-soft">
              This area manages members and access. Ask an administrator if you
              need it.
            </p>
            <Link
              href="/account"
              className="inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Back to my account
            </Link>
          </div>
        </Wrap>
      </Section>
    );
  }

  const patch = async (id: string, changes: Partial<MemberRow>) => {
    setBusy(id);
    setError(null);
    const payload: Record<string, unknown> = { ...changes };
    if (changes.status === "approved") {
      payload.approved_at = new Date().toISOString();
      payload.approved_by = user.id;
    }
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id);
    if (error) setError(error.message);
    else
      setRows((r) =>
        r.map((x) => (x.id === id ? { ...x, ...changes } : x)),
      );
    setBusy(null);
  };

  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    declined: rows.filter((r) => r.status === "declined").length,
    circle: rows.filter((r) => r.tier === "circle").length,
  };

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <Section>
      <Wrap>
        <div className="mb-8">
          <span className="mb-3 inline-block rounded-full bg-ink px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-white">
            Admin
          </span>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
            Waitlist &amp; members
          </h1>
          <p className="mt-2 text-[17px] text-ink-soft">
            Nobody reaches the courses until you approve them here.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Awaiting approval", value: counts.pending, hot: true },
            { label: "Approved", value: counts.approved },
            { label: "Speakers' Circle", value: counts.circle },
            { label: "Declined", value: counts.declined },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border bg-white p-5 ${
                s.hot && s.value > 0 ? "border-brand" : "border-line"
              }`}
            >
              <div className="text-[28px] font-extrabold leading-none">
                {s.value}
              </div>
              <div className="mt-1.5 text-[13px] uppercase tracking-wider text-ink-soft">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <MeetingRequests />

        {error && (
          <div className="mb-5 rounded-xl border border-brand bg-brand-soft p-4 text-[14px]">
            {error}
          </div>
        )}

        <h2 className="mb-4 text-[20px] font-extrabold tracking-tight">
          Members &amp; waitlist
        </h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["pending", "approved", "declined", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-[14px] font-semibold capitalize transition ${
                filter === f
                  ? "bg-brand text-white"
                  : "border border-line bg-white hover:bg-paper-warm"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {fetching ? (
            <div className="p-10 text-center text-[15px] text-ink-soft">
              Loading members…
            </div>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mb-2 text-3xl">
                {filter === "pending" ? "✅" : "🫥"}
              </div>
              <p className="text-[15px] text-ink-soft">
                {filter === "pending"
                  ? "No one waiting — the queue is clear."
                  : `No ${filter} members yet.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {visible.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <Avatar
                    initials={initialsOf(r.display_name || r.email)}
                    size={40}
                    variant={r.status === "approved" ? "accent" : "brand"}
                  />
                  <div className="min-w-[190px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">
                        {r.display_name || r.email.split("@")[0]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[r.status]}`}
                      >
                        {r.status}
                      </span>
                      {r.role === "admin" && (
                        <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-ink-soft">
                      {r.email}
                      {r.company ? ` · ${r.company}` : ""}
                      {r.school ? ` · ${r.school}` : ""}
                    </div>
                  </div>

                  {r.status !== "approved" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "approved" })}
                      className="rounded-lg bg-accent px-4 py-2 text-[14px] font-semibold text-ink transition hover:bg-accent-dark disabled:opacity-50"
                    >
                      {busy === r.id ? "…" : "Approve"}
                    </button>
                  )}
                  {r.status === "pending" && (
                    <button
                      disabled={busy === r.id}
                      onClick={() => patch(r.id, { status: "declined" })}
                      className="rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-warm disabled:opacity-50"
                    >
                      Decline
                    </button>
                  )}

                  <select
                    value={r.tier}
                    onChange={(e) =>
                      patch(r.id, { tier: e.target.value as Tier })
                    }
                    className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px]"
                    aria-label="Subscription"
                  >
                    {(["free", "circle"] as Tier[]).map((v) => (
                      <option key={v} value={v}>
                        {TIER_LABEL[v]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={r.role}
                    onChange={(e) =>
                      patch(r.id, { role: e.target.value as Role })
                    }
                    className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px]"
                    aria-label="Role"
                  >
                    {(["member", "admin"] as Role[]).map((v) => (
                      <option key={v} value={v}>
                        {ROLE_LABEL[v]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-[14px] text-ink-soft">
          Approving someone grants access immediately. They aren&apos;t emailed
          automatically yet — that arrives when transactional email is set up.
        </p>
      </Wrap>
    </Section>
  );
}
