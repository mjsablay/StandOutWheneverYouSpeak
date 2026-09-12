import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateRequest,
  type WaitlistRequestInput,
} from "@/lib/waitlist-request";

/**
 * Where a request to join lands.
 *
 * Deliberately does NOT create an account and does NOT send anyone an email.
 * That separation is the whole point: a script that posts here gets a row in a
 * table nobody can read back, rather than an auth user and a magic link sent
 * from our domain. Accounts only ever come into existence when Tori invites
 * someone.
 *
 * The challenge is checked here on the server. Checking it in the browser
 * would be theatre — anything can post to this route directly.
 */

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const secret = () => process.env.TURNSTILE_SECRET_KEY ?? "";

async function challengePassed(token: string | null, ip: string | null) {
  // Not configured yet: behave exactly as before rather than locking the form.
  if (!secret()) return true;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret: secret(), response: token });
    if (ip) body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    // Cloudflare unreachable. Letting a request through beats turning away a
    // real person; the review step is still a human reading the answers.
    return true;
  }
}

const clean = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : null;
};

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const ok = await challengePassed(
    typeof payload.captchaToken === "string" ? payload.captchaToken : null,
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  );
  if (!ok) {
    return NextResponse.json(
      { error: "That verification check didn't pass. Please try again." },
      { status: 400 },
    );
  }

  const input: WaitlistRequestInput = {
    email: (clean(payload.email, 200) ?? "").toLowerCase(),
    first_name: clean(payload.first_name, 50) ?? "",
    last_name: clean(payload.last_name, 50) ?? "",
    context: payload.context as WaitlistRequestInput["context"],
    organisation: clean(payload.organisation, 80),
    role_title: clean(payload.role_title, 80),
    location: clean(payload.location, 80),
    linkedin_url: clean(payload.linkedin_url, 200),
    course_interest:
      payload.course_interest as WaitlistRequestInput["course_interest"],
    goal: clean(payload.goal, 600) ?? "",
    speaking_frequency:
      (payload.speaking_frequency as WaitlistRequestInput["speaking_frequency"]) ||
      null,
    referral: clean(payload.referral, 120),
  };

  const problems = validateRequest(input);
  if (Object.keys(problems).length > 0) {
    return NextResponse.json({ problems }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist_requests").insert(input);

  if (error) {
    // 23505 is the unique index on lower(email).
    if (error.code === "23505") {
      return NextResponse.json({ alreadyRequested: true });
    }
    return NextResponse.json(
      { error: "Something went wrong saving your request. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
