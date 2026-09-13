import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PRELAUNCH } from "@/lib/site";

/**
 * Refreshes the Supabase session on every request, guards private routes,
 * and — while PRELAUNCH is true — keeps the public on the waitlist home,
 * About Us and Contact. Administrators and approved members get the whole
 * site: that is what "letting members in a group at a time" means, and it is
 * what an invitation has to lead to.
 *
 * Next.js 16 renamed this file convention from `middleware` to `proxy`; the
 * behaviour is identical. The old name printed a deprecation warning on
 * every start.
 */

const PROTECTED = [
  "/account",
  "/topics",
  "/admin",
  "/messages",
  "/notifications",
  "/checkout",
];

/** Reachable by anyone during pre-launch. */
const PRELAUNCH_ALLOWED = [
  "/about",
  "/contact",
  "/request",
  "/api/waitlist",
  "/signin",
  "/signup",
  "/auth",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not remove: this call refreshes the auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const needsAuth =
    PROTECTED.some((p) => path.startsWith(p)) ||
    /^\/courses\/[^/]+\/lessons\//.test(path);

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // ---- Pre-launch gate ----
  // Only runs the extra role lookup for paths that are actually restricted,
  // so ordinary page loads stay at one auth call.
  if (PRELAUNCH) {
    const allowed =
      path === "/" || PRELAUNCH_ALLOWED.some((p) => path.startsWith(p));

    if (!allowed) {
      // Administrators and approved members may pass. Anyone else — signed
      // out, pending, declined — goes back to the waitlist home. A signed-out
      // visitor can be neither, so skip the lookup for them.
      let admitted = false;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role,status")
          .eq("id", user.id)
          .maybeSingle();
        admitted = data?.role === "admin" || data?.status === "approved";
      }

      if (!admitted) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets, images, videos and downloads.
     */
    "/((?!_next/static|_next/image|favicon.ico|logos|videos|materials|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|pdf|docx)$).*)",
  ],
};
