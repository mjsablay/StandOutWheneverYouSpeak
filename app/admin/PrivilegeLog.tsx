"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Who changed whose permissions.
 *
 * Added because when a privilege-escalation hole was found (migration 0010)
 * the obvious next question — did anyone use it? — could not be answered.
 * Now it can be, and it matters more since Stripe arrived: a tier that moved
 * without the payment webhook behind it is a paid membership nobody paid for.
 *
 * The rows come from admin_privilege_changes(), which returns nothing at all
 * unless the caller is an admin, so this component cannot leak by accident.
 */

type Change = {
  changed_at: string;
  subject_email: string | null;
  subject_name: string | null;
  actor_email: string | null;
  actor_role: string;
  before: Record<string, string | null>;
  after: Record<string, string | null>;
};

const FIELDS = ["role", "tier", "status"] as const;

/** How the change was made, in words rather than database roles. */
function actorLabel(c: Change): string {
  if (c.actor_email) return c.actor_email;
  if (c.actor_role === "service_role") return "Stripe or an admin API route";
  if (c.actor_role === "authenticated") return "a signed-in account";
  return `direct database access (${c.actor_role})`;
}

/**
 * A change nobody should be able to make from the outside. The service role
 * is our own server; an admin is expected. Anything else changing a
 * privilege is worth a second look.
 */
function isUnexpected(c: Change): boolean {
  return c.actor_role !== "service_role" && !c.actor_email;
}

export default function PrivilegeLog() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_privilege_changes", {
      limit_to: 50,
    });
    if (error) setError(error.message);
    else {
      setError(null);
      setRows((data ?? []) as Change[]);
    }
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

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
          <h2 className="text-lg font-bold">Permission changes</h2>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold hover:bg-paper-warm"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Refresh
        </button>
      </div>
      <p className="mb-5 text-[13.5px] text-ink-soft">
        Every change to someone&apos;s role, tier or waitlist status, and who
        made it. Recorded by the database, so it covers changes made outside
        this console too.
      </p>

      {loading ? (
        <div className="h-20 animate-pulse rounded-xl bg-paper-warm" />
      ) : error ? (
        <p className="text-[14px] text-ink-soft">Couldn&apos;t load it: {error}</p>
      ) : rows.length === 0 ? (
        <p className="text-[14px] text-ink-soft">
          Nothing recorded yet. Changes made from now on appear here.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((c, i) => {
            const changed = FIELDS.filter(
              (f) => c.before?.[f] !== c.after?.[f],
            );
            return (
              <li key={`${c.changed_at}-${i}`} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[14px] font-semibold">
                    {c.subject_name || c.subject_email || "Unknown account"}
                  </span>
                  <span className="text-[12.5px] text-ink-soft">
                    {new Date(c.changed_at).toLocaleString("en-CA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {changed.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-paper-warm px-2.5 py-0.5 text-[12px] font-semibold"
                    >
                      {f} {c.before?.[f] ?? "—"} → {c.after?.[f] ?? "—"}
                    </span>
                  ))}
                  <span className="text-[12.5px] text-ink-soft">
                    by {actorLabel(c)}
                  </span>
                  {isUnexpected(c) && (
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-bold text-accent-ink">
                      Check this one
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
