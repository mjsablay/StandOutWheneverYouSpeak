import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PRELAUNCH } from "@/lib/site";

/**
 * Refreshes the Supabase session on every request, guards private routes,
 * and — while PRELAUNCH is true — keeps everyone except administrators on
 * the waitlist home, About Us and Contact.
 */

const PROTECTED = [
  "/account",
  "/admin",
  "/messages",
  "/notifications",
  "/checkout",
];

/** Reachable by anyone during pre-launch. */
const PRELAUNCH_ALLOWED = [
  "/about",
  "/contact",
  "/signin",
  "/signup",
  "/auth",
];

export async function middleware(request: NextRequest) {
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
  if (PRELAUNCH) {
    const allowed =
      path === "/" || PRELAUNCH_ALLOWED.some((p) => path.startsWith(p));

    if (!allowed) {
      // Only administrators may reach the rest of the site for now.
      let isAdmin = false;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        isAdmin = data?.role === "admin";
      }

      if (!isAdmin) {
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
