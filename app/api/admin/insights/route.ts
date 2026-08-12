import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gatherMetrics,
  AREA_LABEL,
  type InsightArea,
} from "@/lib/insights";

/**
 * Admin insight agent.
 *
 * Flow: verify the caller is an admin → gather aggregated metrics from the
 * database → ask a model to interpret them → return structured findings.
 *
 * The model never sees member names, emails, or full message contents; only
 * counts, rates, and short anonymised excerpts. See lib/insights.ts.
 */

const AREAS: InsightArea[] = [
  "waitlist",
  "meetings",
  "engagement",
  "community",
  "content",
];

const SYSTEM_PROMPT = `You are an analyst for "Stand Out Whenever You Speak", an early-stage online platform teaching public speaking. It runs a waitlist, a free tier (Front Row) and a paid tier (Speakers' Circle, $10 CAD/month).

You will receive aggregated metrics for one area of the business. Interpret them for a non-technical founder.

Rules:
- Be concrete and specific. Cite the actual numbers you were given.
- Say plainly when the data is too thin to conclude anything. Early-stage numbers are often too small to be meaningful — say so rather than inventing a trend.
- Never invent metrics you were not given.
- Prioritise actions by likely impact on revenue or retention.
- Keep it brief. A founder should be able to read it in under a minute.

Respond with JSON only, matching exactly:
{
  "headline": "one sentence, the single most important thing",
  "confidence": "high" | "medium" | "low",
  "findings": ["2-4 short observations, each citing a number"],
  "actions": ["1-3 specific next steps, most impactful first"],
  "watch": "one metric worth tracking from here, and why"
}`;

export async function POST(request: NextRequest) {
  // ---- 1. Authorise ----
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Administrators only." },
      { status: 403 },
    );
  }

  // ---- 2. Validate ----
  const { area } = (await request.json()) as { area?: InsightArea };
  if (!area || !AREAS.includes(area)) {
    return NextResponse.json({ error: "Unknown area." }, { status: 400 });
  }

  // ---- 3. Gather (queries run as the admin, so RLS still applies) ----
  const metrics = await gatherMetrics(supabase, area);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "No OPENAI_API_KEY configured. Add it in Vercel (and .env.local for development) to enable insights.",
        metrics,
      },
      { status: 503 },
    );
  }

  // ---- 4. Interpret ----
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Area: ${AREA_LABEL[area]}\n\nMetrics:\n${JSON.stringify(metrics, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Model request failed (${res.status}).`, detail, metrics },
        { status: 502 },
      );
    }

    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";

    let insight: unknown;
    try {
      insight = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Model returned an unreadable response.", metrics },
        { status: 502 },
      );
    }

    return NextResponse.json({ area, insight, metrics });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Insight request failed.",
        metrics,
      },
      { status: 500 },
    );
  }
}
