"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { monthLabel, torontoDate, type PerformanceReport } from "@/lib/performance";
import PerformanceSummary from "./PerformanceSummary";

export default function PerformancePanel({ subject, period, admin = false, onDraftStateChange, onSaved }: { subject: string; period: string; admin?: boolean; onDraftStateChange?: (state: { dirty: boolean; busy: boolean }) => void; onSaved?: () => void }) {
  const db = useMemo(() => createClient(), []);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const submitting = useRef(false);
  useEffect(() => { onDraftStateChange?.({ dirty, busy: saving }); }, [dirty, saving, onDraftStateChange]);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const guardLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest("a[href], [data-performance-navigation]") : null;
      if (!target || target.getAttribute("target") === "_blank" || target.hasAttribute("download") || target.getAttribute("aria-current") === "page") return;
      if (saving || !window.confirm("Discard this unfinished assessment? Choose Cancel to keep editing.")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", guardLink, true); };
  }, [dirty, saving]);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [submission, setSubmission] = useState<{ fingerprint: string; id: string } | null>(null);
  useEffect(() => {
    let active = true;
    db.rpc("performance_report", { subject, period }).then(({ data, error }) => {
      if (!active) return;
      if (error) { setError(error.message); }
      else { setReport(data as PerformanceReport); setError(""); }
    });
    return () => { active = false; };
  }, [db, subject, period, revision]);
  const reload = useCallback(() => setRevision(n => n + 1), []);
  async function record(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const values = { subject, assessed: String(fields.get("date")), presentation_title: String(fields.get("title")), frame_score: Number(fields.get("frame")), staying_score: Number(fields.get("staying")), delivery_score: Number(fields.get("delivery")), assessment_evidence: String(fields.get("evidence")) };
    if (!window.confirm(`Record “${values.presentation_title}” with scores ${values.frame_score}, ${values.staying_score}, ${values.delivery_score}? Records are permanent; corrections need an audited administrator update.`)) return;
    const fingerprint = JSON.stringify(values);
    const id = submission?.fingerprint === fingerprint ? submission.id : crypto.randomUUID();
    submitting.current = true;
    setSubmission({ fingerprint, id }); setSaving(true); setError(""); setNotice("");
    try {
      const { error } = await db.rpc("record_performance_presentation", { ...values, request_id: id });
      if (error) throw error;
      form.reset(); setDirty(false); setSubmission(null); setNotice("Presentation recorded. The member can now see your assessment."); reload(); onSaved?.();
    } catch (e) { setError(e instanceof Error ? e.message : (e as { message?: string }).message ?? "Could not save. Please retry."); }
    finally { submitting.current = false; setSaving(false); }
  }
  async function finalize() {
    if (!report || dirty || submitting.current || !window.confirm(`Finalize ${monthLabel(period)} at ${(report.snapshot.current! * 20).toFixed(2)} points? The award and presentation history through that month will be locked.`)) return;
    submitting.current = true;
    setSaving(true); setError(""); setNotice("");
    try {
      const { error } = await db.rpc("finalize_performance_month", { subject, period });
      if (error) throw error;
      setNotice("Monthly award finalized."); reload(); onSaved?.();
    } catch (e) { setError(e instanceof Error ? e.message : (e as { message?: string }).message ?? "Could not finalize. Please retry."); }
    finally { submitting.current = false; setSaving(false); }
  }
  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm";
  return <div className="space-y-6">
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">{error} <button onClick={reload} className="underline">Retry loading</button></div>}
    {notice && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm">{notice}</p>}
    {!report && !error && <p role="status">Loading performance…</p>}
    {report && <>
      {admin && <>
        <section className="rounded-2xl border border-line bg-white p-6"><h2 className="display text-xl">Finalize {monthLabel(period)}</h2>
          <p className="my-3 text-sm text-ink-soft">Confirm that all assessments for the month are recorded before finalizing. Months follow Toronto time; points are rounded to two decimals.</p>
          {report.awards.some(a => a.month === period) ? <p className="text-sm font-semibold">This month is already finalized.</p>
            : period >= `${torontoDate().slice(0, 7)}-01` ? <p className="text-sm">Available after the month ends.</p>
            : report.snapshot.current === null ? <p className="text-sm">Five scored presentations are required.</p>
            : report.snapshot.new_presentations < 1 ? <p className="text-sm">No new post-baseline presentation this month; no award is due.</p>
            : <button disabled={saving || dirty} onClick={finalize} className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Finalize {(report.snapshot.current * 20).toFixed(2)} points</button>}
        {dirty && <p className="mt-3 text-sm text-ink-soft">Save the unfinished assessment before finalizing this month.</p>}
        </section>
        <form onChange={() => setDirty(true)} onSubmit={record} className="space-y-4 rounded-2xl border border-line bg-white p-6"><h2 className="display text-xl">Record a presentation</h2>
          {dirty && <p role="status" className="text-sm font-semibold text-brand">Unfinished assessment — save before leaving.</p>}
          <p className="text-sm text-ink-soft">Speakers’ Circle scoring pilot. Assess the full presentation, including spoken delivery. Record oldest first. Feedback is visible to the member.</p>
          <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Presentation title<input name="title" required maxLength={160} className={field} /></label>
              <label className="text-sm">Presentation date<input type="date" name="date" required defaultValue={torontoDate()} max={torontoDate()} className={field} /></label></div>
            <div className="grid gap-4 sm:grid-cols-3">{[{ key: "frame", label: "Frame" }, { key: "staying", label: "Staying on Message" }, { key: "delivery", label: "Delivery (no eye contact)" }].map(s => <label key={s.key} className="text-sm">{s.label}<input type="number" name={s.key} min="1" max="5" step="0.1" required className={field} /></label>)}</div>
            <label className="block text-sm">Assessment evidence and next step<textarea name="evidence" required minLength={10} maxLength={2000} rows={4} className={field} placeholder="What did you observe in the full presentation? Give specific evidence for the three scores and one useful next step." /></label>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" required className="mt-1" />I assessed the full presentation, including spoken delivery, and checked these scores.</label>
            <button type="submit" className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white">{saving ? "Saving…" : "Review and record"}</button>
          </fieldset>
        </form>
      </>}
      <PerformanceSummary report={report} period={period} />
    </>}
  </div>;
}
