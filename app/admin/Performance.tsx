"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AWARD_STATUS_LABELS, monthLabel, previousTorontoMonth, scoreLabel, torontoDate, type PerformanceOverviewRow } from "@/lib/performance";
import PerformancePanel from "@/components/PerformancePanel";

export default function Performance() {
  const db = useMemo(() => createClient(), []);
  const [result, setResult] = useState<{ month: string; rows: PerformanceOverviewRow[] } | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [month, setMonth] = useState(previousTorontoMonth);
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState({ dirty: false, busy: false });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const reload = useCallback(() => setRevision(n => n + 1), []);
  useEffect(() => {
    let active = true;
    db.rpc("admin_performance_overview", { period: `${month}-01` }).then(({ data, error }) => {
      if (!active) return;
      setError(error?.message ?? "");
      setResult({ month, rows: error ? [] : (data ?? []) as PerformanceOverviewRow[] });
    });
    return () => { active = false; };
  }, [db, month, revision]);
  const ready = result?.month === month;
  const rows = ready ? result.rows : [];
  const needsWork = (r: PerformanceOverviewRow) => !["ready", "finalized", "month_open"].includes(r.award_status);
  const displayed = rows.filter(r => (filter === "all" || (filter === "needs_work" ? needsWork(r) : r.award_status === filter)) && `${r.display_name ?? ""} ${r.email}`.toLowerCase().includes(search.toLowerCase()));
  function canSwitch() {
    if (draft.busy) return false;
    if (draft.dirty && !window.confirm("Discard this unfinished assessment? Choose Cancel to keep editing.")) return false;
    setDraft({ dirty: false, busy: false });
    return true;
  }
  function chooseMember(id: string) {
    if (id !== selected && canSwitch()) setSelected(id);
  }
  return <div className="space-y-6">
    <p className="text-sm text-ink-soft">Review the month, open a member’s assessments, and finalize their award after checking all presentations are recorded. Completed months use Toronto time.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm">Award month<input type="month" value={month} max={torontoDate().slice(0, 7)} disabled={draft.busy} onChange={e => { const value = e.target.value; if (/^\d{4}-\d{2}$/.test(value) && value !== month && canSwitch()) { setMonth(value); setError(""); } }} className="mt-1 w-full rounded-xl border border-line bg-white p-3 disabled:opacity-50" /></label>
      <label className="text-sm">Find a member<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or email" className="mt-1 w-full rounded-xl border border-line bg-white p-3" /></label>
    </div>
    {draft.busy && <p role="status" className="text-sm text-ink-soft">Saving. Please wait before switching member or month.</p>}
    {!ready ? <p role="status">Loading monthly overview…</p> : error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm">Could not load the overview: {error} <button onClick={reload} className="underline">Retry overview</button></div> : <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
        { key: "ready", label: "Ready to finalize", count: rows.filter(r => r.award_status === "ready").length },
        { key: "finalized", label: "Finalized", count: rows.filter(r => r.award_status === "finalized").length },
        { key: "needs_work", label: "Needs assessments", count: rows.filter(needsWork).length },
        { key: "month_open", label: "Waiting for month-end", count: rows.filter(r => r.award_status === "month_open").length },
      ].map(item => <button key={item.key} aria-pressed={filter === item.key} onClick={() => setFilter(filter === item.key ? "all" : item.key)} className={`rounded-2xl border p-4 text-left ${filter === item.key ? "border-brand bg-brand-soft" : "border-line bg-white"}`}><span className="block text-xs text-ink-soft">{item.label}</span><span className="display mt-2 block text-2xl">{item.count}</span></button>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-xl">{monthLabel(month)}</h2><button className="text-sm font-semibold text-brand underline" onClick={() => { setFilter("all"); setSearch(""); }}>Show all members</button></div>
      <p className="text-xs text-ink-soft">Includes approved Circle members and administrators, plus anyone with assessment history. A month without a new post-baseline presentation earns no award.</p>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white">{displayed.map(r => <li key={r.id} className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{r.display_name || r.email}</h3><p className="break-all text-xs text-ink-soft">{r.email}</p></div>
          <button onClick={() => chooseMember(r.id)} disabled={draft.busy} aria-current={selected === r.id ? "true" : undefined} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand disabled:opacity-50">{selected === r.id ? "Selected" : "Review assessments"}<span className="sr-only"> for {r.display_name || r.email}</span></button></div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><strong className={r.award_status === "ready" ? "text-brand" : "text-ink-soft"}>{AWARD_STATUS_LABELS[r.award_status]}</strong><span>{r.presentation_count} assessed · {r.new_presentations} new after baseline this month</span>{r.current_score !== null && <span>Score {scoreLabel(r.current_score)}/5</span>}{["ready", "finalized", "month_open"].includes(r.award_status) && r.points !== null && <span>{scoreLabel(r.points)} {r.award_status === "finalized" ? "points awarded" : "potential points"}</span>}</div>
      </li>)}</ul>
      {displayed.length === 0 && <p className="text-sm text-ink-soft">{rows.length ? "No members match these filters." : "No eligible members or assessment history yet."}</p>}
    </>}
    {selected && <section className="space-y-4 border-t border-line pt-6"><h2 className="display text-2xl">{rows.find(r => r.id === selected)?.display_name || rows.find(r => r.id === selected)?.email || "Selected member"}</h2>
      <PerformancePanel key={`${selected}-${month}`} subject={selected} period={`${month}-01`} admin onDraftStateChange={setDraft} onSaved={reload} />
    </section>}
  </div>;
}
