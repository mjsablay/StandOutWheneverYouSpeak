"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { torontoDate } from "@/lib/performance";
import PerformancePanel from "@/components/PerformancePanel";
type Member = { id: string; display_name: string | null; email: string; tier: string; role: string; status: string };
export default function Performance() {
  const db = useMemo(() => createClient(), []);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [month, setMonth] = useState(torontoDate().slice(0, 7));
  useEffect(() => {
    let active = true;
    db.rpc("admin_waitlist").then(({ data, error }) => {
      if (!active) return;
      if (error) setError(error.message);
      else setMembers((data ?? []) as Member[]);
    });
    return () => { active = false; };
  }, [db]);
  return <div className="space-y-6"><p className="text-sm text-ink-soft">Record human-assessed presentations and finalize monthly performance awards. Lesson activity points remain separate. Existing records stay available if a member changes plans.</p>
    {error && <p role="alert">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Member<select value={selected} onChange={e => setSelected(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-white p-3"><option value="">Choose a member</option>{members.map(m => <option key={m.id} value={m.id}>{m.display_name || m.email} · {m.tier}{m.status !== "approved" ? ` · ${m.status}` : ""}</option>)}</select></label>
      <label className="text-sm">Performance through month<input type="month" value={month} max={torontoDate().slice(0, 7)} onChange={e => setMonth(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-white p-3" /></label></div>
    {selected && /^\d{4}-\d{2}$/.test(month) && <PerformancePanel key={`${selected}-${month}`} subject={selected} period={`${month}-01`} admin />}
  </div>;
}
