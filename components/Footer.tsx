"use client";

import Link from "next/link";
import { NAV_LINKS, PRELAUNCH_NAV_LINKS, PRELAUNCH } from "@/lib/site";
import { useAccess } from "@/lib/access";

export default function Footer() {
  const access = useAccess();

  const fullSite = !PRELAUNCH || access.approved;
  const links = fullSite ? NAV_LINKS : PRELAUNCH_NAV_LINKS;

  return (
    <footer className="mt-auto border-t border-line bg-paper-soft">
      <div className="mx-auto max-w-[1180px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="display text-[19px] tracking-[-0.03em]">
              Stand Out<span className="text-accent">.</span>
            </Link>
            <p className="mt-3 max-w-[340px] text-[14.5px] leading-relaxed text-ink-soft">
              Barry Kuntz&apos;s Speak with Impact method, made into something
              you can practise any day of the week.
            </p>
          </div>

          <div>
            <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              Explore
            </div>
            <ul className="space-y-2 text-[14.5px]">
              <li>
                <Link href="/" className="hover:text-brand">
                  Home
                </Link>
              </li>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              Get started
            </div>
            <ul className="space-y-2 text-[14.5px]">
              {access.signedIn ? (
                <li>
                  <Link href="/account" className="hover:text-brand">
                    My account
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/request" className="hover:text-brand">
                      Request a place
                    </Link>
                  </li>
                  <li>
                    <Link href="/signin" className="hover:text-brand">
                      Sign in
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/contact" className="hover:text-brand">
                  Book a call
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[13px] text-ink-soft">
          <span>© {new Date().getFullYear()} Stand Out Whenever You Speak</span>
          <span>Toronto, Ontario</span>
        </div>
      </div>
    </footer>
  );
}
