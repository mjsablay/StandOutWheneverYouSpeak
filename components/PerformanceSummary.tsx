import { PERFORMANCE_LEVELS, monthLabel, performanceLevel, scoreLabel, type PerformanceReport } from "@/lib/performance";

export default function PerformanceSummary({ report, period }: { report: PerformanceReport; period: string }) {
  const { snapshot, presentations, awards } = report;
  const total = awards.filter(a => a.month <= period).reduce((sum, a) => sum + Number(a.points), 0);
  const level = performanceLevel(snapshot.baseline, snapshot.current, total);
  const visible = presentations.filter(p => p.assessed_on.slice(0, 7) <= period.slice(0, 7));
  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-3">
      {[{ label: "Your starting point", value: scoreLabel(snapshot.baseline), note: "Average of your first three presentations" },
        { label: "Current performance", value: scoreLabel(snapshot.current), note: "Best three of your latest five · out of 5" },
        { label: "Awarded performance points", value: total.toFixed(2), note: level }].map(item => <div key={item.label} className="rounded-2xl border border-line bg-white p-6">
          <p className="text-sm text-ink-soft">{item.label}</p><p className="display my-2 text-3xl">{item.value}</p><p className="text-xs text-ink-soft">{item.note}</p>
        </div>)}
    </div>
    <div className="rounded-2xl bg-brand-soft p-6 text-sm leading-relaxed">
      <h2 className="mb-2 font-semibold">Your progress through {monthLabel(period)}</h2>
      {snapshot.count < 3 ? <p>{3 - snapshot.count} more assessed presentation{3 - snapshot.count === 1 ? "" : "s"} will establish your baseline. Baseline presentations do not earn an award.</p>
        : snapshot.current === null ? <p>Your baseline is established. Record {5 - snapshot.count} more presentation{5 - snapshot.count === 1 ? "" : "s"} to complete your first five-presentation window.</p>
        : <p>Change from your baseline: {snapshot.current - snapshot.baseline! >= 0 ? "+" : ""}{scoreLabel(snapshot.current - snapshot.baseline!)}. Improvement helps you see progress; it does not add bonus points.</p>}
      <p className="mt-2">One award per completed month: current performance × 20. A new presentation after your first three is required that month. No new presentation means no award.</p>
    </div>
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="display mb-2 text-xl">Assessed presentations</h2>
      <p className="mb-5 text-sm text-ink-soft">A coach assesses Frame, Staying on Message and Delivery equally. Eye contact is excluded. Text coaching alone does not count as a scored presentation.</p>
      {visible.length === 0 ? <p className="text-sm">Your first assessment will appear here after a coach records it.</p> : <ol className="space-y-4">
        {visible.map((p, index) => <li key={p.id} className="rounded-xl border border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{p.title}</h3><span className="text-xs text-ink-soft">{p.assessed_on}</span></div>
          <p className="my-2 text-xs font-semibold text-brand">{index < 3 ? "Baseline presentation" : "Practice presentation"}{snapshot.presentation_ids.includes(p.id) ? " · Latest five" : ""}{snapshot.current !== null && snapshot.best_ids.includes(p.id) ? " · Best three" : ""}</p>
          <p className="text-sm">Frame {scoreLabel(p.frame)} · Staying on Message {scoreLabel(p.staying)} · Delivery {scoreLabel(p.delivery)} · Overall {scoreLabel((Number(p.frame) + Number(p.staying) + Number(p.delivery)) / 3)}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{p.evidence}</p>
        </li>)}
      </ol>}
    </section>
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-2xl border border-line bg-white p-6"><h2 className="display mb-4 text-xl">Monthly awards</h2>
        {awards.length === 0 ? <p className="text-sm text-ink-soft">No finalized awards yet. A coach reviews and finalizes eligible months after month-end.</p> : <ul className="divide-y divide-line">{awards.map(a => <li key={a.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{monthLabel(a.month)}</span><strong>{Number(a.points).toFixed(2)} points</strong></li>)}</ul>}
      </section>
      <section className="rounded-2xl border border-line bg-white p-6"><h2 className="display mb-4 text-xl">Recognition levels</h2>
        <p className="mb-3 text-sm text-ink-soft">Your current level needs both awarded points and current performance. Novice begins with your baseline.</p>
        <ul className="divide-y divide-line">{[...PERFORMANCE_LEVELS].reverse().map(l => <li key={l.name} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><strong>{l.name}</strong><span>{l.points} points + {l.score.toFixed(1)}/5</span></li>)}</ul>
      </section>
    </div>
  </div>;
}
