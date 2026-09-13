"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  NAV_LINKS,
  PRELAUNCH_NAV_LINKS,
  COURSE_LINKS,
  PRELAUNCH,
} from "@/lib/site";
import { useAuth } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import UserMenu from "./UserMenu";

export default function Nav() {
  const pathname = usePathname();
  const { loading } = useAuth();
  const access = useAccess();

  // Pre-launch: the public sees only Home, About Us and Contact. Approved
  // members and admins get the full site — `approved` covers both, and an
  // admin previewing as "pending" or "visitor" correctly loses it.
  const fullSite = !PRELAUNCH || access.approved;
  const links = fullSite ? NAV_LINKS : PRELAUNCH_NAV_LINKS;

  // When an admin previews as a signed-out visitor, hide the account menu.
  const showAsSignedIn = access.signedIn;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <nav className="sticky top-0 z-50 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-6">
        <Link href="/" className="display text-[19px] tracking-[-0.03em]">
          Stand Out<span className="text-accent">.</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 text-[14.5px] font-medium text-ink-soft lg:flex">
          <Link
            href="/"
            className={
              pathname === "/" ? "font-bold text-brand" : "hover:text-ink"
            }
          >
            Home
          </Link>

          {/* Courses dropdown — full site only */}
          {fullSite && (
            <div
              className="relative"
              onMouseEnter={() => setCoursesOpen(true)}
              onMouseLeave={() => setCoursesOpen(false)}
            >
              <Link
                href="/courses"
                className={`inline-flex items-center gap-1.5 ${
                  isActive("/courses")
                    ? "font-bold text-brand"
                    : "hover:text-ink"
                }`}
              >
                Courses <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
              {coursesOpen && (
                <div className="absolute -left-2 top-full flex w-max min-w-[176px] flex-col rounded-2xl border border-line bg-white p-1.5 shadow-lift">
                  {COURSE_LINKS.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="whitespace-nowrap rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink hover:bg-paper-warm"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {links
            .filter((l) => l.href !== "/courses")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  isActive(l.href) ? "font-bold text-brand" : "hover:text-ink"
                }
              >
                {l.label}
              </Link>
            ))}
        </div>

        {/* Fixed-height, right-aligned slot so swapping between the
            signed-out links and the account menu never shifts the layout. */}
        <div className="flex h-[42px] items-center justify-end gap-3">
          {loading ? (
            <div
              aria-hidden
              className="hidden h-[42px] w-[132px] rounded-full bg-paper-warm sm:block"
            />
          ) : showAsSignedIn ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden rounded-full px-4 py-2.5 text-[14.5px] font-semibold text-ink transition hover:bg-paper-soft sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                href="/request"
                className="hidden rounded-full bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white transition hover:bg-brand-dark sm:inline-block"
              >
                {PRELAUNCH ? "Request a place" : "Join free"}
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="rounded-full p-2 text-ink hover:bg-paper-soft lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col px-6 py-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="border-b border-line py-3 text-[15px] font-medium"
            >
              Home
            </Link>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line py-3 text-[15px] font-medium last:border-b-0"
              >
                {l.label}
              </Link>
            ))}
            {showAsSignedIn && fullSite ? (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="mt-4 mb-2 rounded-full bg-brand px-5 py-3 text-center text-[15px] font-semibold text-white"
              >
                My account
              </Link>
            ) : showAsSignedIn ? null : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 rounded-full border border-line px-5 py-3 text-center text-[15px] font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  href="/request"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2.5 mb-2 rounded-full bg-brand px-5 py-3 text-center text-[15px] font-semibold text-white"
                >
                  {PRELAUNCH ? "Request a place" : "Join free"}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
