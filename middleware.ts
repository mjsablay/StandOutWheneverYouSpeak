import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and guards private routes.
 * Without this, tokens expire and users get silently signed out.
 */

const PROTECTED = [
  "/account",
  "/admin",
  "/messages",
  "/notifications",
  "/checkout",
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
