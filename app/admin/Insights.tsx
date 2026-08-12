"use client";

import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  ListChecks,
  Eye,
  AlertCircle,
} from "lucide-react";
import { AREA_LABEL, type InsightArea } from "@/lib/insights";

type Insight = {
  headline: string;
  confidence: "high" | "medium" | "low";
  findings: string[];
  actions: string[];
  watch: string;
};

type State = {
  loading: boolean;
  insight?: Insight;
  metrics?: Record<string, unknown>;
  error?: string;
};

const AREAS: InsightArea[] = [
  "waitlist",
  "meetings",
  "engagement",
  "community",
  "content",
];

const CONFIDENCE_STYLE = {
  high: "bg-accent-soft text-accent-ink",
  medium: "bg-brand-soft text-brand",
  low: "bg-paper-warm text-ink-soft",
} as const;

export default function Insights() {
  const [area, setArea] = useState<InsightArea>("waitlist");
  const [state, setState] = useState<Record<string, State>>({});
  const [showData, setShowData] = useState(false);

  const current = state[area] ?? { loading: false };

  const run = async () => {
    setState((s) => ({ ...s, [area]: { loading: true } }));
    try {
      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area }),
      });
      const json = await res.json();
      setState((s) => ({
        ...s,
        [area]: res.ok
          ? { loading: false, insight: json.insight, metrics: json.metrics }
          : { loading: false, error: json.error, metrics: json.metrics },
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        [area]: {
          loading: false,
          error: err instanceof Error ? err.message : "Request failed.",
        },
      }));
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-paper-warm px-6 py-4">
        <Sparkles className="h-[18px] w-[18px] text-ink-soft" strokeWidth={2} />
        <h2 className="font-semibold">Insights</h2>
        <span className="ml-auto text-[13px] text-ink-soft">
          Analyses your own data — nothing identifying leaves the database
        </span>
      </div>

      {/* Area picker */}
      <div className="flex flex-wrap gap-2 border-b border-line px-6 py-4">
        {AREAS.map((a) => (
          <button
            key={a}
            onClick={() => setArea(a)}
            className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition ${
              area === a
                ? "bg-brand text-white"
                : "border border-line hover:bg-paper-warm"
            }`}
          >
            {AREA_LABEL[a]}
          </button>
        ))}
      </div>

      <div className="p-6">
        {!current.insight && !current.error && !current.loading && (
          <div className="py-8 text-center">
            <TrendingUp
              className="mx-auto mb-3 h-7 w-7 text-ink-soft"
              strokeWidth={1.5}
            />
            <p className="mb-1 text-[15px] font-medium">
              Analyse {AREA_LABEL[area].toLowerCase()}
            </p>
            <p className="mx-auto mb-5 max-w-[420px] text-[14px] text-ink-soft">
              Pulls the current numbers and tells you what they mean and what to
              do next.
            </p>
            <button
              onClick={run}
              className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-brand-dark"
            >
              Generate insights
            </button>
          </div>
        )}

        {current.loading && (
          <div className="py-10 text-center">
            <RefreshCw
              className="mx-auto mb-3 h-6 w-6 animate-spin text-ink-soft"
              strokeWidth={2}
            />
            <p className="text-[14px] text-ink-soft">Reading the numbers…</p>
          </div>
        )}

        {current.error && (
          <div className="rounded-xl border border-brand bg-brand-soft p-5">
            <div className="mb-1.5 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-brand" strokeWidth={2} />
              <span className="text-[14.5px] font-semibold">
                Couldn&apos;t generate insights
              </span>
            </div>
            <p className="text-[14px] text-ink-soft">{current.error}</p>
            {current.metrics && (
              <button
                onClick={() => setShowData((v) => !v)}
                className="mt-3 text-[13.5px] font-semibold text-brand hover:underline"
              >
                {showData ? "Hide" : "Show"} the raw numbers anyway
              </button>
            )}
          </div>
        )}

        {current.insight && (
          <div>
            <div className="mb-5 flex flex-wrap items-start gap-3">
              <p className="flex-1 text-[18px] font-semibold leading-snug">
                {current.insight.headline}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-wide ${
                  CONFIDENCE_STYLE[current.insight.confidence] ??
                  CONFIDENCE_STYLE.low
                }`}
              >
                {current.insight.confidence} confidence
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} />
                  What the data shows
                </div>
                <ul className="space-y-2">
                  {current.insight.findings?.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-[14.5px]">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
                  <ListChecks className="h-4 w-4" strokeWidth={2} />
                  What to do
                </div>
                <ol className="space-y-2">
                  {current.insight.actions?.map((a, i) => (
                    <li key={i} className="flex gap-2.5 text-[14.5px]">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-ink">
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {current.insight.watch && (
              <div className="mt-5 flex gap-2.5 rounded-xl bg-paper-warm p-4 text-[14px]">
                <Eye
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-soft"
                  strokeWidth={2}
                />
                <span>
                  <strong className="font-semibold">Worth watching:</strong>{" "}
                  {current.insight.watch}
                </span>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4">
              <button
                onClick={run}
                className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-[13.5px] font-semibold hover:bg-paper-warm"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                Re-run
              </button>
              <button
                onClick={() => setShowData((v) => !v)}
                className="text-[13.5px] font-semibold text-brand hover:underline"
              >
                {showData ? "Hide" : "Show"} the numbers behind this
              </button>
            </div>
          </div>
        )}

        {showData && current.metrics && (
          <pre className="mt-4 max-h-[320px] overflow-auto rounded-xl bg-ink p-4 text-[12px] leading-relaxed text-white/90">
            {JSON.stringify(current.metrics, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
