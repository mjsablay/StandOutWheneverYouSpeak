import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Sends the invitation that turns a waitlist request into an account.
 *
 * This is the only place in the app that creates a user, and it needs the
 * service role key to do it — inviting is an admin operation, so it can never
 * run in the browser. Without the key the route says so plainly rather than
 * failing in a way that looks like a bug; the admin screen then offers to
 * record the invite as sent by hand.
 *
 * Accepting the invite creates the profile, and the link_waitlist_request
 * trigger marks the request 'joined' and copies the answers across.
 */

const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Administrators only." }, { status: 403 });
  }

  // ---- 2. Find the request ----
  const { requestId } = (await request.json().catch(() => ({}))) as {
    requestId?: string;
  };
  if (!requestId) {
    return NextResponse.json({ error: "No request given." }, { status: 400 });
  }

  const { data: req } = await supabase
    .from("waitlist_requests")
    .select("id,email,first_name,last_name,status")
    .eq("id", requestId)
    .maybeSingle();

  if (!req) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  // ---- 3. Invite ----
  if (!serviceKey()) {
    return NextResponse.json(
      {
        needsServiceKey: true,
        error:
          "Set SUPABASE_SERVICE_ROLE_KEY in Vercel to send invitations from here.",
      },
      { status: 501 },
    );
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const origin = new URL(request.url).origin;
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    req.email,
    {
      // The member home greets them and leads with "Start lesson";
      // /account would greet them with a profile form.
      redirectTo: `${origin}/auth/callback?next=/`,
      data: { first_name: req.first_name, last_name: req.last_name },
    },
  );

  if (inviteError) {
    // Already has an account: that is a success for our purposes, they just
    // need to sign in. Record it as invited rather than shouting about it.
    const already = /already (been )?registered|already exists/i.test(
      inviteError.message,
    );
    if (!already) {
      return NextResponse.json({ error: inviteError.message }, { status: 502 });
    }
  }

  // ---- 4. Record it ----
  const { error: updateError } = await supabase
    .from("waitlist_requests")
    .update({
      status: "invited",
      invited_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", req.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
